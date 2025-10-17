const JWT_SECRET = process.env.JWT_SECRET;

// Usar PostgreSQL se DATABASE_URL estiver disponível, senão SQLite
let db;
if (process.env.DATABASE_URL) {
  const postgresInit = require('../database/postgres-init');
  db = postgresInit.db;
} else {
  const sqliteInit = require('../database/init');
  db = sqliteInit.db;
}

/**
 * Middleware para verificar limites de assinatura
 */
const checkSubscriptionLimits = (action) => {
  return async (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Token de acesso requerido' });
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Apenas administradores podem realizar esta ação' });
      }

      const adminId = decoded.id;
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

      // Buscar assinatura ativa do admin
      const subscriptionQuery = `
        SELECT s.*, sp.max_participants, sp.max_assessments_per_month, sp.type as plan_type
        FROM subscriptions s
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.admin_id = ? AND s.status = 'active' AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
        ORDER BY s.created_at DESC
        LIMIT 1
      `;

      const subscription = await db.get(subscriptionQuery, [adminId]);

      if (!subscription) {
        // Se não tem assinatura ativa, usar plano gratuito
        const freePlanQuery = `SELECT * FROM subscription_plans WHERE type = 'free' LIMIT 1`;
        const freePlan = await db.get(freePlanQuery);
        
        if (!freePlan) {
          return res.status(500).json({ error: 'Plano gratuito não encontrado' });
        }

        // Verificar se pode criar assinatura gratuita
        const existingFreeSubscription = await db.get(
          'SELECT * FROM subscriptions WHERE admin_id = ? AND plan_id = ?',
          [adminId, freePlan.id]
        );

        if (!existingFreeSubscription) {
          // Criar assinatura gratuita automaticamente
          const startDate = new Date().toISOString();
          await db.run(`
            INSERT INTO subscriptions (admin_id, plan_id, status, billing_cycle, started_at)
            VALUES (?, ?, 'active', 'monthly', ?)
          `, [adminId, freePlan.id, startDate]);

          // Criar tracking de uso
          await db.run(`
            INSERT OR REPLACE INTO usage_tracking (admin_id, subscription_id, month_year)
            VALUES (?, (SELECT id FROM subscriptions WHERE admin_id = ? AND plan_id = ? ORDER BY created_at DESC LIMIT 1), ?)
          `, [adminId, adminId, freePlan.id, currentMonth]);
        }

        // Usar limites do plano gratuito
        subscription.max_participants = freePlan.max_participants;
        subscription.max_assessments_per_month = freePlan.max_assessments_per_month;
        subscription.plan_type = 'free';
      }

      // Buscar uso atual do mês
      const usageQuery = `
        SELECT * FROM usage_tracking 
        WHERE admin_id = ? AND month_year = ?
      `;
      const usage = await db.get(usageQuery, [adminId, currentMonth]);

      // Se não existe tracking para este mês, criar
      if (!usage) {
        await db.run(`
          INSERT INTO usage_tracking (admin_id, subscription_id, month_year)
          VALUES (?, ?, ?)
        `, [adminId, subscription.id, currentMonth]);
      }

      // Verificar limites baseado na ação
      let canProceed = true;
      let limitMessage = '';

      switch (action) {
        case 'create_participant':
          const currentParticipants = await db.get(
            'SELECT COUNT(*) as count FROM participants WHERE admin_id = ?',
            [adminId]
          );
          
          if (subscription.max_participants !== -1 && currentParticipants.count >= subscription.max_participants) {
            canProceed = false;
            limitMessage = `Limite de ${subscription.max_participants} participantes atingido. Atualize seu plano para adicionar mais participantes.`;
          }
          break;

        case 'create_assessment':
          if (subscription.max_assessments_per_month !== -1) {
            const currentUsage = await db.get(
              'SELECT assessments_completed FROM usage_tracking WHERE admin_id = ? AND month_year = ?',
              [adminId, currentMonth]
            );
            
            if (currentUsage && currentUsage.assessments_completed >= subscription.max_assessments_per_month) {
              canProceed = false;
              limitMessage = `Limite de ${subscription.max_assessments_per_month} avaliações por mês atingido. Atualize seu plano para avaliações ilimitadas.`;
            }
          }
          break;

        case 'export_report':
          // Verificar se o plano permite exportação
          if (subscription.plan_type === 'free') {
            canProceed = false;
            limitMessage = 'Exportação de relatórios não disponível no plano gratuito. Atualize para o plano Profissional ou Empresarial.';
          }
          break;

        case 'use_api':
          // Verificar se o plano permite uso da API
          if (subscription.plan_type !== 'enterprise') {
            canProceed = false;
            limitMessage = 'Acesso à API disponível apenas no plano Empresarial.';
          }
          break;
      }

      if (!canProceed) {
        return res.status(403).json({ 
          error: 'Limite do plano atingido',
          message: limitMessage,
          plan_type: subscription.plan_type,
          limits: {
            max_participants: subscription.max_participants,
            max_assessments_per_month: subscription.max_assessments_per_month
          }
        });
      }

      // Adicionar informações da assinatura ao request
      req.subscription = subscription;
      req.usage = usage;
      req.currentMonth = currentMonth;

      next();
    } catch (error) {
      console.error('Erro ao verificar limites de assinatura:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

/**
 * Middleware para atualizar contadores de uso
 */
const updateUsageTracking = (action) => {
  return async (req, res, next) => {
    try {
      if (!req.subscription || !req.currentMonth) {
        return next();
      }

      const adminId = req.subscription.admin_id;
      const monthYear = req.currentMonth;

      let updateField = '';
      switch (action) {
        case 'participant_created':
          updateField = 'participants_created = participants_created + 1';
          break;
        case 'assessment_completed':
          updateField = 'assessments_completed = assessments_completed + 1';
          break;
        case 'report_generated':
          updateField = 'reports_generated = reports_generated + 1';
          break;
      }

      if (updateField) {
        await db.run(`
          UPDATE usage_tracking 
          SET ${updateField}, updated_at = datetime('now')
          WHERE admin_id = ? AND month_year = ?
        `, [adminId, monthYear]);
      }

      next();
    } catch (error) {
      console.error('Erro ao atualizar tracking de uso:', error);
      // Não falhar a requisição por erro no tracking
      next();
    }
  };
};

/**
 * Função para obter informações de billing
 */
const getBillingInfo = async (adminId) => {
  try {
    // Buscar assinatura ativa
    const subscriptionQuery = `
      SELECT s.*, sp.*
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.admin_id = ? AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    const subscription = await db.get(subscriptionQuery, [adminId]);
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Buscar uso atual
    const usageQuery = `
      SELECT * FROM usage_tracking 
      WHERE admin_id = ? AND month_year = ?
    `;
    const usage = await db.get(usageQuery, [adminId, currentMonth]);

    // Contar participantes atuais
    const participantsCount = await db.get(
      'SELECT COUNT(*) as count FROM participants WHERE admin_id = ?',
      [adminId]
    );

    return {
      subscription: subscription || null,
      usage: usage || {
        participants_created: participantsCount.count,
        assessments_completed: 0,
        reports_generated: 0
      },
      current_participants: participantsCount.count
    };
  } catch (error) {
    console.error('Erro ao obter informações de billing:', error);
    throw error;
  }
};

module.exports = {
  checkSubscriptionLimits,
  updateUsageTracking,
  getBillingInfo
};
