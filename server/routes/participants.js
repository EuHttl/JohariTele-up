const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { requireAdminAuth, getAdminIdFromToken } = require('../middleware/adminAuth');
const { checkSubscriptionLimits, updateUsageTracking } = require('../middleware/subscriptionLimits');

// Usar apenas PostgreSQL
const postgresInit = require('../database/postgres-init');
const db = postgresInit.db;

// Função para executar query PostgreSQL diretamente
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

// GET /api/participants - Listar participantes do admin logado
router.get('/', requireAdminAuth, async (req, res) => {
  console.log('📊 GET /api/participants - Buscando participantes do admin:', req.admin.id);
  
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      // Usar PostgreSQL diretamente apenas em produção
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
      console.log('📊 Primeiro participante:', result.rows?.[0] || 'Nenhum');
      res.json(result.rows || []);
    } else {
      // Fallback para SQLite
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
        console.log('📊 Primeiro participante:', rows?.[0] || 'Nenhum');
        res.json(rows || []);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/participants/:code - Buscar participante por código
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  
  console.log('🔍 GET /api/participants/:code - Buscando participante por código:', code);
  
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      // Usar PostgreSQL diretamente apenas em produção
      const result = await queryPostgres(`
        SELECT 
          id, name, email, code,
          has_completed_self_assessment,
          has_completed_peer_assessments
        FROM participants 
        WHERE code = $1
      `, [code]);
      
      console.log('🔍 Resultado da busca PostgreSQL:', result.rows?.length || 0, 'participantes encontrados');
      
      if (!result.rows || result.rows.length === 0) {
        console.log('❌ Participante não encontrado no PostgreSQL');
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      console.log('✅ Participante encontrado no PostgreSQL:', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      // Fallback para SQLite
      const query = `
        SELECT 
          id, name, email, code,
          has_completed_self_assessment,
          has_completed_peer_assessments
        FROM participants 
        WHERE code = ?
      `;

      db.get(query, [code], (err, row) => {
        if (err) {
          console.error('Erro ao buscar participante:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        console.log('🔍 Resultado da busca SQLite:', row ? 'encontrado' : 'não encontrado');
        
        if (!row) {
          console.log('❌ Participante não encontrado no SQLite');
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
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      // Usar PostgreSQL diretamente apenas em produção
      
      // Verificar se já existe participante com esse email para este admin
      const existingUser = await queryPostgres('SELECT id FROM participants WHERE email = $1 AND admin_id = $2', [email, req.admin.id]);
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado para sua organização' });
      }

      // Limite de participantes removido - sem restrições

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
      // Fallback para SQLite
      db.get('SELECT id FROM participants WHERE email = ?', [email], (err, row) => {
        if (err) {
          console.error('Erro ao verificar email:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (row) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Limite de participantes removido - sem restrições
        
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

// PUT /api/participants/:id - Atualizar participante
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      // Usar PostgreSQL diretamente apenas em produção
      const result = await queryPostgres(`
        UPDATE participants 
        SET name = $1, email = $2
        WHERE id = $3
      `, [name, email, id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      res.json({ message: 'Participante atualizado com sucesso' });
    } else {
      // Fallback para SQLite
      const query = `
        UPDATE participants 
        SET name = ?, email = ?
        WHERE id = ?
      `;
      
      db.run(query, [name, email, id], function(err) {
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

// DELETE /api/participants/:id - Deletar participante
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
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
    
    // Depois, deletar o participante
    const deleteParticipant = 'DELETE FROM participants WHERE id = ?';
    
    db.run(deleteParticipant, [id], function(err) {
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
});

// GET /api/participants/stats/overview - Estatísticas gerais
router.get('/stats/overview', async (req, res) => {
  console.log('📊 GET /api/participants/stats/overview - Buscando estatísticas');
  
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      // Usar PostgreSQL diretamente apenas em produção
      const result = await queryPostgres(`
        SELECT 
          COUNT(*) as total_participants,
          SUM(CASE WHEN has_completed_self_assessment = true THEN 1 ELSE 0 END) as completed_self,
          SUM(CASE WHEN has_completed_peer_assessments = true THEN 1 ELSE 0 END) as completed_peer
        FROM participants
      `);
      
      console.log('📊 Estatísticas encontradas:', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      // Fallback para SQLite
      const query = `
        SELECT 
          COUNT(*) as total_participants,
          SUM(CASE WHEN has_completed_self_assessment = 1 THEN 1 ELSE 0 END) as completed_self,
          SUM(CASE WHEN has_completed_peer_assessments = 1 THEN 1 ELSE 0 END) as completed_peer
        FROM participants
      `;
      
      db.get(query, [], (err, row) => {
        if (err) {
          console.error('Erro ao buscar estatísticas:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        console.log('📊 Estatísticas encontradas:', row);
        res.json(row);
      });
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
