const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET não configurado! Configure a variável de ambiente JWT_SECRET');
  process.exit(1);
}

// Middleware para verificar se o usuário é admin e tem acesso aos dados
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.' });
    }

    // Adicionar informações do admin ao request
    req.admin = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  });
};

// Middleware para verificar se o participante pertence ao admin logado
const requireParticipantAccess = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    if (user.role === 'admin') {
      // Se for admin, adicionar informações do admin ao request
      req.admin = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      };
    } else if (user.role === 'participant') {
      // Se for participante, adicionar informações do participante ao request
      req.participant = {
        id: user.id,
        email: user.email,
        name: user.name,
        code: user.code,
        role: user.role
      };
    } else {
      return res.status(403).json({ error: 'Tipo de usuário não reconhecido' });
    }

    next();
  });
};

// Função auxiliar para obter o admin_id do token
const getAdminIdFromToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'admin' ? decoded.id : null;
  } catch (error) {
    return null;
  }
};

// Função auxiliar para obter o participante_id do token
const getParticipantIdFromToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'participant' ? decoded.id : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  requireAdminAuth,
  requireParticipantAccess,
  getAdminIdFromToken,
  getParticipantIdFromToken
};
