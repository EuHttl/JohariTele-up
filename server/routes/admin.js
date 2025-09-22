const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// GET /api/admin/assessment-tracking - Rastreamento de avaliações entre pares
router.get('/assessment-tracking', (req, res) => {
  const query = `
    SELECT 
      p1.id as assessor_id,
      p1.name as assessor_name,
      p1.code as assessor_code,
      p2.id as assessed_id,
      p2.name as assessed_name,
      p2.code as assessed_code,
      COUNT(DISTINCT pa.characteristic_id) as characteristics_evaluated,
      pa.created_at as last_evaluation_date,
      CASE 
        WHEN COUNT(DISTINCT pa.characteristic_id) = 56 THEN 'Completa'
        WHEN COUNT(DISTINCT pa.characteristic_id) > 0 THEN 'Parcial'
        ELSE 'Não iniciada'
      END as evaluation_status
    FROM participants p1
    CROSS JOIN participants p2
    LEFT JOIN peer_assessments pa ON pa.assessor_id = p1.id AND pa.assessed_id = p2.id
    WHERE p1.id != p2.id
    GROUP BY p1.id, p1.name, p1.code, p2.id, p2.name, p2.code, pa.created_at
    ORDER BY p1.name, p2.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar rastreamento de avaliações:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    // Agrupar por avaliador
    const groupedData = rows.reduce((acc, row) => {
      const assessorKey = `${row.assessor_id}-${row.assessor_name}`;
      if (!acc[assessorKey]) {
        acc[assessorKey] = {
          assessor: {
            id: row.assessor_id,
            name: row.assessor_name,
            code: row.assessor_code
          },
          evaluations: []
        };
      }
      
      acc[assessorKey].evaluations.push({
        assessed: {
          id: row.assessed_id,
          name: row.assessed_name,
          code: row.assessed_code
        },
        characteristics_evaluated: row.characteristics_evaluated,
        last_evaluation_date: row.last_evaluation_date,
        status: row.evaluation_status
      });
      
      return acc;
    }, {});
    
    res.json({
      summary: {
        total_possible_evaluations: rows.length,
        completed_evaluations: rows.filter(r => r.characteristics_evaluated === 56).length,
        partial_evaluations: rows.filter(r => r.characteristics_evaluated > 0 && r.characteristics_evaluated < 56).length,
        not_started: rows.filter(r => r.characteristics_evaluated === 0).length
      },
      evaluations: Object.values(groupedData)
    });
  });
});

// GET /api/admin/assessment-matrix - Matriz de avaliações (quem avaliou quem)
router.get('/assessment-matrix', (req, res) => {
  const query = `
    SELECT 
      p1.name as assessor_name,
      p2.name as assessed_name,
      COUNT(DISTINCT pa.characteristic_id) as characteristics_count,
      CASE 
        WHEN COUNT(DISTINCT pa.characteristic_id) = 56 THEN '✅'
        WHEN COUNT(DISTINCT pa.characteristic_id) > 0 THEN '🟡'
        ELSE '❌'
      END as status_icon
    FROM participants p1
    CROSS JOIN participants p2
    LEFT JOIN peer_assessments pa ON pa.assessor_id = p1.id AND pa.assessed_id = p2.id
    WHERE p1.id != p2.id
    GROUP BY p1.id, p1.name, p2.id, p2.name
    ORDER BY p1.name, p2.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar matriz de avaliações:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    // Criar matriz
    const participants = [...new Set(rows.map(r => r.assessor_name))].sort();
    const matrix = participants.map(assessor => {
      const assessorEvaluations = rows.filter(r => r.assessor_name === assessor);
      return {
        assessor,
        evaluations: assessorEvaluations.map(eval => ({
          assessed: eval.assessed_name,
          characteristics_count: eval.characteristics_count,
          status_icon: eval.status_icon
        }))
      };
    });
    
    res.json({
      participants,
      matrix
    });
  });
});

// GET /api/admin/participant-progress - Progresso detalhado por participante
router.get('/participant-progress', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.code,
      p.has_completed_self_assessment,
      p.has_completed_peer_assessments,
      COUNT(DISTINCT sa.characteristic_id) as self_assessment_count,
      COUNT(DISTINCT pa_given.assessed_id) as peers_evaluated_count,
      COUNT(DISTINCT pa_received.assessor_id) as peers_who_evaluated_me_count,
      (SELECT COUNT(*) - 1 FROM participants) as total_peers
    FROM participants p
    LEFT JOIN self_assessments sa ON sa.participant_id = p.id
    LEFT JOIN peer_assessments pa_given ON pa_given.assessor_id = p.id
    LEFT JOIN peer_assessments pa_received ON pa_received.assessed_id = p.id
    GROUP BY p.id, p.name, p.code, p.has_completed_self_assessment, p.has_completed_peer_assessments
    ORDER BY p.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar progresso dos participantes:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    const progressData = rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      self_assessment: {
        completed: row.has_completed_self_assessment,
        characteristics_count: row.self_assessment_count,
        progress_percentage: Math.round((row.self_assessment_count / 56) * 100)
      },
      peer_assessments_given: {
        peers_evaluated: row.peers_evaluated_count,
        total_peers: row.total_peers,
        progress_percentage: Math.round((row.peers_evaluated_count / row.total_peers) * 100)
      },
      peer_assessments_received: {
        peers_who_evaluated_me: row.peers_who_evaluated_me_count,
        total_peers: row.total_peers,
        progress_percentage: Math.round((row.peers_who_evaluated_me_count / row.total_peers) * 100)
      },
      overall_status: {
        completed: row.has_completed_self_assessment && row.has_completed_peer_assessments,
        peer_assessments_completed: row.has_completed_peer_assessments
      }
    }));
    
    res.json(progressData);
  });
});

module.exports = router;
