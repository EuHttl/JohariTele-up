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

// Middleware CORS - permitir TODAS as origens temporariamente
app.use((req, res, next) => {
  // Permitir todas as origens temporariamente
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false'); // Deve ser false quando origin é *
  
  // Log para debug
  console.log('🌐 CORS: Origin recebida:', req.headers.origin);
  console.log('🌐 CORS: Method:', req.method);
  console.log('🌐 CORS: Path:', req.path);
  
  // Responder imediatamente para requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log('🌐 CORS: Respondendo a requisição OPTIONS');
    return res.status(200).end();
  }
  
  next();
});

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
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString()
  });
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

// Middleware para debug de todas as requisições
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path} - ${req.headers.origin || 'no-origin'}`);
  next();
});

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

// Inicializar banco de dados SQLite
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} (Railway: ${process.env.PORT || 'default'})`);
  console.log(`📊 Janela de Johari - Sistema de Avaliação`);
  console.log(`👥 Configurado para 12 participantes`);
  console.log(`🌐 CORS CONFIGURADO PARA TODAS AS ORIGENS`);
  console.log(`🔧 DEPLOY FORÇADO - ${new Date().toISOString()}`);
  console.log(`🌐 CORS CONFIGURADO PARA TODAS AS ORIGENS - URGENTE!`);
});
