const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Usar banco dinâmico (PostgreSQL ou SQLite)
let db;
if (process.env.DATABASE_URL) {
  const postgresInit = require('../database/postgres-init');
  db = postgresInit.db;
} else {
  const sqliteInit = require('../database/init');
  db = sqliteInit.db;
}

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

// GET /api/participants - Listar todos os participantes
router.get('/', async (req, res) => {
  console.log('📊 GET /api/participants - Buscando todos os participantes');
  
  try {
    if (process.env.DATABASE_URL) {
      // Usar PostgreSQL diretamente
      const result = await queryPostgres(`
        SELECT 
          id, name, email, code, 
          has_completed_self_assessment,
          has_completed_peer_assessments,
          created_at
        FROM participants 
        ORDER BY name
      `);
      
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
        ORDER BY name
      `;

      db.all(query, [], (err, rows) => {
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
router.get('/:code', (req, res) => {
  const { code } = req.params;
  
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
    
    if (!row) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    res.json(row);
  });
});

// POST /api/participants - Criar novo participante
router.post('/', async (req, res) => {
  console.log('📝 POST /api/participants - Criando participante');
  console.log('📝 Dados recebidos:', req.body);
  
  const { name, email } = req.body;
  
  if (!name || !email) {
    console.log('📝 Erro: Nome e email são obrigatórios');
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  try {
    if (process.env.DATABASE_URL) {
      // Usar PostgreSQL diretamente
      
      // Verificar se já existe participante com esse email
      const existingUser = await queryPostgres('SELECT id FROM participants WHERE email = $1', [email]);
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Verificar limite de 15 participantes
      const countResult = await queryPostgres('SELECT COUNT(*) as count FROM participants');
      const count = parseInt(countResult.rows[0].count);
      
      if (count >= 15) {
        return res.status(400).json({ error: 'Limite de 15 participantes atingido' });
      }

      // Gerar código único
      const code = uuidv4().substring(0, 8).toUpperCase();
      
      // Criar participante
      const insertResult = await queryPostgres(`
        INSERT INTO participants (name, email, code, password, has_completed_self_assessment, has_completed_peer_assessments)
        VALUES ($1, $2, $3, $4, false, false)
        RETURNING id, created_at
      `, [name, email, code, code.toLowerCase()]);

      const newParticipant = insertResult.rows[0];
      
      console.log('✅ Participante criado com sucesso:', { id: newParticipant.id, name, email, code });
      
      res.status(201).json({
        id: newParticipant.id,
        name,
        email,
        code,
        password: code.toLowerCase(),
        has_completed_self_assessment: false,
        has_completed_peer_assessments: false,
        created_at: newParticipant.created_at,
        message: 'Participante criado com sucesso'
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

        // Verificar limite de 15 participantes
        db.get('SELECT COUNT(*) as count FROM participants', (err, countRow) => {
          if (err) {
            console.error('Erro ao contar participantes:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          
          if (countRow.count >= 15) {
            return res.status(400).json({ error: 'Limite de 15 participantes atingido' });
          }

          // Gerar código único
          const code = uuidv4().substring(0, 8).toUpperCase();
          
          const insertQuery = `
            INSERT INTO participants (name, email, code)
            VALUES (?, ?, ?)
          `;
          
          db.run(insertQuery, [name, email, code], function(err) {
            if (err) {
              console.error('Erro ao criar participante:', err);
              return res.status(500).json({ error: 'Erro interno do servidor' });
            }
            
            res.status(201).json({
              id: this.lastID,
              name,
              email,
              code,
              message: 'Participante criado com sucesso'
            });
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
    if (process.env.DATABASE_URL) {
      // Usar PostgreSQL diretamente
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
router.get('/stats/overview', (req, res) => {
  console.log('📊 GET /api/participants/stats/overview - Buscando estatísticas');
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
});

module.exports = router;
