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
    console.log('❌ PostgreSQL não configurado - postgresInit é null/undefined');
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  if (!postgresInit.pool) {
    console.log('❌ PostgreSQL pool não disponível');
    return res.status(500).json({ error: 'PostgreSQL pool não disponível' });
  }
  
  try {
    console.log('🗄️ Usando PostgreSQL para buscar características...');
    console.log('🔍 Verificando se tabela characteristics existe...');
    
    // Primeiro, verificar se a tabela existe
    const tableCheck = await postgresInit.pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'characteristics'
      );
    `);
    
    console.log('📊 Tabela characteristics existe:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela characteristics não existe!');
      return res.status(500).json({ error: 'Tabela characteristics não existe' });
    }
    
    // Contar registros
    const countResult = await postgresInit.pool.query('SELECT COUNT(*) as count FROM characteristics');
    console.log('📊 Total de características na tabela:', countResult.rows[0].count);
    
    const result = await postgresInit.pool.query('SELECT id, name FROM characteristics ORDER BY name');
    console.log('✅ PostgreSQL: Características encontradas:', result.rows?.length || 0);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar características:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error detail:', error.detail);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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
  console.log('🔍 GET /api/assessments/peers/:code - Iniciando busca para code:', code);
  
  if (!postgresInit) {
    console.log('❌ PostgreSQL não configurado - postgresInit é null/undefined');
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  if (!postgresInit.pool) {
    console.log('❌ PostgreSQL pool não disponível');
    return res.status(500).json({ error: 'PostgreSQL pool não disponível' });
  }
  
  try {
    console.log('🗄️ Usando PostgreSQL para buscar participantes...');
    console.log('🔍 Verificando se tabela participants existe...');
    
    // Primeiro, verificar se a tabela existe
    const tableCheck = await postgresInit.pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'participants'
      );
    `);
    
    console.log('📊 Tabela participants existe:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tabela participants não existe!');
      return res.status(500).json({ error: 'Tabela participants não existe' });
    }
    
    // Contar registros
    const countResult = await postgresInit.pool.query('SELECT COUNT(*) as count FROM participants');
    console.log('📊 Total de participantes na tabela:', countResult.rows[0].count);
    
    const query = `
      SELECT id, name, code
      FROM participants 
      WHERE code != $1
      ORDER BY name
    `;
    
    console.log('🔍 Executando query:', query, 'com parâmetro:', code);
    const result = await postgresInit.pool.query(query, [code]);
    console.log('✅ PostgreSQL: Participantes encontrados:', result.rows?.length || 0);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar pares:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error detail:', error.detail);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
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
    
    const assessor_id = row.assessor_id;
    const assessed_id = row.assessed_id;
    
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
    console.log('🔍 Verificando completude das avaliações para participante:', participantId);
    
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
    
    const assessedCount = parseInt(assessedResult.rows[0].assessed_count);
    const totalPeers = parseInt(totalResult.rows[0].total_peers);
    
    console.log(`📊 Participante ${participantId}: avaliou ${assessedCount} de ${totalPeers} pares`);
    
    const hasCompleted = assessedCount >= totalPeers;
    
    if (hasCompleted) {
      console.log(`✅ Participante ${participantId} completou todas as avaliações de pares`);
      await client.query(
        'UPDATE participants SET has_completed_peer_assessments = true WHERE id = $1',
        [participantId]
      );
    } else {
      console.log(`⏳ Participante ${participantId} ainda não completou todas as avaliações`);
    }
  } catch (error) {
    console.error('❌ Erro ao verificar avaliações:', error);
  }
}

// GET /api/assessments/completed-peers/:code - Buscar avaliações de pares concluídas
router.get('/completed-peers/:code', async (req, res) => {
  console.log('🔍 GET /api/assessments/completed-peers/:code - Iniciando busca...');
  
  if (!postgresInit) {
    console.log('❌ PostgreSQL não configurado');
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  if (!postgresInit.pool) {
    console.log('❌ PostgreSQL pool não disponível');
    return res.status(500).json({ error: 'PostgreSQL pool não disponível' });
  }
  
  try {
    const { code } = req.params;
    console.log('🔍 Buscando avaliações de pares concluídas para:', code);
    
    // Buscar o ID do participante
    const participantResult = await postgresInit.pool.query(
      'SELECT id FROM participants WHERE code = $1',
      [code]
    );
    
    if (participantResult.rows.length === 0) {
      console.log('❌ Participante não encontrado:', code);
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const participantId = participantResult.rows[0].id;
    console.log('📋 ID do participante:', participantId);
    
    // Buscar avaliações de pares concluídas
    const query = `
      SELECT DISTINCT assessed_id as peer_id 
      FROM peer_assessments 
      WHERE assessor_id = $1
    `;
    
    const result = await postgresInit.pool.query(query, [participantId]);
    console.log('✅ Avaliações de pares concluídas encontradas:', result.rows.length);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações de pares concluídas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code
    });
  }
});

// GET /api/assessments/peer-assessors/:code - Buscar todos os pares que avaliaram um participante
router.get('/peer-assessors/:code', async (req, res) => {
  console.log('🔍 GET /api/assessments/peer-assessors/:code - Iniciando busca...');
  
  // Garantir que o Content-Type seja JSON
  res.setHeader('Content-Type', 'application/json');
  
  if (!postgresInit) {
    console.log('❌ PostgreSQL não configurado');
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  if (!postgresInit.pool) {
    console.log('❌ PostgreSQL pool não disponível');
    return res.status(500).json({ error: 'PostgreSQL pool não disponível' });
  }
  
  try {
    const { code } = req.params;
    console.log('🔍 Buscando pares que avaliaram:', code);
    
    // Buscar o ID do participante
    const participantResult = await postgresInit.pool.query(
      'SELECT id FROM participants WHERE code = $1',
      [code]
    );
    
    if (participantResult.rows.length === 0) {
      console.log('❌ Participante não encontrado:', code);
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const participantId = participantResult.rows[0].id;
    console.log('📋 ID do participante:', participantId);
    
    // Buscar todos os pares que avaliaram este participante
    const query = `
      SELECT DISTINCT 
        p.id,
        p.name,
        p.code,
        COUNT(pa.characteristic_id) as characteristics_evaluated,
        MAX(pa.created_at) as last_evaluation_date
      FROM participants p
      INNER JOIN peer_assessments pa ON pa.assessor_id = p.id
      WHERE pa.assessed_id = $1
      GROUP BY p.id, p.name, p.code
      ORDER BY p.name
    `;
    
    console.log('🔍 Executando query:', query, 'com parâmetro:', participantId);
    const result = await postgresInit.pool.query(query, [participantId]);
    console.log('✅ Pares que avaliaram encontrados:', result.rows.length);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao buscar pares que avaliaram:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code
    });
  }
});

// GET /api/assessments/peer-characteristics/:code - Buscar características selecionadas pelos pares
router.get('/peer-characteristics/:code', async (req, res) => {
  console.log('🔍 GET /api/assessments/peer-characteristics/:code - Iniciando busca...');
  
  if (!postgresInit) {
    console.log('❌ PostgreSQL não configurado');
    return res.status(500).json({ error: 'PostgreSQL não configurado' });
  }
  
  if (!postgresInit.pool) {
    console.log('❌ PostgreSQL pool não disponível');
    return res.status(500).json({ error: 'PostgreSQL pool não disponível' });
  }
  
  try {
    const { code } = req.params;
    console.log('🔍 Buscando características selecionadas pelos pares para:', code);
    
    // Buscar o ID do participante
    const participantResult = await postgresInit.pool.query(
      'SELECT id FROM participants WHERE code = $1',
      [code]
    );
    
    if (participantResult.rows.length === 0) {
      console.log('❌ Participante não encontrado:', code);
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const participantId = participantResult.rows[0].id;
    console.log('📋 ID do participante:', participantId);
    
    // Buscar características selecionadas pelos pares
    const query = `
      SELECT 
        c.id,
        c.name,
        COUNT(CASE WHEN pa.selected = true THEN 1 END) as selected_count,
        COUNT(pa.assessor_id) as total_assessors,
        CASE 
          WHEN COUNT(CASE WHEN pa.selected = true THEN 1 END) > 0 THEN true
          ELSE false
        END as selected
      FROM characteristics c
      LEFT JOIN peer_assessments pa ON c.id = pa.characteristic_id AND pa.assessed_id = $1
      GROUP BY c.id, c.name
      ORDER BY c.name
    `;
    
    const result = await postgresInit.pool.query(query, [participantId]);
    console.log('✅ Características dos pares encontradas:', result.rows.length);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Erro ao buscar características dos pares:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code
    });
  }
});

module.exports = router;