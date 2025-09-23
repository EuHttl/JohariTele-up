const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Usar PostgreSQL se DATABASE_URL estiver disponível, senão SQLite
let db, initializeDatabase;
if (process.env.DATABASE_URL) {
  console.log('🗄️ Usando PostgreSQL (Railway)');
  const postgresInit = require('./database/postgres-init');
  db = postgresInit.db;
  initializeDatabase = postgresInit.initializeDatabase;
} else {
  console.log('🗄️ Usando SQLite (local)');
  const sqliteInit = require('./database/init');
  db = sqliteInit.db;
  initializeDatabase = sqliteInit.initializeDatabase;
}

const app = express();
const PORT = process.env.PORT || 8080;

// Configuração CORS para produção
const allowedOrigins = [
  'https://johari-tele-up.vercel.app',
  'https://johari-tele-up-git-master-euhttl.vercel.app',
  'http://localhost:3000', // Para desenvolvimento local
  'http://localhost:3001'  // Para desenvolvimento local alternativo
];

// Middleware CORS - DEVE SER O PRIMEIRO MIDDLEWARE
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS: Origin não permitida:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false,
  optionsSuccessStatus: 200 // Para suporte a navegadores legados
}));

// Middleware adicional para debug CORS (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('🌐 CORS: Origin recebida:', req.headers.origin);
    console.log('🌐 CORS: Method:', req.method);
    console.log('🌐 CORS: Path:', req.path);
    next();
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importar rotas
const participantsRoutes = require('./routes/participants');
const assessmentsRoutes = require('./routes/assessments');
const reportsRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Janela de Johari API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite',
    cors: 'Configured for production'
  });
});

// Endpoint para forçar reinicialização do banco (apenas em produção)
app.post('/api/force-init-db', async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    return res.status(403).json({ error: 'Este endpoint só está disponível em produção' });
  }
  
  console.log('🔄 Forçando reinicialização do banco de dados...');
  try {
    await initializeDatabase();
    res.status(200).json({ 
      message: 'Banco de dados reinicializado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao reinicializar banco:', error);
    res.status(500).json({ 
      error: 'Erro ao reinicializar banco de dados',
      details: error.message
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint para verificar configuração do banco
app.get('/api/debug/database', (req, res) => {
  const dbInfo = {
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL ? 'Configurado' : 'Não configurado',
    databaseUrlPreview: process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'Não configurado',
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET ? 'Configurado' : 'Não configurado',
    corsOrigin: process.env.CORS_ORIGIN,
    timestamp: new Date().toISOString()
  };
  
  console.log('🔍 Debug Database Info:', dbInfo);
  res.json(dbInfo);
});

// Endpoint para testar conexão com banco
app.get('/api/debug/test-db', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({
        success: false,
        error: 'DATABASE_URL não configurada',
        message: 'Configure a variável DATABASE_URL no Railway'
      });
    }

    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time');
    
    // Verificar tabela admins
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);
    
    let adminInfo = null;
    if (tableCheck.rows[0].exists) {
      const adminCount = await client.query('SELECT COUNT(*) FROM admins');
      adminInfo = {
        tableExists: true,
        adminCount: parseInt(adminCount.rows[0].count)
      };
    } else {
      adminInfo = {
        tableExists: false,
        adminCount: 0
      };
    }
    
    client.release();
    await pool.end();
    
    res.json({
      success: true,
      message: 'Conexão com banco funcionando',
      currentTime: result.rows[0].current_time,
      adminInfo: adminInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de banco:', error);
    res.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Usar rotas
app.use('/api/participants', participantsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Rota adicional para compatibilidade

// Log de todas as rotas registradas
console.log('🔗 Rotas registradas:');
console.log('  - /api/participants');
console.log('  - /api/assessments');
console.log('  - /api/reports');
console.log('  - /api/admin');
console.log('  - /api/auth');
console.log('  - /auth');

// Middleware para debug de todas as requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`🌐 ${req.method} ${req.path} - ${req.headers.origin || 'no-origin'}`);
    next();
  });
}

// Servir arquivos estáticos do React em produção (APENAS para rotas não-API)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Catch-all handler: send back React's index.html file for non-API routes
  app.get('*', (req, res) => {
    // Só servir HTML para rotas que NÃO começam com /api
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// Inicializar banco de dados
initializeDatabase().then(() => {
  console.log('✅ Banco inicializado com sucesso');
}).catch(error => {
  console.error('❌ Erro na inicialização do banco:', error.message);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} (Railway: ${process.env.PORT || 'default'})`);
  console.log(`📊 Janela de Johari - Sistema de Avaliação`);
  console.log(`👥 Configurado para 12 participantes`);
  console.log(`🌐 CORS CONFIGURADO PARA TODAS AS ORIGENS`);
  console.log(`🔧 DEPLOY FORÇADO - ${new Date().toISOString()}`);
  console.log(`🌐 CORS CONFIGURADO PARA TODAS AS ORIGENS - URGENTE!`);
});
