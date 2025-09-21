const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, '../johari.db');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  SQLite Database Explorer - Janela de Johari');
console.log('================================================');
console.log(`📁 Banco: ${dbPath}`);
console.log('');

// Função para executar query
function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Função para mostrar tabelas
async function showTables() {
  try {
    const tables = await executeQuery("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Tabelas disponíveis:');
    tables.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.name}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
  }
}

// Função para mostrar estrutura da tabela
async function describeTable(tableName) {
  try {
    const schema = await executeQuery(`PRAGMA table_info(${tableName})`);
    console.log(`\n📊 Estrutura da tabela '${tableName}':`);
    console.log('┌─────┬─────────────────┬─────────────┬──────────┬─────────┬──────────┐');
    console.log('│ CID │ Nome            │ Tipo        │ Not Null │ Default │ Primary  │');
    console.log('├─────┼─────────────────┼─────────────┼──────────┼─────────┼──────────┤');
    
    schema.forEach(col => {
      const cid = col.cid.toString().padEnd(4);
      const name = col.name.padEnd(16);
      const type = col.type.padEnd(12);
      const notnull = col.notnull ? 'YES' : 'NO';
      const dflt = (col.dflt_value || '').padEnd(8);
      const pk = col.pk ? 'YES' : 'NO';
      
      console.log(`│ ${cid} │ ${name} │ ${type} │ ${notnull.padEnd(9)} │ ${dflt} │ ${pk.padEnd(9)} │`);
    });
    console.log('└─────┴─────────────────┴─────────────┴──────────┴─────────┴──────────┘');
  } catch (error) {
    console.error('❌ Erro ao mostrar estrutura:', error.message);
  }
}

// Função para mostrar dados da tabela
async function showTableData(tableName, limit = 10) {
  try {
    const count = await executeQuery(`SELECT COUNT(*) as total FROM ${tableName}`);
    const data = await executeQuery(`SELECT * FROM ${tableName} LIMIT ${limit}`);
    
    console.log(`\n📄 Dados da tabela '${tableName}' (${count[0].total} registros, mostrando ${Math.min(limit, data.length)}):`);
    
    if (data.length > 0) {
      // Mostrar cabeçalho
      const columns = Object.keys(data[0]);
      console.log('\n' + columns.join(' | '));
      console.log('-'.repeat(columns.join(' | ').length));
      
      // Mostrar dados
      data.forEach(row => {
        const values = columns.map(col => row[col] || 'NULL');
        console.log(values.join(' | '));
      });
      
      if (count[0].total > limit) {
        console.log(`\n... e mais ${count[0].total - limit} registros`);
      }
    } else {
      console.log('(Nenhum dado encontrado)');
    }
  } catch (error) {
    console.error('❌ Erro ao mostrar dados:', error.message);
  }
}

// Função para executar SQL customizado
async function executeCustomSQL(sql) {
  try {
    const result = await executeQuery(sql);
    console.log('\n✅ Query executada com sucesso:');
    
    if (result.length > 0) {
      const columns = Object.keys(result[0]);
      console.log('\n' + columns.join(' | '));
      console.log('-'.repeat(columns.join(' | ').length));
      
      result.forEach(row => {
        const values = columns.map(col => row[col] || 'NULL');
        console.log(values.join(' | '));
      });
    } else {
      console.log('(Nenhum resultado)');
    }
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
  }
}

// Menu interativo
function showMenu() {
  console.log('\n🔧 Comandos disponíveis:');
  console.log('  tables                    - Mostrar todas as tabelas');
  console.log('  describe <tabela>         - Mostrar estrutura da tabela');
  console.log('  data <tabela> [limite]    - Mostrar dados da tabela');
  console.log('  sql <query>               - Executar SQL customizado');
  console.log('  admin                     - Mostrar administradores');
  console.log('  participants              - Mostrar participantes');
  console.log('  characteristics           - Mostrar características');
  console.log('  help                      - Mostrar este menu');
  console.log('  exit                      - Sair');
  console.log('');
}

// Função principal
async function main() {
  await showTables();
  showMenu();
  
  rl.setPrompt('sqlite> ');
  rl.prompt();
  
  rl.on('line', async (input) => {
    const [command, ...args] = input.trim().split(' ');
    
    switch (command.toLowerCase()) {
      case 'tables':
        await showTables();
        break;
        
      case 'describe':
        if (args[0]) {
          await describeTable(args[0]);
        } else {
          console.log('❌ Especifique o nome da tabela');
        }
        break;
        
      case 'data':
        if (args[0]) {
          const limit = args[1] ? parseInt(args[1]) : 10;
          await showTableData(args[0], limit);
        } else {
          console.log('❌ Especifique o nome da tabela');
        }
        break;
        
      case 'sql':
        if (args.length > 0) {
          const sql = args.join(' ');
          await executeCustomSQL(sql);
        } else {
          console.log('❌ Especifique a query SQL');
        }
        break;
        
      case 'admin':
        await showTableData('admins');
        break;
        
      case 'participants':
        await showTableData('participants');
        break;
        
      case 'characteristics':
        await showTableData('characteristics');
        break;
        
      case 'help':
        showMenu();
        break;
        
      case 'exit':
        console.log('\n👋 Até logo!');
        db.close();
        rl.close();
        return;
        
      case '':
        break;
        
      default:
        console.log('❌ Comando não reconhecido. Digite "help" para ver os comandos disponíveis.');
    }
    
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log('\n👋 Conexão fechada.');
    db.close();
  });
}

main().catch(console.error);
