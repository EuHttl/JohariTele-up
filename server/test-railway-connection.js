const { Pool } = require('pg');

async function testRailwayConnection() {
  console.log('🧪 Testando conexão com Railway PostgreSQL...');
  
  // Verificar se DATABASE_URL está definida
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está definida!');
    console.log('💡 Você precisa configurar a variável DATABASE_URL no Railway');
    console.log('📋 Passos:');
    console.log('1. Acesse o Railway Dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Clique em "Variables"');
    console.log('4. Adicione DATABASE_URL com a string de conexão do PostgreSQL');
    return;
  }
  
  console.log('✅ DATABASE_URL encontrada');
  console.log('🔗 String de conexão:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('🔌 Tentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar query simples
    console.log('📊 Testando query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executada:', result.rows[0]);
    
    // Verificar se tabela admins existe
    console.log('🔍 Verificando tabela admins...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admins'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Tabela admins existe');
      
      // Verificar se há administradores
      const adminCount = await client.query('SELECT COUNT(*) FROM admins');
      console.log(`📊 Total de administradores: ${adminCount.rows[0].count}`);
      
      if (parseInt(adminCount.rows[0].count) > 0) {
        const admins = await client.query('SELECT id, username, email, name FROM admins LIMIT 5');
        console.log('👤 Administradores encontrados:');
        admins.rows.forEach(admin => {
          console.log(`  - ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Name: ${admin.name}`);
        });
      } else {
        console.log('⚠️ Nenhum administrador encontrado');
      }
    } else {
      console.log('❌ Tabela admins não existe');
    }
    
    client.release();
    await pool.end();
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.log('💡 Possíveis soluções:');
    console.log('1. Verifique se a DATABASE_URL está correta');
    console.log('2. Verifique se o banco PostgreSQL está ativo no Railway');
    console.log('3. Verifique se as credenciais estão corretas');
  }
}

testRailwayConnection();
