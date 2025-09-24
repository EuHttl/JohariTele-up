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
    max: 20,
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
  }
}

// GET /api/reports/johari/:code - Relatório individual da Janela de Johari
router.get('/johari/:code', async (req, res) => {
  const { code } = req.params;
  
  try {
    if (process.env.DATABASE_URL) {
      // Usar PostgreSQL em produção
      const query = `
        SELECT 
          p.id,
          p.name,
          p.has_completed_self_assessment,
          p.has_completed_peer_assessments,
          -- Características selecionadas na autoavaliação
          STRING_AGG(
            CASE WHEN sa.selected = true THEN c.name END, '|'
          ) as self_selected,
          -- Características selecionadas pelos pares
          STRING_AGG(
            CASE WHEN pa.selected = true THEN c.name END, '|'
          ) as peer_selected,
          -- Características não selecionadas na autoavaliação
          STRING_AGG(
            CASE WHEN sa.selected = false OR sa.selected IS NULL THEN c.name END, '|'
          ) as self_not_selected,
          -- Características não selecionadas pelos pares
          STRING_AGG(
            CASE WHEN pa.selected = false OR pa.selected IS NULL THEN c.name END, '|'
          ) as peer_not_selected
        FROM participants p
        CROSS JOIN characteristics c
        LEFT JOIN self_assessments sa ON sa.participant_id = p.id AND sa.characteristic_id = c.id
        LEFT JOIN peer_assessments pa ON pa.assessed_id = p.id AND pa.characteristic_id = c.id
        WHERE p.code = $1
        GROUP BY p.id, p.name, p.has_completed_self_assessment, p.has_completed_peer_assessments
      `;
      
      const result = await queryPostgres(query, [code]);
      
      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: 'Participante não encontrado' });
      }
      
      const row = result.rows[0];
      processReportData(row, res, code);
    } else {
      // Usar SQLite em desenvolvimento
      const query = `
        SELECT 
          p.id,
          p.name,
          p.has_completed_self_assessment,
          p.has_completed_peer_assessments,
          -- Características selecionadas na autoavaliação
          GROUP_CONCAT(
            CASE WHEN sa.selected = 1 THEN c.name END, '|'
          ) as self_selected,
          -- Características selecionadas pelos pares
          GROUP_CONCAT(
            CASE WHEN pa.selected = 1 THEN c.name END, '|'
          ) as peer_selected,
          -- Características não selecionadas na autoavaliação
          GROUP_CONCAT(
            CASE WHEN sa.selected = 0 OR sa.selected IS NULL THEN c.name END, '|'
          ) as self_not_selected,
          -- Características não selecionadas pelos pares
          GROUP_CONCAT(
            CASE WHEN pa.selected = 0 OR pa.selected IS NULL THEN c.name END, '|'
          ) as peer_not_selected
        FROM participants p
        CROSS JOIN characteristics c
        LEFT JOIN self_assessments sa ON sa.participant_id = p.id AND sa.characteristic_id = c.id
        LEFT JOIN peer_assessments pa ON pa.assessed_id = p.id AND pa.characteristic_id = c.id
        WHERE p.code = ?
        GROUP BY p.id, p.name, p.has_completed_self_assessment, p.has_completed_peer_assessments
      `;
      
      db.get(query, [code], (err, row) => {
        if (err) {
          console.error('Erro ao gerar relatório:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
        
        if (!row) {
          return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        processReportData(row, res, code);
      });
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função auxiliar para processar dados do relatório
function processReportData(row, res, code) {
  // Processar dados para calcular os 4 quadrantes
  const selfSelected = row.self_selected ? row.self_selected.split('|').filter(Boolean) : [];
  const peerSelected = row.peer_selected ? row.peer_selected.split('|').filter(Boolean) : [];
  const selfNotSelected = row.self_not_selected ? row.self_not_selected.split('|').filter(Boolean) : [];
  const peerNotSelected = row.peer_not_selected ? row.peer_not_selected.split('|').filter(Boolean) : [];
  
  // Calcular quadrantes
  const openArea = selfSelected.filter(char => peerSelected.includes(char));
  const blindArea = peerSelected.filter(char => !selfSelected.includes(char));
  const hiddenArea = selfSelected.filter(char => !peerSelected.includes(char));
  const unknownArea = selfNotSelected.filter(char => !peerSelected.includes(char));
  
  const report = {
    participant: {
      id: row.id,
      name: row.name,
      code: code,
      has_completed_self_assessment: row.has_completed_self_assessment,
      has_completed_peer_assessments: row.has_completed_peer_assessments
    },
    quadrants: {
      open: {
        name: 'Área Aberta',
        description: 'Características conhecidas por você e pelos outros',
        characteristics: openArea,
        count: openArea.length,
        percentage: Math.round((openArea.length / 56) * 100)
      },
      blind: {
        name: 'Área Cega',
        description: 'Características conhecidas pelos outros, mas não por você',
        characteristics: blindArea,
        count: blindArea.length,
        percentage: Math.round((blindArea.length / 56) * 100)
      },
      hidden: {
        name: 'Área Oculta',
        description: 'Características conhecidas por você, mas não pelos outros',
        characteristics: hiddenArea,
        count: hiddenArea.length,
        percentage: Math.round((hiddenArea.length / 56) * 100)
      },
      unknown: {
        name: 'Área Desconhecida',
        description: 'Características desconhecidas por você e pelos outros',
        characteristics: unknownArea,
        count: unknownArea.length,
        percentage: Math.round((unknownArea.length / 56) * 100)
      }
    },
    insights: generateInsights(openArea, blindArea, hiddenArea, unknownArea),
    generated_at: new Date().toISOString()
  };
  
  res.json(report);
}

// GET /api/reports/comparative - Relatório comparativo entre todos os participantes
router.get('/comparative', async (req, res) => {
  console.log('🔍 GET /api/reports/comparative - Iniciando relatório comparativo...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ PostgreSQL não configurado - usando SQLite');
  } else {
    console.log('✅ PostgreSQL configurado - usando PostgreSQL');
  }
  
  let query;
  
  if (process.env.DATABASE_URL) {
    // Query PostgreSQL - Simplificada para garantir que todos os participantes sejam incluídos
    query = `
      SELECT 
        p.id,
        p.name,
        p.code,
        p.has_completed_self_assessment,
        p.has_completed_peer_assessments,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = true THEN sa.characteristic_id END), 0) as self_selected_count,
        COALESCE(COUNT(DISTINCT CASE WHEN pa.selected = true THEN pa.characteristic_id END), 0) as peer_selected_count,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = true AND pa.selected = true THEN sa.characteristic_id END), 0) as open_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN (sa.selected = false OR sa.selected IS NULL) AND pa.selected = true THEN pa.characteristic_id END), 0) as blind_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = true AND (pa.selected = false OR pa.selected IS NULL) THEN sa.characteristic_id END), 0) as hidden_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN (sa.selected = false OR sa.selected IS NULL) AND (pa.selected = false OR pa.selected IS NULL) THEN sa.characteristic_id END), 0) as unknown_area_count
      FROM participants p
      LEFT JOIN self_assessments sa ON sa.participant_id = p.id
      LEFT JOIN peer_assessments pa ON pa.assessed_id = p.id
      GROUP BY p.id, p.name, p.code, p.has_completed_self_assessment, p.has_completed_peer_assessments
      ORDER BY p.name
    `;
  } else {
    // Query SQLite - Simplificada para garantir que todos os participantes sejam incluídos
    query = `
      SELECT 
        p.id,
        p.name,
        p.code,
        p.has_completed_self_assessment,
        p.has_completed_peer_assessments,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = 1 THEN sa.characteristic_id END), 0) as self_selected_count,
        COALESCE(COUNT(DISTINCT CASE WHEN pa.selected = 1 THEN pa.characteristic_id END), 0) as peer_selected_count,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = 1 AND pa.selected = 1 THEN sa.characteristic_id END), 0) as open_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN (sa.selected = 0 OR sa.selected IS NULL) AND pa.selected = 1 THEN pa.characteristic_id END), 0) as blind_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = 1 AND (pa.selected = 0 OR pa.selected IS NULL) THEN sa.characteristic_id END), 0) as hidden_area_count,
        COALESCE(COUNT(DISTINCT CASE WHEN (sa.selected = 0 OR sa.selected IS NULL) AND (pa.selected = 0 OR pa.selected IS NULL) THEN sa.characteristic_id END), 0) as unknown_area_count
      FROM participants p
      LEFT JOIN self_assessments sa ON sa.participant_id = p.id
      LEFT JOIN peer_assessments pa ON pa.assessed_id = p.id
      GROUP BY p.id, p.name, p.code, p.has_completed_self_assessment, p.has_completed_peer_assessments
      ORDER BY p.name
    `;
  }
  
  try {
    let rows;
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Usando PostgreSQL para relatório comparativo...');
      const result = await queryPostgres(query);
      rows = result.rows;
    } else {
      console.log('🗄️ Usando SQLite para relatório comparativo...');
      rows = await new Promise((resolve, reject) => {
        db.all(query, [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
    
    console.log('✅ Relatório comparativo: encontrados', rows?.length || 0, 'participantes');
    
    const comparativeReport = {
      summary: {
        total_participants: rows.length,
        completed_assessments: rows.filter(r => r.self_selected_count > 0 && r.peer_selected_count > 0).length,
        generated_at: new Date().toISOString()
      },
      participants: rows.map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        quadrants: {
          open: {
            count: row.open_area_count,
            percentage: Math.round((row.open_area_count / 56) * 100)
          },
          blind: {
            count: row.blind_area_count,
            percentage: Math.round((row.blind_area_count / 56) * 100)
          },
          hidden: {
            count: row.hidden_area_count,
            percentage: Math.round((row.hidden_area_count / 56) * 100)
          },
          unknown: {
            count: row.unknown_area_count,
            percentage: Math.round((row.unknown_area_count / 56) * 100)
          }
        },
        self_awareness_score: Math.round((row.open_area_count / 56) * 100),
        peer_perception_score: Math.round((row.peer_selected_count / 56) * 100),
        completed_at: (row.self_selected_count > 0 && row.peer_selected_count > 0) ? new Date().toISOString() : null
      })),
      team_insights: generateTeamInsights(rows)
    };
    
    res.json(comparativeReport);
  } catch (error) {
    console.error('❌ Erro ao gerar relatório comparativo:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error detail:', error.detail);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// GET /api/reports/characteristics - Análise das características mais/menos selecionadas
router.get('/characteristics', async (req, res) => {
  console.log('🔍 GET /api/reports/characteristics - Iniciando análise de características...');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ PostgreSQL não configurado - usando SQLite');
  } else {
    console.log('✅ PostgreSQL configurado - usando PostgreSQL');
  }
  
  let query;
  
  if (process.env.DATABASE_URL) {
    // Query PostgreSQL
    query = `
      SELECT 
        c.id,
        c.name,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = true THEN sa.participant_id END), 0) as self_selections,
        COALESCE(COUNT(DISTINCT CASE WHEN pa.selected = true THEN pa.assessed_id END), 0) as peer_selections,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = true AND pa.selected = true THEN sa.participant_id END), 0) as consensus_selections
      FROM characteristics c
      LEFT JOIN self_assessments sa ON sa.characteristic_id = c.id
      LEFT JOIN peer_assessments pa ON pa.characteristic_id = c.id
      GROUP BY c.id, c.name
      ORDER BY consensus_selections DESC, peer_selections DESC
    `;
  } else {
    // Query SQLite
    query = `
      SELECT 
        c.id,
        c.name,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = 1 THEN sa.participant_id END), 0) as self_selections,
        COALESCE(COUNT(DISTINCT CASE WHEN pa.selected = 1 THEN pa.assessed_id END), 0) as peer_selections,
        COALESCE(COUNT(DISTINCT CASE WHEN sa.selected = 1 AND pa.selected = 1 THEN sa.participant_id END), 0) as consensus_selections
      FROM characteristics c
      LEFT JOIN self_assessments sa ON sa.characteristic_id = c.id
      LEFT JOIN peer_assessments pa ON pa.characteristic_id = c.id
      GROUP BY c.id, c.name
      ORDER BY consensus_selections DESC, peer_selections DESC
    `;
  }
  
  try {
    let rows;
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Usando PostgreSQL para análise de características...');
      const result = await queryPostgres(query);
      rows = result.rows;
    } else {
      console.log('🗄️ Usando SQLite para análise de características...');
      rows = await new Promise((resolve, reject) => {
        db.all(query, [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
    
    console.log('✅ Análise de características: encontradas', rows?.length || 0, 'características');
    
    const characteristicAnalysis = {
      most_selected: rows.slice(0, 10).map(row => ({
        name: row.name,
        self_selections: row.self_selections,
        peer_selections: row.peer_selections,
        consensus_selections: row.consensus_selections,
        consensus_percentage: Math.round((row.consensus_selections / 15) * 100)
      })),
      least_selected: rows.slice(-10).reverse().map(row => ({
        name: row.name,
        self_selections: row.self_selections,
        peer_selections: row.peer_selections,
        consensus_selections: row.consensus_selections,
        consensus_percentage: Math.round((row.consensus_selections / 15) * 100)
      })),
      generated_at: new Date().toISOString()
    };
    
    res.json(characteristicAnalysis);
  } catch (error) {
    console.error('❌ Erro ao gerar análise de características:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error detail:', error.detail);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Função auxiliar para gerar insights individuais
function generateInsights(openArea, blindArea, hiddenArea, unknownArea) {
  const insights = [];
  
  if (openArea.length > 30) {
    insights.push({
      type: 'positive',
      title: 'Alta Autoconsciência',
      message: 'Você tem uma boa compreensão de como os outros o veem. Continue sendo autêntico!'
    });
  }
  
  if (blindArea.length > 15) {
    insights.push({
      type: 'attention',
      title: 'Área de Desenvolvimento',
      message: 'Há características que outros veem em você que você pode não perceber. Considere pedir feedback específico.'
    });
  }
  
  if (hiddenArea.length > 15) {
    insights.push({
      type: 'opportunity',
      title: 'Oportunidade de Compartilhamento',
      message: 'Você tem qualidades que outros podem não conhecer. Considere mostrar mais desses aspectos.'
    });
  }
  
  if (unknownArea.length > 20) {
    insights.push({
      type: 'growth',
      title: 'Potencial de Crescimento',
      message: 'Há muito potencial ainda não descoberto. Experimente novas situações e desafios!'
    });
  }
  
  return insights;
}

// Função auxiliar para gerar insights da equipe
function generateTeamInsights(participants) {
  const insights = [];
  
  const avgOpenArea = participants.reduce((sum, p) => sum + p.open_area_count, 0) / participants.length;
  const avgSelfAwareness = participants.reduce((sum, p) => sum + (p.open_area_count / 56 * 100), 0) / participants.length;
  
  insights.push({
    type: 'team',
    title: 'Nível de Autoconsciência da Equipe',
    message: `A equipe tem uma média de ${Math.round(avgSelfAwareness)}% de autoconsciência.`,
    recommendation: avgSelfAwareness < 40 ? 'Considere atividades de desenvolvimento pessoal e feedback 360°.' : 'A equipe demonstra boa autoconsciência coletiva.'
  });
  
  return insights;
}

module.exports = router;
