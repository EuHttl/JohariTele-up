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
    
    try {
      // Criar tabela de administradores
      await client.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Criar tabela de participantes
      await client.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          code VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          has_completed_self_assessment BOOLEAN DEFAULT FALSE,
          has_completed_peer_assessments BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Criar tabela de características
      await client.query(`
        CREATE TABLE IF NOT EXISTS characteristics (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Criar tabela de autoavaliações
      await client.query(`
        CREATE TABLE IF NOT EXISTS self_assessments (
          id SERIAL PRIMARY KEY,
          participant_id INTEGER NOT NULL,
          characteristic_id INTEGER NOT NULL,
          selected BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (participant_id) REFERENCES participants (id),
          FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
          UNIQUE(participant_id, characteristic_id)
        )
      `);

      // Criar tabela de avaliações entre pares
      await client.query(`
        CREATE TABLE IF NOT EXISTS peer_assessments (
          id SERIAL PRIMARY KEY,
          assessor_id INTEGER NOT NULL,
          assessed_id INTEGER NOT NULL,
          characteristic_id INTEGER NOT NULL,
          selected BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assessor_id) REFERENCES participants (id),
          FOREIGN KEY (assessed_id) REFERENCES participants (id),
          FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
          UNIQUE(assessor_id, assessed_id, characteristic_id)
        )
      `);

      // Inserir características se não existirem
      const characteristicsCount = await client.query('SELECT COUNT(*) FROM characteristics');
      if (parseInt(characteristicsCount.rows[0].count) === 0) {
        console.log('📝 Inserindo características da Janela de Johari...');
        
        for (const characteristic of johariCharacteristics) {
          await client.query(
            'INSERT INTO characteristics (name) VALUES ($1)',
            [characteristic]
          );
        }
        console.log('✅ Características inseridas com sucesso!');
      }

      // Verificar se existe administrador
      const adminCount = await client.query('SELECT COUNT(*) FROM admins');
      if (parseInt(adminCount.rows[0].count) === 0) {
        console.log('👤 Criando administrador padrão...');
        
        const bcrypt = require('bcryptjs');
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        
        await client.query(
          'INSERT INTO admins (username, password, name) VALUES ($1, $2, $3)',
          ['admin', defaultPassword, 'Administrador']
        );
        
        console.log('✅ Administrador padrão criado!');
        console.log('👤 Usuário: admin');
        console.log('🔑 Senha: admin123');
      }

      console.log('✅ Banco PostgreSQL inicializado com sucesso!');
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco PostgreSQL:', error);
  }
}

// Wrapper para compatibilidade com SQLite
const db = {
  query: (text, params) => pool.query(text, params),
  get: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows[0] || null;
  },
  all: async (text, params) => {
    const result = await pool.query(text, params);
    return result.rows;
  },
  run: async (text, params) => {
    const result = await pool.query(text, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  },
  exec: async (text) => {
    // Para PostgreSQL, precisamos executar cada comando separadamente
    const commands = text.split(';').filter(cmd => cmd.trim());
    for (const command of commands) {
      if (command.trim()) {
        await pool.query(command.trim());
      }
    }
    return { changes: 1 }; // Simular sucesso
  }
};

module.exports = { db, initializeDatabase };
