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

      // Verificar se existe administrador
      const adminCount = await client.query('SELECT COUNT(*) FROM admins');
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

module.exports = { db, initializeDatabase };
