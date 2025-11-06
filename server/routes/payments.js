const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');

// Detectar qual banco usar
let mongoModels, mongoInit;
let useMongo = false;
let db;

if (process.env.MONGODB_URI || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb'))) {
  useMongo = true;
  mongoInit = require('../database/mongo-init');
  mongoModels = mongoInit.models;
} else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  const postgresInit = require('../database/postgres-init');
  db = postgresInit.db;
} else {
  const sqliteInit = require('../database/init');
  db = sqliteInit.db;
}

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET;
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem acessar esta funcionalidade' });
    }

    req.admin = user;
    next();
  });
};

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan_id, billing_cycle } = req.body;
    
    if (!plan_id || !billing_cycle) {
      return res.status(400).json({ error: 'Plan ID e ciclo de cobrança são obrigatórios' });
    }
    
    let plan;
    
    if (useMongo && mongoModels) {
      // MongoDB
      await mongoInit.ensureConnection();
      
      // Tentar buscar por ObjectId (pode vir como string ou ObjectId)
      if (mongoose.Types.ObjectId.isValid(plan_id)) {
        plan = await mongoModels.SubscriptionPlan.findOne({ 
          _id: new mongoose.Types.ObjectId(plan_id), 
          is_active: true 
        }).lean();
      }
      
      // Se não encontrou por ObjectId, tentar buscar por tipo
      if (!plan) {
        const planType = plan_id.toString().toLowerCase();
        plan = await mongoModels.SubscriptionPlan.findOne({ 
          type: planType, 
          is_active: true 
        }).lean();
      }
      
      // Se ainda não encontrou, buscar todos e tentar por índice (fallback)
      if (!plan) {
        const allPlans = await mongoModels.SubscriptionPlan.find({ is_active: true })
          .sort({ price_monthly: 1 })
          .lean();
        const planIndex = parseInt(plan_id) - 1;
        if (planIndex >= 0 && planIndex < allPlans.length) {
          plan = allPlans[planIndex];
        }
      }
    } else {
      // PostgreSQL/SQLite
      plan = await db.get('SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    }
    
    if (!plan) {
      console.error(`Plano não encontrado: plan_id=${plan_id}, billing_cycle=${billing_cycle}, tipo=${typeof plan_id}`);
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    const price = billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    
    // Se for plano gratuito, não precisa criar sessão de checkout
    if (plan.type === 'free' || price === 0) {
      return res.status(400).json({ 
        error: 'Plano gratuito não requer pagamento. Use a rota /api/subscriptions/upgrade diretamente.' 
      });
    }
    
    const priceInCents = Math.round(price * 100);
    
    // Usar o _id do plano encontrado (MongoDB) ou id (SQL)
    const actualPlanId = useMongo && mongoModels ? plan._id.toString() : plan.id.toString();

    // Criar sessão do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${plan.name} - ${billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}`,
            description: `Plano ${plan.name} do Janela de Johari`
          },
          unit_amount: priceInCents,
          recurring: billing_cycle === 'monthly' ? { interval: 'month' } : { interval: 'year' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'https://johari-tele-up.vercel.app'}/app/plans?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://johari-tele-up.vercel.app'}/app/plans?canceled=true`,
      metadata: {
        admin_id: req.admin.id.toString(),
        plan_id: actualPlanId,
        billing_cycle: billing_cycle
      },
      customer_email: req.admin.email
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

// POST /api/payments/webhook - Webhook do Stripe
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { admin_id, plan_id, billing_cycle } = session.metadata;
        
        if (useMongo && mongoModels) {
          // MongoDB
          await mongoInit.ensureConnection();
          const adminObjectId = new mongoose.Types.ObjectId(admin_id);
          
          // Buscar o plano - pode vir como ObjectId string ou outro formato
          let planObjectId;
          let plan;
          
          if (mongoose.Types.ObjectId.isValid(plan_id)) {
            planObjectId = new mongoose.Types.ObjectId(plan_id);
            plan = await mongoModels.SubscriptionPlan.findById(planObjectId).lean();
          } else {
            // Tentar buscar por tipo
            plan = await mongoModels.SubscriptionPlan.findOne({ 
              type: plan_id.toString().toLowerCase() 
            }).lean();
            if (plan) {
              planObjectId = plan._id;
            }
          }
          
          if (!plan || !planObjectId) {
            console.error(`Plano não encontrado no webhook: plan_id=${plan_id}`);
            return res.status(400).json({ error: 'Plano não encontrado' });
          }
          
          // Cancelar assinaturas ativas anteriores
          await mongoModels.Subscription.updateMany(
            { admin_id: adminObjectId, status: 'active' },
            { 
              status: 'cancelled', 
              cancelled_at: new Date(),
              updated_at: new Date()
            }
          );

          const startDate = new Date();
          let expiresAt = null;
          
          // Verificar se não é gratuito
          if (plan.type !== 'free') {
            const expiryDate = new Date();
            if (billing_cycle === 'monthly') {
              expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            expiresAt = expiryDate;
          }

          await mongoModels.Subscription.create({
            admin_id: adminObjectId,
            plan_id: planObjectId,
            status: 'active',
            billing_cycle,
            started_at: startDate,
            expires_at: expiresAt,
            stripe_subscription_id: session.subscription,
            stripe_customer_id: session.customer
          });

          console.log(`Assinatura criada para admin ${admin_id}, plano ${plan_id}`);
        } else {
          // PostgreSQL/SQLite
          await db.run(`
            UPDATE subscriptions 
            SET status = 'cancelled', cancelled_at = datetime('now')
            WHERE admin_id = ? AND status = 'active'
          `, [admin_id]);

          const startDate = new Date().toISOString();
          let expiresAt = null;
          
          if (plan_id !== '1') { // Não é plano gratuito
            const expiryDate = new Date();
            if (billing_cycle === 'monthly') {
              expiryDate.setMonth(expiryDate.getMonth() + 1);
            } else {
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            expiresAt = expiryDate.toISOString();
          }

          await db.run(`
            INSERT INTO subscriptions (admin_id, plan_id, status, billing_cycle, started_at, expires_at, stripe_subscription_id, stripe_customer_id)
            VALUES (?, ?, 'active', ?, ?, ?, ?, ?)
          `, [admin_id, plan_id, billing_cycle, startDate, expiresAt, session.subscription, session.customer]);

          console.log(`Assinatura criada para admin ${admin_id}, plano ${plan_id}`);
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log(`Pagamento bem-sucedido para subscription ${invoice.subscription}`);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log(`Pagamento falhou para subscription ${failedInvoice.subscription}`);
        
        // Opcional: cancelar assinatura após falha
        if (useMongo && mongoModels) {
          await mongoInit.ensureConnection();
          await mongoModels.Subscription.updateOne(
            { stripe_subscription_id: failedInvoice.subscription },
            { 
              status: 'cancelled', 
              cancelled_at: new Date(),
              updated_at: new Date()
            }
          );
        } else {
          await db.run(`
            UPDATE subscriptions 
            SET status = 'cancelled', cancelled_at = datetime('now')
            WHERE stripe_subscription_id = ?
          `, [failedInvoice.subscription]);
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        if (useMongo && mongoModels) {
          await mongoInit.ensureConnection();
          await mongoModels.Subscription.updateOne(
            { stripe_subscription_id: subscription.id },
            { 
              status: 'cancelled', 
              cancelled_at: new Date(),
              updated_at: new Date()
            }
          );
        } else {
          await db.run(`
            UPDATE subscriptions 
            SET status = 'cancelled', cancelled_at = datetime('now')
            WHERE stripe_subscription_id = ?
          `, [subscription.id]);
        }
        console.log(`Assinatura cancelada: ${subscription.id}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// POST /api/payments/cancel-subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.id;
    let subscription;
    
    if (useMongo && mongoModels) {
      // MongoDB
      await mongoInit.ensureConnection();
      const adminObjectId = new mongoose.Types.ObjectId(adminId);
      
      subscription = await mongoModels.Subscription.findOne({
        admin_id: adminObjectId,
        status: 'active',
        stripe_subscription_id: { $ne: null }
      }).lean();
    } else {
      // PostgreSQL/SQLite
      subscription = await db.get(`
        SELECT * FROM subscriptions 
        WHERE admin_id = ? AND status = 'active' AND stripe_subscription_id IS NOT NULL
      `, [adminId]);
    }

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    // Cancelar no Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    
    // Atualizar no banco
    if (useMongo && mongoModels) {
      await mongoInit.ensureConnection();
      await mongoModels.Subscription.updateOne(
        { _id: subscription._id || new mongoose.Types.ObjectId(subscription.id) },
        { 
          status: 'cancelled', 
          cancelled_at: new Date(),
          updated_at: new Date()
        }
      );
    } else {
      await db.run(`
        UPDATE subscriptions 
        SET status = 'cancelled', cancelled_at = datetime('now')
        WHERE id = ?
      `, [subscription.id]);
    }

    res.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
});

module.exports = router;
