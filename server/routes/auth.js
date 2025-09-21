const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../../johari.db');
const db = new sqlite3.Database(dbPath);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'johari_secret_key_2024';

// POST /api/auth/login - Login do administrador
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const sql = 'SELECT id, username, email, password, name FROM admins WHERE email = ?';
    
    db.get(sql, [email], (err, admin) => {
      if (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      if (!admin) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const isMatch = bcrypt.compareSync(password, admin.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT
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
      
      res.json({
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
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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

// POST /api/auth/participant/login - Login do participante
router.post('/participant/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    const sql = 'SELECT id, name, email, code, password FROM participants WHERE email = ?';
    
    db.get(sql, [email], (err, participant) => {
      if (err) {
        console.error('Erro no login do participante:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }
      
      if (!participant) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      const isMatch = bcrypt.compareSync(password, participant.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }
      
      // Gerar token JWT
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
  } catch (error) {
    console.error('Erro no login do participante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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