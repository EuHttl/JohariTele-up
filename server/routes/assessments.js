const express = require('express');
const router = express.Router();

// Usar apenas PostgreSQL em produção
let postgresInit;
if (process.env.DATABASE_URL) {
  postgresInit = require('../database/postgres-init');
}

// GET /api/assessments/characteristics - Buscar todas as características
router.get('/characteristics', async (req, res) => {
  console.log('🔍 GET /api/assessments/characteristics - Iniciando busca...');
  
  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  try {
    console.log('🗄️ Usando PostgreSQL para buscar características...');
    const result = await postgresInit.pool.query('SELECT id, name FROM characteristics ORDER BY name');
    console.log('✅ PostgreSQL: Características encontradas:', result.rows?.length || 0);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar características:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/assessments/self/:code - Buscar autoavaliação do participante
router.get('/self/:code', async (req, res) => {
  const { code } = req.params;
  
  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  try {
    const query = `
      SELECT c.id, c.name, sa.selected
      FROM characteristics c
      LEFT JOIN self_assessments sa ON c.id = sa.characteristic_id 
        AND sa.participant_id = (SELECT id FROM participants WHERE code = $1)
      ORDER BY c.name
    `;
    
    const result = await postgresInit.pool.query(query, [code]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar autoavaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/assessments/self/:code - Salvar autoavaliação
router.post('/self/:code', async (req, res) => {
  const { code } = req.params;
  const { assessments } = req.body;
  
  if (!assessments || !Array.isArray(assessments)) {
    return res.status(400).json({ error: 'Avaliações são obrigatórias' });
  }

  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }

  try {
    const participantRow = await postgresInit.pool.query('SELECT id FROM participants WHERE code = $1', [code]);
    
    if (!participantRow.rows || participantRow.rows.length === 0) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const participantId = participantRow.rows[0].id;
    
    // Iniciar transação
    const client = await postgresInit.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Limpar autoavaliações existentes
      await client.query('DELETE FROM self_assessments WHERE participant_id = $1', [participantId]);
      
      // Inserir novas autoavaliações
      for (const assessment of assessments) {
        await client.query(
          'INSERT INTO self_assessments (participant_id, characteristic_id, selected) VALUES ($1, $2, $3)',
          [participantId, assessment.characteristic_id, assessment.selected]
        );
      }
      
      // Marcar como concluído
      await client.query(
        'UPDATE participants SET has_completed_self_assessment = true WHERE id = $1',
        [participantId]
      );
      
      await client.query('COMMIT');
      res.json({ message: 'Autoavaliação salva com sucesso' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Erro ao salvar autoavaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/assessments/peers/:code - Buscar participantes para avaliação
router.get('/peers/:code', async (req, res) => {
  const { code } = req.params;
  
  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  try {
    const query = `
      SELECT id, name, code
      FROM participants 
      WHERE code != $1
      ORDER BY name
    `;
    
    const result = await postgresInit.pool.query(query, [code]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar pares:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/assessments/peer/:assessorCode/:assessedCode - Buscar avaliação entre pares
router.get('/peer/:assessorCode/:assessedCode', async (req, res) => {
  const { assessorCode, assessedCode } = req.params;
  
  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  try {
    const query = `
      SELECT c.id, c.name, pa.selected
      FROM characteristics c
      LEFT JOIN peer_assessments pa ON c.id = pa.characteristic_id 
        AND pa.assessor_id = (SELECT id FROM participants WHERE code = $1)
        AND pa.assessed_id = (SELECT id FROM participants WHERE code = $2)
      ORDER BY c.name
    `;
    
    const result = await postgresInit.pool.query(query, [assessorCode, assessedCode]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar avaliação entre pares:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/assessments/peer/:assessorCode/:assessedCode - Salvar avaliação entre pares
router.post('/peer/:assessorCode/:assessedCode', async (req, res) => {
  const { assessorCode, assessedCode } = req.params;
  const { assessments } = req.body;
  
  if (!assessments || !Array.isArray(assessments)) {
    return res.status(400).json({ error: 'Avaliações são obrigatórias' });
  }

  if (!postgresInit) {
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }

  try {
    // Buscar IDs dos participantes
    const query = `
      SELECT 
        (SELECT id FROM participants WHERE code = $1) as assessor_id,
        (SELECT id FROM participants WHERE code = $2) as assessed_id
    `;
    
    const result = await postgresInit.pool.query(query, [assessorCode, assessedCode]);
    const row = result.rows[0];
    
    if (!row.assessor_id || !row.assessed_id) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const { assessor_id, assessed_id } = row;
    
    // Iniciar transação
    const client = await postgresInit.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Limpar avaliações existentes entre estes dois participantes
      await client.query(
        'DELETE FROM peer_assessments WHERE assessor_id = $1 AND assessed_id = $2',
        [assessor_id, assessed_id]
      );
      
      // Inserir novas avaliações
      for (const assessment of assessments) {
        await client.query(
          'INSERT INTO peer_assessments (assessor_id, assessed_id, characteristic_id, selected) VALUES ($1, $2, $3, $4)',
          [assessor_id, assessed_id, assessment.characteristic_id, assessment.selected]
        );
      }
      
      // Verificar se completou todas as avaliações entre pares
      await checkPeerAssessmentCompletion(assessor_id, client);
      
      await client.query('COMMIT');
      res.json({ message: 'Avaliação entre pares salva com sucesso' });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Erro ao salvar avaliação entre pares:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função auxiliar para verificar se completou todas as avaliações entre pares
async function checkPeerAssessmentCompletion(participantId, client) {
  try {
    const query = `
      SELECT COUNT(DISTINCT assessed_id) as assessed_count
      FROM peer_assessments 
      WHERE assessor_id = $1
    `;
    
    const totalPeersQuery = `
      SELECT COUNT(*) - 1 as total_peers 
      FROM participants
    `;
    
    const assessedResult = await client.query(query, [participantId]);
    const totalResult = await client.query(totalPeersQuery);
    
    const hasCompleted = parseInt(assessedResult.rows[0].assessed_count) >= parseInt(totalResult.rows[0].total_peers);
    
    if (hasCompleted) {
      await client.query(
        'UPDATE participants SET has_completed_peer_assessments = true WHERE id = $1',
        [participantId]
      );
    }
  } catch (error) {
    console.error('Erro ao verificar avaliações:', error);
  }
}

module.exports = router;