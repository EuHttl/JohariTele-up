const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usar banco dinâmico (PostgreSQL ou SQLite)
let db;
if (process.env.DATABASE_URL) {
  const postgresInit = require('../database/postgres-init');
  db = postgresInit.db;
} else {
  const sqliteInit = require('../database/init');
  db = sqliteInit.db;
}

// Pool de conexões PostgreSQL reutilizável
let postgresPool = null;

function getPostgresPool() {
  if (!postgresPool) {
    const { Pool } = require('pg');
    postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return postgresPool;
}

// Função para executar query PostgreSQL diretamente
async function queryPostgres(sql, params = []) {
  if (!process.env.DATABASE_URL) {
    throw new Error('PostgreSQL não configurado');
  }
  
  const pool = getPostgresPool();
  
  try {
    const client = await pool.connect();
    const result = await client.query(sql, params);
    client.release();
    return result; // Retorna o resultado completo com rows
  } catch (error) {
    console.error('Erro na query PostgreSQL:', error);
    throw error;
  }
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET não configurado! Configure a variável de ambiente JWT_SECRET');
  process.exit(1);
}

// POST /api/auth/login - Login unificado para admin e participantes
router.post('/login', async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('🔐 Login attempt started:', { email: req.body.email, timestamp: new Date().toISOString() });
    const { email, password } = req.body;
    
    // Validação de entrada
    if (!email || !password) {
      console.log('❌ Login failed: missing credentials');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Login failed: invalid email format');
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    
    // Validação de tamanho da senha
    if (password.length < 6) {
      console.log('❌ Login failed: password too short');
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
    // Sanitização básica
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedPassword = password.trim();
    
    // Usar PostgreSQL diretamente se disponível
    if (process.env.DATABASE_URL) {
      console.log('🔍 Usando PostgreSQL diretamente...');
      
      try {
        // Buscar admin
        const adminResult = await queryPostgres('SELECT id, username, email, password, name FROM admins WHERE email = $1', [sanitizedEmail]);
        
      if (adminResult && adminResult.rows && adminResult.rows.length > 0) {
          const admin = adminResult.rows[0];
          console.log('✅ Admin encontrado, verificando senha...');
        const isMatch = bcrypt.compareSync(sanitizedPassword, admin.password);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT para admin
        const token = jwt.sign(
          {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        console.log('🎉 Admin login successful!');
        return res.json({
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          },
          message: 'Login realizado com sucesso'
        });
      }
      
      // Se não é admin, tenta como participante
        console.log('🔍 Admin não encontrado, verificando participante...');
        const participantResult = await queryPostgres('SELECT id, name, email, code, password FROM participants WHERE email = $1', [sanitizedEmail]);
        
        if (!participantResult || !participantResult.rows || participantResult.rows.length === 0) {
          console.log('❌ Participante não encontrado ou erro na query');
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const participant = participantResult.rows[0];
        const isMatch = bcrypt.compareSync(password, participant.password);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT para participante
        const token = jwt.sign(
          {
            id: participant.id,
            email: participant.email,
            name: participant.name,
            code: participant.code,
            role: 'participant'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        console.log('🎉 Participant login successful!');
        return res.json({
          token,
          user: {
            id: participant.id,
            email: participant.email,
            name: participant.name,
            code: participant.code,
            role: 'participant'
          },
          message: 'Login realizado com sucesso'
        });
        
      } catch (error) {
        console.error('❌ Erro no login PostgreSQL:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
    
    // Fallback para SQLite (desenvolvimento)
    console.log('🔍 Usando SQLite (desenvolvimento)...');
    const adminSql = 'SELECT id, username, email, password, name FROM admins WHERE email = ?';
    
    db.get(adminSql, [email], (err, admin) => {
      
      if (err) {
        console.error('❌ Erro no login (admin):', err);
        
        // Tratar erro específico de coluna não encontrada
        if (err.code === '42703') {
          console.log('🔄 Tentando login sem coluna email...');
          const adminSqlFallback = 'SELECT id, username, password, name FROM admins WHERE username = $1';
          db.get(adminSqlFallback, [email], (err2, admin2) => {
            if (err2) {
              console.error('❌ Erro no login fallback:', err2);
              return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            if (admin2) {
              console.log('✅ Admin encontrado via username');
              // Continuar com o processo de login usando admin2
              const isMatch = bcrypt.compareSync(password, admin2.password);
              if (!isMatch) {
                console.log('❌ Admin password mismatch');
                return res.status(401).json({ error: 'Credenciais inválidas' });
              }
              
              const token = jwt.sign(
                {
                  id: admin2.id,
                  username: admin2.username,
                  email: email, // Usar o email fornecido
                  name: admin2.name,
                  role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
              );
              
              console.log('🎉 Admin login successful!');
              return res.json({
                token,
                user: {
                  id: admin2.id,
                  username: admin2.username,
                  email: email,
                  name: admin2.name,
                  role: 'admin'
                },
                message: 'Login realizado com sucesso'
              });
            } else {
              // Continuar para verificar como participante
              checkParticipant();
            }
          });
          return;
        }
        
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      // Se encontrou como admin, verifica a senha
      if (admin) {
        const isMatch = bcrypt.compareSync(sanitizedPassword, admin.password);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT para admin
        const token = jwt.sign(
          {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({
          token,
          user: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            name: admin.name,
            role: 'admin'
          },
          message: 'Login realizado com sucesso'
        });
      }
      
      // Se não é admin, tenta como participante
      const participantSql = 'SELECT id, name, email, code, password FROM participants WHERE email = $1';
      
      db.get(participantSql, [email], (err, participant) => {
        if (err) {
          console.error('Erro no login (participant):', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!participant) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const isMatch = bcrypt.compareSync(password, participant.password);
        
        if (!isMatch) {
          return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Gerar token JWT para participante
        const token = jwt.sign(
          {
            id: participant.id,
            email: participant.email,
            name: participant.name,
            code: participant.code,
            role: 'participant'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({
          token,
          user: {
            id: participant.id,
            email: participant.email,
            name: participant.name,
            code: participant.code,
            role: 'participant'
          },
          message: 'Login realizado com sucesso'
        });
      });
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Erro no login:', error);
    console.log(`⏱️ Login falhou após ${duration}ms`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
  
  // Função para verificar participante
  function checkParticipant() {
    const participantSql = 'SELECT id, name, email, code, password FROM participants WHERE email = $1';
    
    db.get(participantSql, [email], (err, participant) => {
      if (err) {
        console.error('Erro no login (participant):', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      if (!participant) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const isMatch = bcrypt.compareSync(password, participant.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT para participante
      const token = jwt.sign(
        {
          id: participant.id,
          email: participant.email,
          name: participant.name,
          code: participant.code,
          role: 'participant'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        token,
        user: {
          id: participant.id,
          email: participant.email,
          name: participant.name,
          code: participant.code,
          role: 'participant'
        },
        message: 'Login realizado com sucesso'
      });
    });
  }
});

// POST /api/auth/register - Registro de novo administrador
router.post('/register', async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('📝 Register attempt started:', { email: req.body.email, timestamp: new Date().toISOString() });
    const { name, email, password, confirmPassword } = req.body;
    
    // Validação de entrada
    if (!name || !email || !password || !confirmPassword) {
      console.log('❌ Register failed: missing fields');
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }
    
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Register failed: invalid email format');
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    
    // Validação de senha
    if (password.length < 6) {
      console.log('❌ Register failed: password too short');
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
    if (password !== confirmPassword) {
      console.log('❌ Register failed: passwords do not match');
      return res.status(400).json({ error: 'Senhas não coincidem' });
    }
    
    // Sanitização básica
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPassword = password.trim();
    
    // Usar PostgreSQL diretamente se disponível
    if (process.env.DATABASE_URL) {
      console.log('🔍 Usando PostgreSQL para registro...');
      
      try {
        // Verificar se email já existe
        const existingAdmin = await queryPostgres('SELECT id FROM admins WHERE email = $1', [sanitizedEmail]);
        
        if (existingAdmin && existingAdmin.rows && existingAdmin.rows.length > 0) {
          console.log('❌ Register failed: email already exists');
          return res.status(400).json({ error: 'Email já está em uso' });
        }
        
        // Hash da senha
        const hashedPassword = bcrypt.hashSync(sanitizedPassword, 10);
        
        // Gerar username único baseado no email
        const username = sanitizedEmail.split('@')[0] + '_' + Date.now().toString().slice(-4);
        
        // Criar admin
        const insertResult = await queryPostgres(`
          INSERT INTO admins (username, email, password, name)
          VALUES ($1, $2, $3, $4)
          RETURNING id, username, email, name, created_at
        `, [username, sanitizedEmail, hashedPassword, sanitizedName]);
        
        const newAdmin = insertResult.rows[0];
        
        console.log('✅ Admin registrado com sucesso:', { id: newAdmin.id, email: newAdmin.email });
        
        // Gerar token JWT para o novo admin
        const token = jwt.sign(
          {
            id: newAdmin.id,
            username: newAdmin.username,
            email: newAdmin.email,
            name: newAdmin.name,
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.status(201).json({
          token,
          user: {
            id: newAdmin.id,
            username: newAdmin.username,
            email: newAdmin.email,
            name: newAdmin.name,
            role: 'admin'
          },
          message: 'Administrador registrado com sucesso'
        });
        
      } catch (error) {
        console.error('❌ Erro no registro PostgreSQL:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
    
    // Fallback para SQLite (desenvolvimento)
    console.log('🔍 Usando SQLite para registro...');
    
    // Verificar se email já existe
    db.get('SELECT id FROM admins WHERE email = ?', [sanitizedEmail], (err, existingAdmin) => {
      if (err) {
        console.error('❌ Erro ao verificar email existente:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      if (existingAdmin) {
        console.log('❌ Register failed: email already exists');
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      
      // Hash da senha
      const hashedPassword = bcrypt.hashSync(sanitizedPassword, 10);
      
      // Gerar username único baseado no email
      const username = sanitizedEmail.split('@')[0] + '_' + Date.now().toString().slice(-4);
      
      // Criar admin
      const insertQuery = `
        INSERT INTO admins (username, email, password, name)
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(insertQuery, [username, sanitizedEmail, hashedPassword, sanitizedName], function(err) {
        if (err) {
          console.error('❌ Erro ao criar admin:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        const newAdminId = this.lastID;
        
        console.log('✅ Admin registrado com sucesso:', { id: newAdminId, email: sanitizedEmail });
        
        // Gerar token JWT para o novo admin
        const token = jwt.sign(
          {
            id: newAdminId,
            username: username,
            email: sanitizedEmail,
            name: sanitizedName,
            role: 'admin'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.status(201).json({
          token,
          user: {
            id: newAdminId,
            username: username,
            email: sanitizedEmail,
            name: sanitizedName,
            role: 'admin'
          },
          message: 'Administrador registrado com sucesso'
        });
      });
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Erro no registro:', error);
    console.log(`⏱️ Registro falhou após ${duration}ms`);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/status - Status da API (para health check)
router.get('/status', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Auth API is running',
    timestamp: new Date().toISOString()
  });
});

// POST /api/auth/verify - Verificar token
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token é obrigatório' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    res.json({
      valid: true,
      user: decoded
    });
  });
});

// Middleware para verificar autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  });
};

module.exports = router;