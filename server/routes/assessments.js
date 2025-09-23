const express = require('express');
const router = express.Router();

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
    ssl: { rejectUnauthorized: false },
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  try {
    console.log('🔍 PostgreSQL: Executando query:', sql.substring(0, 100) + '...');
    const client = await pool.connect();
    const result = await client.query(sql, params);
    client.release();
    console.log('✅ PostgreSQL: Query executada com sucesso,', result.rows?.length || 0, 'registros');
    return result;
  } catch (error) {
    console.error('❌ PostgreSQL: Erro na query:', error.message);
    console.error('❌ PostgreSQL: SQL:', sql);
    console.error('❌ PostgreSQL: Params:', params);
    throw error;
  } finally {
    // Não fechar o pool imediatamente, deixar para o garbage collector
    // await pool.end();
  }
}

// GET /api/assessments/characteristics - Buscar todas as características
router.get('/characteristics', async (req, res) => {
  console.log('🔍 GET /api/assessments/characteristics - Iniciando busca...');
  console.log('🔍 DATABASE_URL configurado:', process.env.DATABASE_URL ? 'SIM' : 'NÃO');
  
  try {
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Usando PostgreSQL para buscar características...');
      // Usar PostgreSQL diretamente
      const result = await queryPostgres('SELECT id, name FROM characteristics ORDER BY name');
      console.log('✅ PostgreSQL: Características encontradas:', result.rows?.length || 0);
      res.json(result.rows);
    } else {
      console.log('🗄️ Usando SQLite para buscar características...');
      // Fallback para SQLite
      const query = 'SELECT id, name FROM characteristics ORDER BY name';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ SQLite: Erro ao buscar características:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        console.log('✅ SQLite: Características encontradas:', rows?.length || 0);
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('❌ Erro geral ao buscar características:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/assessments/self/:code - Buscar autoavaliação do participante
router.get('/self/:code', (req, res) => {
  const { code } = req.params;
  
  const query = `
    SELECT c.id, c.name, sa.selected
    FROM characteristics c
    LEFT JOIN self_assessments sa ON c.id = sa.characteristic_id 
      AND sa.participant_id = (SELECT id FROM participants WHERE code = ?)
    ORDER BY c.name
  `;
  
  db.all(query, [code], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar autoavaliação:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// POST /api/assessments/self/:code - Salvar autoavaliação
router.post('/self/:code', (req, res) => {
  const { code } = req.params;
  const { assessments } = req.body;
  
  if (!assessments || !Array.isArray(assessments)) {
    return res.status(400).json({ error: 'Avaliações são obrigatórias' });
  }

  // Buscar ID do participante
  db.get('SELECT id FROM participants WHERE code = ?', [code], (err, participantRow) => {
    if (err) {
      console.error('Erro ao buscar participante:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!participantRow) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const participantId = participantRow.id;
    
    // Iniciar transação
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Limpar autoavaliações existentes
      db.run('DELETE FROM self_assessments WHERE participant_id = ?', [participantId]);
      
      // Inserir novas autoavaliações
      const stmt = db.prepare(`
        INSERT INTO self_assessments (participant_id, characteristic_id, selected)
        VALUES (?, ?, ?)
      `);
      
      let completed = 0;
      let hasError = false;
      
      assessments.forEach(assessment => {
        if (hasError) return;
        
        stmt.run([participantId, assessment.characteristic_id, assessment.selected], (err) => {
          if (err) {
            console.error('Erro ao inserir autoavaliação:', err);
            hasError = true;
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          
          completed++;
          if (completed === assessments.length) {
            stmt.finalize();
            
            // Marcar como concluído
            db.run(
              'UPDATE participants SET has_completed_self_assessment = 1 WHERE id = ?',
              [participantId],
              (err) => {
                if (err) {
                  console.error('Erro ao atualizar status:', err);
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                db.run('COMMIT', (err) => {
                  if (err) {
                    console.error('Erro ao confirmar transação:', err);
                    return res.status(500).json({ error: 'Erro interno do servidor' });
                  }
                  
                  res.json({ message: 'Autoavaliação salva com sucesso' });
                });
              }
            );
          }
        });
      });
    });
  });
});

// GET /api/assessments/peers/:code - Buscar participantes para avaliação
router.get('/peers/:code', (req, res) => {
  const { code } = req.params;
  
  const query = `
    SELECT id, name, code
    FROM participants 
    WHERE code != ?
    ORDER BY name
  `;
  
  db.all(query, [code], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar pares:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// GET /api/assessments/peer/:assessorCode/:assessedCode - Buscar avaliação entre pares
router.get('/peer/:assessorCode/:assessedCode', (req, res) => {
  const { assessorCode, assessedCode } = req.params;
  
  const query = `
    SELECT c.id, c.name, pa.selected
    FROM characteristics c
    LEFT JOIN peer_assessments pa ON c.id = pa.characteristic_id 
      AND pa.assessor_id = (SELECT id FROM participants WHERE code = ?)
      AND pa.assessed_id = (SELECT id FROM participants WHERE code = ?)
    ORDER BY c.name
  `;
  
  db.all(query, [assessorCode, assessedCode], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar avaliação entre pares:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// POST /api/assessments/peer/:assessorCode/:assessedCode - Salvar avaliação entre pares
router.post('/peer/:assessorCode/:assessedCode', (req, res) => {
  const { assessorCode, assessedCode } = req.params;
  const { assessments } = req.body;
  
  if (!assessments || !Array.isArray(assessments)) {
    return res.status(400).json({ error: 'Avaliações são obrigatórias' });
  }

  // Buscar IDs dos participantes
  const query = `
    SELECT 
      (SELECT id FROM participants WHERE code = ?) as assessor_id,
      (SELECT id FROM participants WHERE code = ?) as assessed_id
  `;
  
  db.get(query, [assessorCode, assessedCode], (err, row) => {
    if (err) {
      console.error('Erro ao buscar participantes:', err);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    
    if (!row.assessor_id || !row.assessed_id) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }
    
    const { assessor_id, assessed_id } = row;
    
    // Iniciar transação
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Limpar avaliações existentes entre estes dois participantes
      db.run(
        'DELETE FROM peer_assessments WHERE assessor_id = ? AND assessed_id = ?',
        [assessor_id, assessed_id]
      );
      
      // Inserir novas avaliações
      const stmt = db.prepare(`
        INSERT INTO peer_assessments (assessor_id, assessed_id, characteristic_id, selected)
        VALUES (?, ?, ?, ?)
      `);
      
      let completed = 0;
      let hasError = false;
      
      assessments.forEach(assessment => {
        if (hasError) return;
        
        stmt.run([assessor_id, assessed_id, assessment.characteristic_id, assessment.selected], (err) => {
          if (err) {
            console.error('Erro ao inserir avaliação entre pares:', err);
            hasError = true;
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Erro interno do servidor' });
          }
          
          completed++;
          if (completed === assessments.length) {
            stmt.finalize();
            
            // Verificar se completou todas as avaliações entre pares
            checkPeerAssessmentCompletion(assessor_id, () => {
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Erro ao confirmar transação:', err);
                  return res.status(500).json({ error: 'Erro interno do servidor' });
                }
                
                res.json({ message: 'Avaliação entre pares salva com sucesso' });
              });
            });
          }
        });
      });
    });
  });
});

// Função auxiliar para verificar se completou todas as avaliações entre pares
function checkPeerAssessmentCompletion(participantId, callback) {
  const query = `
    SELECT COUNT(DISTINCT assessed_id) as assessed_count
    FROM peer_assessments 
    WHERE assessor_id = ?
  `;
  
  const totalPeersQuery = `
    SELECT COUNT(*) - 1 as total_peers 
    FROM participants
  `;
  
  db.get(query, [participantId], (err, assessedRow) => {
    if (err) {
      console.error('Erro ao verificar avaliações:', err);
      callback();
      return;
    }
    
    db.get(totalPeersQuery, [], (err, totalRow) => {
      if (err) {
        console.error('Erro ao contar participantes:', err);
        callback();
        return;
      }
      
      const hasCompleted = assessedRow.assessed_count >= totalRow.total_peers;
      
      if (hasCompleted) {
        db.run(
          'UPDATE participants SET has_completed_peer_assessments = 1 WHERE id = ?',
          [participantId],
          callback
        );
      } else {
        callback();
      }
    });
  });
}

module.exports = router;
