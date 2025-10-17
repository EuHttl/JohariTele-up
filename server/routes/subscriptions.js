const express = require('express');
const router = express.Router();
const { getBillingInfo } = require('../middleware/subscriptionLimits');

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

// GET /api/subscriptions/plans - Listar todos os planos disponíveis
router.get('/plans', async (req, res) => {
  try {
    const plans = await db.all('SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price_monthly ASC');
    
    // Parsear features JSON
    const plansWithFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features)
    }));

    res.json({
      success: true,
      plans: plansWithFeatures
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subscriptions/current - Obter informações da assinatura atual
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const billingInfo = await getBillingInfo(adminId);

    if (!billingInfo.subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        message: 'Nenhuma assinatura ativa encontrada'
      });
    }

    // Parsear features JSON
    const subscription = {
      ...billingInfo.subscription,
      features: JSON.parse(billingInfo.subscription.features)
    };

    res.json({
      success: true,
      hasSubscription: true,
      subscription,
      usage: billingInfo.usage,
      current_participants: billingInfo.current_participants
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura atual:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subscriptions/usage - Obter uso atual
router.get('/usage', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.id;
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    const billingInfo = await getBillingInfo(adminId);
    
    if (!billingInfo.subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura encontrada' });
    }

    const limits = {
      max_participants: billingInfo.subscription.max_participants,
      max_assessments_per_month: billingInfo.subscription.max_assessments_per_month,
      can_export: billingInfo.subscription.type !== 'free',
      can_use_api: billingInfo.subscription.type === 'enterprise',
      can_white_label: billingInfo.subscription.type === 'enterprise',
      has_priority_support: billingInfo.subscription.type !== 'free'
    };

    res.json({
      success: true,
      usage: billingInfo.usage,
      limits,
      current_participants: billingInfo.current_participants,
      plan_type: billingInfo.subscription.type
    });
  } catch (error) {
    console.error('Erro ao buscar uso:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/subscriptions/upgrade - Atualizar plano (simulação)
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { plan_id, billing_cycle } = req.body;
    const adminId = req.admin.id;

    if (!plan_id || !billing_cycle) {
      return res.status(400).json({ error: 'Plan ID e ciclo de cobrança são obrigatórios' });
    }

    // Verificar se o plano existe
    const plan = await db.get('SELECT * FROM subscription_plans WHERE id = ? AND is_active = TRUE', [plan_id]);
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    // Cancelar assinatura atual se existir
    await db.run(`
      UPDATE subscriptions 
      SET status = 'cancelled', cancelled_at = datetime('now'), updated_at = datetime('now')
      WHERE admin_id = ? AND status = 'active'
    `, [adminId]);

    // Criar nova assinatura
    const startDate = new Date().toISOString();
    let expiresAt = null;
    
    if (plan.type !== 'free') {
      const expiryDate = new Date();
      if (billing_cycle === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }
      expiresAt = expiryDate.toISOString();
    }

    const result = await db.run(`
      INSERT INTO subscriptions (admin_id, plan_id, status, billing_cycle, started_at, expires_at)
      VALUES (?, ?, 'active', ?, ?, ?)
    `, [adminId, plan_id, billing_cycle, startDate, expiresAt]);

    // Criar tracking de uso para o novo mês
    const currentMonth = new Date().toISOString().substring(0, 7);
    await db.run(`
      INSERT OR REPLACE INTO usage_tracking (admin_id, subscription_id, month_year)
      VALUES (?, ?, ?)
    `, [adminId, result.lastID, currentMonth]);

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso',
      subscription_id: result.lastID
    });
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/subscriptions/cancel - Cancelar assinatura
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.id;

    const result = await db.run(`
      UPDATE subscriptions 
      SET status = 'cancelled', cancelled_at = datetime('now'), updated_at = datetime('now')
      WHERE admin_id = ? AND status = 'active'
    `, [adminId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/subscriptions/history - Histórico de assinaturas
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    const history = await db.all(`
      SELECT s.*, sp.name as plan_name, sp.type as plan_type
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.admin_id = ?
      ORDER BY s.created_at DESC
    `, [adminId]);

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
