const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Usar PostgreSQL se DATABASE_URL estiver disponível, senão SQLite
let db;
if (process.env.DATABASE_URL) {
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
    
    // Buscar plano no banco
    const db = require('../database/init').db;
    const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ?', [plan_id]);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    const price = billing_cycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
    const priceInCents = Math.round(price * 100);

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
      success_url: `${process.env.FRONTEND_URL}/app/plans?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/app/plans?canceled=true`,
      metadata: {
        admin_id: req.admin.id.toString(),
        plan_id: plan_id.toString(),
        billing_cycle: billing_cycle
      },
      customer_email: req.admin.email
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
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
    const db = require('../database/init').db;

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { admin_id, plan_id, billing_cycle } = session.metadata;
        
        // Atualizar assinatura no banco
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
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log(`Pagamento bem-sucedido para subscription ${invoice.subscription}`);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log(`Pagamento falhou para subscription ${failedInvoice.subscription}`);
        
        // Opcional: cancelar assinatura após falha
        await db.run(`
          UPDATE subscriptions 
          SET status = 'cancelled', cancelled_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `, [failedInvoice.subscription]);
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await db.run(`
          UPDATE subscriptions 
          SET status = 'cancelled', cancelled_at = datetime('now')
          WHERE stripe_subscription_id = ?
        `, [subscription.id]);
        console.log(`Assinatura cancelada: ${subscription.id}`);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/payments/cancel-subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const db = require('../database/init').db;
    
    // Buscar assinatura ativa
    const subscription = await db.get(`
      SELECT * FROM subscriptions 
      WHERE admin_id = ? AND status = 'active' AND stripe_subscription_id IS NOT NULL
    `, [req.admin.id]);

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    // Cancelar no Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    
    // Atualizar no banco
    await db.run(`
      UPDATE subscriptions 
      SET status = 'cancelled', cancelled_at = datetime('now')
      WHERE id = ?
    `, [subscription.id]);

    res.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
