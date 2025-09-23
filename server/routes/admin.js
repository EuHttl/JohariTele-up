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

// GET /api/admin/assessment-tracking - Rastreamento de avaliações entre pares
router.get('/assessment-tracking', async (req, res) => {
  console.log('🔍 GET /api/admin/assessment-tracking - Iniciando rastreamento...');
  
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
  
  try {
    let rows;
    
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Usando PostgreSQL para assessment-tracking...');
      const result = await queryPostgres(query);
      rows = result.rows;
    } else {
      console.log('🗄️ Usando SQLite para assessment-tracking...');
      rows = await new Promise((resolve, reject) => {
        db.all(query, [], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    }
    
    console.log('✅ Assessment-tracking: encontrados', rows?.length || 0, 'registros');
    
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
  } catch (error) {
    console.error('❌ Erro ao buscar rastreamento de avaliações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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

// GET /api/admin/settings - Buscar configurações do sistema
router.get('/settings', async (req, res) => {
  try {
    // Por enquanto retorna configurações padrão
    // Em produção, isso viria de uma tabela de configurações
    const settings = {
      email_notifications: true,
      auto_backup: false,
      debug_mode: false,
      backup_frequency: 'daily', // daily, weekly, monthly
      last_backup: null,
      backup_retention_days: 30
    };

    res.json(settings);
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/admin/settings - Atualizar configurações do sistema
router.put('/settings', async (req, res) => {
  try {
    const { email_notifications, auto_backup, debug_mode, backup_frequency } = req.body;
    
    // Em produção, salvaria na tabela de configurações
    const updatedSettings = {
      email_notifications: email_notifications || false,
      auto_backup: auto_backup || false,
      debug_mode: debug_mode || false,
      backup_frequency: backup_frequency || 'daily',
      last_backup: null,
      backup_retention_days: 30,
      updated_at: new Date().toISOString()
    };

    console.log('✅ Configurações atualizadas:', updatedSettings);
    res.json(updatedSettings);
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/admin/backup - Criar backup do banco de dados
router.post('/backup', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Criar diretório de backups se não existir
    const backupDir = path.join(__dirname, '../backups');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `johari-backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);
    
    let backupData = {};
    
    if (process.env.DATABASE_URL) {
      // Backup PostgreSQL
      console.log('🗄️ Criando backup PostgreSQL...');
      
      // Buscar dados de todas as tabelas
      const tables = ['participants', 'characteristics', 'self_assessments', 'peer_assessments'];
      
      for (const table of tables) {
        const result = await queryPostgres(`SELECT * FROM ${table}`);
        backupData[table] = result.rows;
      }
      
      backupData.metadata = {
        type: 'postgresql',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: tables
      };
    } else {
      // Backup SQLite
      console.log('🗄️ Criando backup SQLite...');
      
      const tables = ['participants', 'characteristics', 'self_assessments', 'peer_assessments'];
      
      for (const table of tables) {
        const rows = await new Promise((resolve, reject) => {
          db.all(`SELECT * FROM ${table}`, [], (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        backupData[table] = rows;
      }
      
      backupData.metadata = {
        type: 'sqlite',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        tables: tables
      };
    }
    
    // Salvar backup em arquivo
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log('✅ Backup criado:', backupFileName);
    
    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      filename: backupFileName,
      path: backupPath,
      size: (await fs.stat(backupPath)).size,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    res.status(500).json({ 
      error: 'Erro ao criar backup',
      details: error.message 
    });
  }
});

// POST /api/admin/restore - Restaurar backup do banco de dados
router.post('/restore', async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Nome do arquivo de backup é obrigatório' });
    }
    
    const fs = require('fs').promises;
    const path = require('path');
    
    const backupPath = path.join(__dirname, '../backups', filename);
    
    // Verificar se arquivo existe
    try {
      await fs.access(backupPath);
    } catch {
      return res.status(404).json({ error: 'Arquivo de backup não encontrado' });
    }
    
    // Ler arquivo de backup
    const backupContent = await fs.readFile(backupPath, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    console.log('🔄 Restaurando backup:', filename);
    
    if (process.env.DATABASE_URL) {
      // Restaurar PostgreSQL
      console.log('🗄️ Restaurando PostgreSQL...');
      
      // Limpar tabelas existentes
      const tables = ['peer_assessments', 'self_assessments', 'participants', 'characteristics'];
      for (const table of tables) {
        await queryPostgres(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      }
      
      // Restaurar dados
      for (const [tableName, data] of Object.entries(backupData)) {
        if (tableName === 'metadata') continue;
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          const values = data.map(row => 
            columns.map(col => `$${columns.indexOf(col) + 1}`).join(', ')
          );
          
          for (const row of data) {
            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values[0]})`;
            await queryPostgres(query, columns.map(col => row[col]));
          }
        }
      }
    } else {
      // Restaurar SQLite
      console.log('🗄️ Restaurando SQLite...');
      
      // Limpar tabelas existentes
      const tables = ['peer_assessments', 'self_assessments', 'participants', 'characteristics'];
      for (const table of tables) {
        await new Promise((resolve, reject) => {
          db.run(`DELETE FROM ${table}`, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      
      // Restaurar dados
      for (const [tableName, data] of Object.entries(backupData)) {
        if (tableName === 'metadata') continue;
        
        if (data && data.length > 0) {
          for (const row of data) {
            const columns = Object.keys(row);
            const placeholders = columns.map(() => '?').join(', ');
            const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            
            await new Promise((resolve, reject) => {
              db.run(query, Object.values(row), (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          }
        }
      }
    }
    
    console.log('✅ Backup restaurado com sucesso');
    
    res.json({
      success: true,
      message: 'Backup restaurado com sucesso',
      filename: filename,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    res.status(500).json({ 
      error: 'Erro ao restaurar backup',
      details: error.message 
    });
  }
});

// DELETE /api/admin/clear-data - Limpar todos os dados do sistema
router.delete('/clear-data', async (req, res) => {
  try {
    console.log('⚠️ Limpando todos os dados do sistema...');
    
    if (process.env.DATABASE_URL) {
      // Limpar PostgreSQL
      const tables = ['peer_assessments', 'self_assessments', 'participants'];
      
      for (const table of tables) {
        await queryPostgres(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
      }
    } else {
      // Limpar SQLite
      const tables = ['peer_assessments', 'self_assessments', 'participants'];
      
      for (const table of tables) {
        await new Promise((resolve, reject) => {
          db.run(`DELETE FROM ${table}`, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    }
    
    console.log('✅ Dados limpos com sucesso');
    
    res.json({
      success: true,
      message: 'Todos os dados foram limpos com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados:', error);
    res.status(500).json({ 
      error: 'Erro ao limpar dados',
      details: error.message 
    });
  }
});

// GET /api/admin/backups - Listar backups disponíveis
router.get('/backups', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const backupDir = path.join(__dirname, '../backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backupFiles.push({
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      }
      
      // Ordenar por data de criação (mais recente primeiro)
      backupFiles.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      res.json(backupFiles);
    } catch {
      res.json([]);
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
