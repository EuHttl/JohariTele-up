const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Importar inicialização do SQLite
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS aberto temporariamente para resolver o problema
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importar rotas
const participantsRoutes = require('./routes/participants');
const assessmentsRoutes = require('./routes/assessments');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Janela de Johari API is running',
    timestamp: new Date().toISOString()
  });
});

// Usar rotas
app.use('/api/participants', participantsRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Inicializar banco de dados SQLite
initializeDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Janela de Johari - Sistema de Avaliação`);
  console.log(`👥 Configurado para 15 participantes`);
});
