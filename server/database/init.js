const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../johari.db');
const db = new sqlite3.Database(dbPath);

// Características da Janela de Johari (56 características clássicas)
const johariCharacteristics = [
  'Aceita as pessoas como elas são',
  'Acessível',
  'Adaptável',
  'Afável',
  'Alegre',
  'Ama ser elogiado',
  'Amigável',
  'Apaixonado',
  'Articulado',
  'Atento',
  'Audacioso',
  'Autoconsciente',
  'Bem-humorado',
  'Calmo',
  'Capaz',
  'Carinhoso',
  'Comandante',
  'Compassivo',
  'Competente',
  'Confiável',
  'Consciente',
  'Contemplativo',
  'Controlador',
  'Corajoso',
  'Criativo',
  'Defensivo',
  'Digno de confiança',
  'Direto',
  'Disciplinado',
  'Disposto',
  'Empático',
  'Energético',
  'Extrovertido',
  'Flexível',
  'Gentil',
  'Hábil',
  'Honesto',
  'Idealista',
  'Imaginativo',
  'Independente',
  'Ingênuo',
  'Inspirador',
  'Inteligente',
  'Introspectivo',
  'Introvertido',
  'Líder',
  'Lógico',
  'Lovável',
  'Maturidade',
  'Modesto',
  'Observador',
  'Organizado',
  'Paciente',
  'Poderoso',
  'Pontual',
  'Prudente',
  'Quieto',
  'Reflexivo',
  'Responsável',
  'Seguro de si',
  'Sensível',
  'Sincero',
  'Sorridente',
  'Tímido',
  'Tranquilo',
  'Útil',
  'Vigoroso'
];

function initializeDatabase() {
  console.log('🗄️  Inicializando banco de dados...');

  db.serialize(() => {
    // Criar tabela de administradores
    db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de participantes
    db.run(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        password TEXT NOT NULL,
        has_completed_self_assessment BOOLEAN DEFAULT FALSE,
        has_completed_peer_assessments BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins (id),
        UNIQUE(admin_id, email),
        UNIQUE(admin_id, code)
      )
    `);

    // Criar tabela de características
    db.run(`
      CREATE TABLE IF NOT EXISTS characteristics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de autoavaliações
    db.run(`
      CREATE TABLE IF NOT EXISTS self_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        participant_id INTEGER NOT NULL,
        characteristic_id INTEGER NOT NULL,
        selected BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins (id),
        FOREIGN KEY (participant_id) REFERENCES participants (id),
        FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
        UNIQUE(participant_id, characteristic_id)
      )
    `);

    // Criar tabela de avaliações entre pares
    db.run(`
      CREATE TABLE IF NOT EXISTS peer_assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        assessor_id INTEGER NOT NULL,
        assessed_id INTEGER NOT NULL,
        characteristic_id INTEGER NOT NULL,
        selected BOOLEAN NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES admins (id),
        FOREIGN KEY (assessor_id) REFERENCES participants (id),
        FOREIGN KEY (assessed_id) REFERENCES participants (id),
        FOREIGN KEY (characteristic_id) REFERENCES characteristics (id),
        UNIQUE(assessor_id, assessed_id, characteristic_id)
      )
    `);

    // Inserir características se não existirem
    db.get("SELECT COUNT(*) as count FROM characteristics", (err, row) => {
      if (err) {
        console.error('Erro ao verificar características:', err);
        return;
      }

      if (row.count === 0) {
        console.log('📝 Inserindo características da Janela de Johari...');
        const stmt = db.prepare("INSERT INTO characteristics (name) VALUES (?)");
        
        johariCharacteristics.forEach(characteristic => {
          stmt.run(characteristic);
        });
        
        stmt.finalize();
        console.log(`✅ ${johariCharacteristics.length} características inseridas`);
      }
    });

    // Criar administrador padrão
    const bcrypt = require('bcryptjs');
    const defaultPassword = bcrypt.hashSync('admin123', 10);
    
    db.run(`
      INSERT OR IGNORE INTO admins (username, email, password, name) 
      VALUES ('admin', 'hyttalo2002@gmail.com', ?, 'Hyttalo Costa')
    `, [defaultPassword], function(err) {
      if (err) {
        console.error('Erro ao criar administrador:', err);
      } else {
        console.log('👤 Administrador padrão criado (usuário: admin, email: hyttalo2002@gmail.com, senha: admin123)');
        
        // Criar participante admin para avaliação
        const adminParticipantPassword = bcrypt.hashSync('123456', 10);
        db.run(`
          INSERT OR IGNORE INTO participants (name, code, email, password) 
          VALUES ('Hyttalo Costa', 'ADMIN', 'hyttalo2002@gmail.com', ?)
        `, [adminParticipantPassword], function(err) {
          if (err) {
            console.error('Erro ao criar participante admin:', err);
          } else {
            console.log('👥 Participante admin criado para avaliação (código: ADMIN, senha: 123456)');
          }
        });
      }
    });

    // Adicionar coluna password se não existir (para compatibilidade com banco existente)
    db.run(`ALTER TABLE participants ADD COLUMN password TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Erro ao adicionar coluna password:', err);
      } else if (!err) {
        console.log('📝 Coluna password adicionada à tabela participants');
        
        // Definir senha padrão para participantes existentes sem senha
        const bcrypt = require('bcryptjs');
        const defaultParticipantPassword = bcrypt.hashSync('123456', 10);
        
        db.run(`UPDATE participants SET password = ? WHERE password IS NULL`, [defaultParticipantPassword], function(err) {
          if (err) {
            console.error('Erro ao definir senhas padrão:', err);
          } else if (this.changes > 0) {
            console.log(`🔐 Senha padrão definida para ${this.changes} participantes existentes (senha: 123456)`);
          }
        });
      }
    });

    console.log('✅ Banco de dados inicializado com sucesso!');
  });
}

module.exports = { db, initializeDatabase };
