require('dotenv').config();
const { testConnection, query } = require('./database/mysql-config');

async function testMySQL() {
  console.log('🔍 Testando conexão com MySQL...');
  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}`);
  console.log(`   User: ${process.env.DB_USER || 'root'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'johari_assessment'}`);
  console.log('');

  try {
    // Testar conexão
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ Conexão estabelecida com sucesso!');
      
      // Testar uma query simples
      console.log('🔍 Testando query...');
      const result = await query('SELECT 1 as test');
      console.log('✅ Query executada com sucesso:', result);
      
    } else {
      console.log('❌ Falha na conexão');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('');
    console.log('💡 Verifique se:');
    console.log('   1. O MySQL está instalado e rodando');
    console.log('   2. O banco de dados "johari_assessment" existe');
    console.log('   3. As credenciais estão corretas no arquivo .env');
    console.log('   4. O usuário tem permissões para acessar o banco');
  }
  
  process.exit(0);
}

testMySQL();
