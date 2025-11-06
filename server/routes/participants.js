const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { requireAdminAuth, getAdminIdFromToken } = require('../middleware/adminAuth');
const { checkSubscriptionLimits, updateUsageTracking } = require('../middleware/subscriptionLimits');
const mongoose = require('mongoose');

// Detectar qual banco usar
let mongoModels;
let useMongo = false;
let db;

if (process.env.MONGODB_URI || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb'))) {
  useMongo = true;
  const mongoInit = require('../database/mongo-init');
  mongoModels = mongoInit.models;
  mongoInit.ensureConnection();
} else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  const postgresInit = require('../database/postgres-init');
  db = postgresInit.db;
} else {
  const sqliteInit = require('../database/init');
  db = sqliteInit.db;
}

// Função para executar query PostgreSQL diretamente (fallback)
async function queryPostgres(sql, params = []) {
  if (!process.env.DATABASE_URL) {
    throw new Error('PostgreSQL não configurado');
  }
  
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query(sql, params);
    client.release();
    await pool.end();
    return result;
  } catch (error) {
    console.error('Erro na query PostgreSQL:', error);
    throw error;
  }
}

// Função auxiliar para converter ObjectId para string
function convertToResponse(doc) {
  if (!doc) return null;
  if (Array.isArray(doc)) {
    return doc.map(d => convertToResponse(d));
  }
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  if (obj.admin_id && obj.admin_id.toString) {
    obj.admin_id = obj.admin_id.toString();
  }
  return obj;
}

// GET /api/participants - Listar participantes do admin logado
router.get('/', requireAdminAuth, async (req, res) => {
  console.log('📊 GET /api/participants - Buscando participantes do admin:', req.admin.id);
  
  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      const participants = await mongoModels.Participant.find({ admin_id: adminId })
        .select('name email code has_completed_self_assessment has_completed_peer_assessments created_at')
        .sort({ name: 1 })
        .lean();
      
      const formatted = participants.map(p => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        code: p.code,
        has_completed_self_assessment: p.has_completed_self_assessment,
        has_completed_peer_assessments: p.has_completed_peer_assessments,
        created_at: p.created_at
      }));
      
      console.log('📊 Participantes encontrados:', formatted.length);
      res.json(formatted);
    } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      // PostgreSQL
      const result = await queryPostgres(`
        SELECT 
          id, name, email, code, 
          has_completed_self_assessment,
          has_completed_peer_assessments,
          created_at
        FROM participants 
        WHERE admin_id = $1
        ORDER BY name
      `, [req.admin.id]);
      
      console.log('📊 Participantes encontrados:', result.rows?.length || 0);
      res.json(result.rows || []);
    } else {
      // SQLite
      const query = `
        SELECT 
          id, name, email, code, 
          has_completed_self_assessment,
          has_completed_peer_assessments,
          created_at
        FROM participants 
        WHERE admin_id = ?
        ORDER BY name
      `;

      db.all(query, [req.admin.id], (err, rows) => {
        if (err) {
          console.error('Erro ao buscar participantes:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        console.log('📊 Participantes encontrados:', rows?.length || 0);
        res.json(rows || []);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/participants/:code - Buscar participante por código (apenas para admin logado)
router.get('/:code', requireAdminAuth, async (req, res) => {
  const { code } = req.params;
  
  console.log('🔍 GET /api/participants/:code - Buscando participante por código:', code, 'para admin:', req.admin.id);
  
  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      const participant = await mongoModels.Participant.findOne({ 
        code: code, 
        admin_id: adminId 
      }).lean();
      
      if (!participant) {
        console.log('❌ Participante não encontrado no MongoDB para este admin');
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      console.log('✅ Participante encontrado no MongoDB:', participant);
      res.json({
        id: participant._id.toString(),
        name: participant.name,
        email: participant.email,
        code: participant.code,
        has_completed_self_assessment: participant.has_completed_self_assessment,
        has_completed_peer_assessments: participant.has_completed_peer_assessments
      });
    } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      // PostgreSQL
      const result = await queryPostgres(`
        SELECT 
          id, name, email, code,
          has_completed_self_assessment,
          has_completed_peer_assessments
        FROM participants 
        WHERE code = $1 AND admin_id = $2
      `, [code, req.admin.id]);
      
      if (!result.rows || result.rows.length === 0) {
        console.log('❌ Participante não encontrado no PostgreSQL para este admin');
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      console.log('✅ Participante encontrado no PostgreSQL:', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      // SQLite
      const query = `
        SELECT 
          id, name, email, code,
          has_completed_self_assessment,
          has_completed_peer_assessments
        FROM participants 
        WHERE code = ? AND admin_id = ?
      `;

      db.get(query, [code, req.admin.id], (err, row) => {
        if (err) {
          console.error('Erro ao buscar participante:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!row) {
          console.log('❌ Participante não encontrado no SQLite para este admin');
          return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        console.log('✅ Participante encontrado no SQLite:', row);
        res.json(row);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar participante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/participants - Criar novo participante
router.post('/', 
  requireAdminAuth, 
  checkSubscriptionLimits('create_participant'),
  async (req, res, next) => {
  console.log('📝 POST /api/participants - Criando participante para admin:', req.admin.id);
  console.log('📝 Dados recebidos:', req.body);
  
  const { name, email } = req.body;
  
  if (!name || !email) {
    console.log('📝 Erro: Nome e email são obrigatórios');
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      
      // Verificar se já existe participante com esse email para este admin
      const existingUser = await mongoModels.Participant.findOne({ 
        email: email, 
        admin_id: adminId 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado para sua organização' });
      }

      // Gerar código único
      const code = uuidv4().substring(0, 8).toUpperCase();
      const password = code; // Senha igual ao código em maiúsculo
      
      // Hash da senha
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Criar participante
      const newParticipant = await mongoModels.Participant.create({
        admin_id: adminId,
        name,
        email,
        code,
        password: hashedPassword,
        has_completed_self_assessment: false,
        has_completed_peer_assessments: false
      });
      
      console.log('✅ Participante criado com sucesso:', { 
        id: newParticipant._id.toString(), 
        name, 
        email, 
        code 
      });
      
      // Atualizar tracking de uso
      const updateUsage = updateUsageTracking('participant_created');
      updateUsage(req, res, () => {
        res.status(201).json({
          id: newParticipant._id.toString(),
          name,
          email,
          code,
          password: code, // Senha igual ao código em maiúsculo
          has_completed_self_assessment: false,
          has_completed_peer_assessments: false,
          created_at: newParticipant.created_at,
          message: 'Participante criado com sucesso'
        });
      });
    } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      // PostgreSQL
      // Verificar se já existe participante com esse email para este admin
      const existingUser = await queryPostgres('SELECT id FROM participants WHERE email = $1 AND admin_id = $2', [email, req.admin.id]);
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado para sua organização' });
      }

      // Gerar código único
      const code = uuidv4().substring(0, 8).toUpperCase();
      const password = code; // Senha igual ao código em maiúsculo
      
      // Hash da senha
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Criar participante
      const insertResult = await queryPostgres(`
        INSERT INTO participants (admin_id, name, email, code, password, has_completed_self_assessment, has_completed_peer_assessments)
        VALUES ($1, $2, $3, $4, $5, false, false)
        RETURNING id, created_at
      `, [req.admin.id, name, email, code, hashedPassword]);

      const newParticipant = insertResult.rows[0];
      
      console.log('✅ Participante criado com sucesso:', { id: newParticipant.id, name, email, code });
      
      // Atualizar tracking de uso
      const updateUsage = updateUsageTracking('participant_created');
      updateUsage(req, res, () => {
        res.status(201).json({
          id: newParticipant.id,
          name,
          email,
          code,
          password: code, // Senha igual ao código em maiúsculo
          has_completed_self_assessment: false,
          has_completed_peer_assessments: false,
          created_at: newParticipant.created_at,
          message: 'Participante criado com sucesso'
        });
      });
    } else {
      // SQLite
      db.get('SELECT id FROM participants WHERE email = ? AND admin_id = ?', [email, req.admin.id], (err, row) => {
        if (err) {
          console.error('Erro ao verificar email:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (row) {
          return res.status(400).json({ error: 'Email já cadastrado para sua organização' });
        }

        // Gerar código único
        const code = uuidv4().substring(0, 8).toUpperCase();
        const password = code; // Senha igual ao código em maiúsculo
        
        // Hash da senha
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        const insertQuery = `
          INSERT INTO participants (admin_id, name, email, code, password)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [req.admin.id, name, email, code, hashedPassword], function(err) {
          if (err) {
            console.error('Erro ao criar participante:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          
          res.status(201).json({
            id: this.lastID,
            name,
            email,
            code,
            password: code, // Senha igual ao código em maiúsculo
            message: 'Participante criado com sucesso'
          });
        });
      });
    }
  } catch (error) {
    console.error('Erro ao criar participante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/participants/:id - Atualizar participante (apenas para admin logado)
router.put('/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      const participantId = new mongoose.Types.ObjectId(id);
      
      const participant = await mongoModels.Participant.findOneAndUpdate(
        { _id: participantId, admin_id: adminId },
        { name, email },
        { new: true }
      );
      
      if (!participant) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      res.json({ message: 'Participante atualizado com sucesso' });
    } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      // PostgreSQL
      const result = await queryPostgres(`
        UPDATE participants 
        SET name = $1, email = $2
        WHERE id = $3 AND admin_id = $4
      `, [name, email, id, req.admin.id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      res.json({ message: 'Participante atualizado com sucesso' });
    } else {
      // SQLite
      const query = `
        UPDATE participants 
        SET name = ?, email = ?
        WHERE id = ? AND admin_id = ?
      `;
      
      db.run(query, [name, email, id, req.admin.id], function(err) {
        if (err) {
          console.error('Erro ao atualizar participante:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        res.json({ message: 'Participante atualizado com sucesso' });
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar participante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/participants/:id - Deletar participante (apenas para admin logado)
router.delete('/:id', requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      const participantId = new mongoose.Types.ObjectId(id);
      
      // Verificar se o participante pertence ao admin
      const participant = await mongoModels.Participant.findOne({ 
        _id: participantId, 
        admin_id: adminId 
      });
      
      if (!participant) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      // Deletar todas as avaliações relacionadas
      await mongoModels.SelfAssessment.deleteMany({ participant_id: participantId });
      await mongoModels.PeerAssessment.deleteMany({ 
        $or: [
          { assessor_id: participantId },
          { assessed_id: participantId }
        ]
      });
      
      // Deletar o participante
      await mongoModels.Participant.deleteOne({ _id: participantId, admin_id: adminId });
      
      res.json({ message: 'Participante e todas as avaliações deletados com sucesso' });
    } else {
      // SQLite/PostgreSQL
      // Primeiro, deletar todas as avaliações relacionadas
      const deleteAssessments = `
        DELETE FROM self_assessments WHERE participant_id = ?;
        DELETE FROM peer_assessments WHERE assessor_id = ? OR assessed_id = ?;
      `;
      
      db.exec(deleteAssessments, [id, id, id], (err) => {
        if (err) {
          console.error('Erro ao deletar avaliações:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        // Depois, deletar o participante (apenas se pertencer ao admin)
        const deleteParticipant = 'DELETE FROM participants WHERE id = ? AND admin_id = ?';
        
        db.run(deleteParticipant, [id, req.admin.id], function(err) {
          if (err) {
            console.error('Erro ao deletar participante:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Participante não encontrado' });
          }
          
          res.json({ message: 'Participante e todas as avaliações deletados com sucesso' });
        });
      });
    }
  } catch (error) {
    console.error('Erro ao deletar participante:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/participants/stats/overview - Estatísticas do admin logado
router.get('/stats/overview', requireAdminAuth, async (req, res) => {
  console.log('📊 GET /api/participants/stats/overview - Buscando estatísticas para admin:', req.admin.id);
  
  try {
    if (useMongo && mongoModels) {
      // MongoDB
      const adminId = new mongoose.Types.ObjectId(req.admin.id);
      
      const stats = await mongoModels.Participant.aggregate([
        { $match: { admin_id: adminId } },
        {
          $group: {
            _id: null,
            total_participants: { $sum: 1 },
            completed_self: {
              $sum: { $cond: ['$has_completed_self_assessment', 1, 0] }
            },
            completed_peer: {
              $sum: { $cond: ['$has_completed_peer_assessments', 1, 0] }
            }
          }
        }
      ]);
      
      const result = stats[0] || {
        total_participants: 0,
        completed_self: 0,
        completed_peer: 0
      };
      
      console.log('📊 Estatísticas encontradas para admin', req.admin.id, ':', result);
      res.json(result);
    } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
      // PostgreSQL
      const result = await queryPostgres(`
        SELECT 
          COUNT(*) as total_participants,
          SUM(CASE WHEN has_completed_self_assessment = true THEN 1 ELSE 0 END) as completed_self,
          SUM(CASE WHEN has_completed_peer_assessments = true THEN 1 ELSE 0 END) as completed_peer
        FROM participants
        WHERE admin_id = $1
      `, [req.admin.id]);
      
      console.log('📊 Estatísticas encontradas para admin', req.admin.id, ':', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      // SQLite
      const query = `
        SELECT 
          COUNT(*) as total_participants,
          SUM(CASE WHEN has_completed_self_assessment = 1 THEN 1 ELSE 0 END) as completed_self,
          SUM(CASE WHEN has_completed_peer_assessments = 1 THEN 1 ELSE 0 END) as completed_peer
        FROM participants
        WHERE admin_id = ?
      `;
      
      db.get(query, [req.admin.id], (err, row) => {
        if (err) {
          console.error('Erro ao buscar estatísticas:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        console.log('📊 Estatísticas encontradas para admin', req.admin.id, ':', row);
        res.json(row);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
