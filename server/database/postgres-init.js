const { Pool } = require('pg');

// Configuração do banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Características da Janela de Johari (56 características clássicas)
const johariCharacteristics = [
  'Aceita as pessoas como elas são',
  'Acessível',
  'Adaptável',
  'Afável',
  'Alegre',
  'Ama ser elogiado',
  'Amigável',
  'Apaixonado',
  'Articulado',
  'Atento',
  'Audacioso',
  'Autoconsciente',
  'Bem-humorado',
  'Calmo',
  'Capaz',
  'Carinhoso',
  'Comandante',
  'Compassivo',
  'Competente',
  'Confiável',
  'Consciente',
  'Contemplativo',
  'Controlador',
  'Corajoso',
  'Criativo',
  'Defensivo',
  'Digno de confiança',
  'Direto',
  'Disciplinado',
  'Disposto',
  'Empático',
  'Energético',
  'Extrovertido',
  'Flexível',
  'Gentil',
  'Hábil',
  'Honesto',
  'Idealista',
  'Imaginativo',
  'Independente',
  'Ingênuo',
  'Inspirador',
  'Inteligente',
  'Introspectivo',
  'Introvertido',
  'Líder',
  'Lógico',
  'Lovável',
  'Maturidade',
  'Modesto',
  'Observador',
  'Organizado',
  'Paciente',
  'Poderoso',
  'Pontual',
  'Prudente',
  'Quieto',
  'Reflexivo',
  'Responsável',
  'Seguro de si',
  'Sensível',
  'Sincero',
  'Sorridente',
  'Tímido',
  'Útil',
  'Vigoroso'
];

async function initializeDatabase() {
  console.log('🗄️  Inicializando banco PostgreSQL...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco com sucesso');
    
    try {
      // Criar tabela admins se não existir
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela admins verificada/criada');

      // Criar tabela de participantes
      await client.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          code VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          has_completed_self_assessment BOOLEAN DEFAULT FALSE,
          has_completed_peer_assessments BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          UNIQUE(admin_id, email),
          UNIQUE(admin_id, code)
        )
      `);
      console.log('✅ Tabela participants verificada/criada');

      // Criar tabela de características
      await client.query(`
        CREATE TABLE IF NOT EXISTS characteristics (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela characteristics verificada/criada');

      // Criar tabela de autoavaliações
      await client.query(`
        CREATE TABLE IF NOT EXISTS self_assessments (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          participant_id INTEGER NOT NULL,
          characteristic_id INTEGER NOT NULL,
          selected BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE CASCADE,
          FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
          UNIQUE(participant_id, characteristic_id)
        )
      `);
      console.log('✅ Tabela self_assessments verificada/criada');

      // Criar tabela de avaliações entre pares
      await client.query(`
        CREATE TABLE IF NOT EXISTS peer_assessments (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          assessor_id INTEGER NOT NULL,
          assessed_id INTEGER NOT NULL,
          characteristic_id INTEGER NOT NULL,
          selected BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          FOREIGN KEY (assessor_id) REFERENCES participants (id) ON DELETE CASCADE,
          FOREIGN KEY (assessed_id) REFERENCES participants (id) ON DELETE CASCADE,
          FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
          UNIQUE(assessor_id, assessed_id, characteristic_id)
        )
      `);
      console.log('✅ Tabela peer_assessments verificada/criada');

      // Criar tabela de planos de assinatura
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('free', 'professional', 'enterprise')),
          price_monthly DECIMAL(10,2) DEFAULT 0,
          price_yearly DECIMAL(10,2) DEFAULT 0,
          max_participants INTEGER NOT NULL,
          max_assessments_per_month INTEGER NOT NULL,
          features TEXT NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela subscription_plans verificada/criada');

      // Criar tabela de assinaturas
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          plan_id INTEGER NOT NULL,
          status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
          billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
          started_at TIMESTAMP NOT NULL,
          expires_at TIMESTAMP,
          cancelled_at TIMESTAMP,
          stripe_subscription_id VARCHAR(255),
          stripe_customer_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
        )
      `);
      console.log('✅ Tabela subscriptions verificada/criada');

      // Criar tabela de uso (tracking de limites)
      await client.query(`
        CREATE TABLE IF NOT EXISTS usage_tracking (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER NOT NULL,
          subscription_id INTEGER NOT NULL,
          month_year VARCHAR(7) NOT NULL,
          participants_created INTEGER DEFAULT 0,
          assessments_completed INTEGER DEFAULT 0,
          reports_generated INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
          FOREIGN KEY (subscription_id) REFERENCES subscriptions (id),
          UNIQUE(admin_id, month_year)
        )
      `);
      console.log('✅ Tabela usage_tracking verificada/criada');

      // Verificar se existe administrador
      const adminCount = await client.query('SELECT COUNT(*) as count FROM admins');
      console.log(`📊 Total de administradores: ${adminCount.rows[0].count}`);
      
      if (parseInt(adminCount.rows[0].count) === 0) {
        console.log('➕ Criando administrador padrão...');
        
        const bcrypt = require('bcryptjs');
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        
        await client.query(
          'INSERT INTO admins (username, password, name, email) VALUES ($1, $2, $3, $4)',
          ['admin', defaultPassword, 'Hyttalo Costa', 'hyttalo2002@gmail.com']
        );
        
        console.log('✅ Administrador padrão criado!');
        console.log('👤 Email: hyttalo2002@gmail.com');
        console.log('🔑 Senha: admin123');
      } else {
        console.log('ℹ️ Administrador já existe no banco');
      }

      // Inserir características se não existirem
      const characteristicsCount = await client.query('SELECT COUNT(*) as count FROM characteristics');
      console.log(`📊 Total de características: ${characteristicsCount.rows[0].count}`);
      
      if (parseInt(characteristicsCount.rows[0].count) === 0) {
        console.log('➕ Inserindo características...');
        
        for (const characteristic of johariCharacteristics) {
          await client.query('INSERT INTO characteristics (name) VALUES ($1)', [characteristic]);
        }
        
        console.log('✅ Características inseridas com sucesso!');
      }

      // Inserir planos de assinatura se não existirem
      const plansCount = await client.query('SELECT COUNT(*) as count FROM subscription_plans');
      console.log(`📊 Total de planos: ${plansCount.rows[0].count}`);
      
      if (parseInt(plansCount.rows[0].count) === 0) {
        console.log('➕ Inserindo planos de assinatura...');
        
        const plans = [
          {
            name: 'Gratuito',
            type: 'free',
            price_monthly: 0,
            price_yearly: 0,
            max_participants: 5,
            max_assessments_per_month: 1,
            features: JSON.stringify([
              'Até 5 participantes',
              '1 avaliação por mês',
              'Relatórios básicos',
              'Suporte por email'
            ])
          },
          {
            name: 'Profissional',
            type: 'professional',
            price_monthly: 97,
            price_yearly: 970,
            max_participants: 25,
            max_assessments_per_month: -1,
            features: JSON.stringify([
              'Até 25 participantes',
              'Avaliações ilimitadas',
              'Relatórios completos',
              'Exportação PDF/Excel',
              'Notificações automáticas',
              'Suporte prioritário'
            ])
          },
          {
            name: 'Empresarial',
            type: 'enterprise',
            price_monthly: 197,
            price_yearly: 1970,
            max_participants: -1,
            max_assessments_per_month: -1,
            features: JSON.stringify([
              'Participantes ilimitados',
              'Avaliações ilimitadas',
              'Relatórios premium',
              'Análise de equipe',
              'API de integração',
              'White-label',
              'Suporte 24/7'
            ])
          }
        ];

        for (const plan of plans) {
          await client.query(`
            INSERT INTO subscription_plans (name, type, price_monthly, price_yearly, max_participants, max_assessments_per_month, features) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            plan.name,
            plan.type,
            plan.price_monthly,
            plan.price_yearly,
            plan.max_participants,
            plan.max_assessments_per_month,
            plan.features
          ]);
        }
        
        console.log('✅ Planos de assinatura inseridos com sucesso!');
      }

      console.log('✅ Banco PostgreSQL inicializado com sucesso!');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco PostgreSQL:', error);
  }
}

// Função para converter sintaxe SQLite (?) para PostgreSQL ($1, $2, etc.)
function convertSQLiteToPostgres(sql, params = []) {
  let paramIndex = 1;
  const convertedSQL = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { sql: convertedSQL, params };
}

// Wrapper para compatibilidade com SQLite
const db = {
  query: (text, params) => {
    const { sql, params: convertedParams } = convertSQLiteToPostgres(text, params);
    return pool.query(sql, convertedParams);
  },
  get: async (text, params = []) => {
    try {
      const { sql, params: convertedParams } = convertSQLiteToPostgres(text, params);
      const result = await pool.query(sql, convertedParams);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro na query get:', error);
      throw error;
    }
  },
  all: async (text, params = []) => {
    try {
      const { sql, params: convertedParams } = convertSQLiteToPostgres(text, params);
      const result = await pool.query(sql, convertedParams);
      return result.rows;
    } catch (error) {
      console.error('Erro na query all:', error);
      throw error;
    }
  },
  run: async (text, params = []) => {
    try {
      const { sql, params: convertedParams } = convertSQLiteToPostgres(text, params);
      
      // Para INSERTs, adicionar RETURNING id para obter o ID inserido
      let finalSQL = sql;
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        finalSQL = sql + ' RETURNING id';
      }
      
      const result = await pool.query(finalSQL, convertedParams);
      return {
        lastID: result.rows[0]?.id,
        changes: result.rowCount
      };
    } catch (error) {
      console.error('Erro na query run:', error);
      throw error;
    }
  },
  exec: async (text) => {
    try {
      // Para PostgreSQL, precisamos executar cada comando separadamente
      const commands = text.split(';').filter(cmd => cmd.trim());
      for (const command of commands) {
        if (command.trim()) {
          await pool.query(command.trim());
        }
      }
      return { changes: 1 }; // Simular sucesso
    } catch (error) {
      console.error('Erro na query exec:', error);
      throw error;
    }
  }
};

module.exports = { db, initializeDatabase, pool };
