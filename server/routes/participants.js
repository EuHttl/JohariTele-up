const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { v4: uuidv4 } = require('uuid');

// GET /api/participants - Listar todos os participantes
router.get('/', (req, res) => {
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
    res.json(rows);
  });
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
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

  // Verificar se já existe participante com esse email
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
});

// PUT /api/participants/:id - Atualizar participante
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e email são obrigatórios' });
  }

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
    
    res.json(row);
  });
});

module.exports = router;
