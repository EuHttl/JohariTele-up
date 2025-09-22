const axios = require('axios');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando tipo de banco de dados...');
    
    // Fazer uma requisição que vai mostrar logs no servidor
    const response = await axios.get('https://joharitele-up-production.up.railway.app/api/health');
    console.log('✅ API funcionando:', response.data);
    
    // Tentar fazer login para ver o erro específico
    try {
      const login = await axios.post('https://joharitele-up-production.up.railway.app/api/auth/login', {
        email: 'hyttalo2002@gmail.com',
        password: 'admin123'
      });
      console.log('✅ Login funcionou:', login.data);
    } catch (loginError) {
      console.log('❌ Erro no login:', loginError.response?.data);
      
      if (loginError.response?.data?.error?.includes('SQLITE_ERROR')) {
        console.log('\n💡 DIAGNÓSTICO: O Railway está usando SQLite, mas precisa de PostgreSQL!');
        console.log('📋 SOLUÇÃO:');
        console.log('1. Acesse o Railway Dashboard');
        console.log('2. Adicione um serviço PostgreSQL');
        console.log('3. Configure a variável DATABASE_URL');
        console.log('4. Faça redeploy');
      } else if (loginError.response?.data?.error?.includes('no such table: admins')) {
        console.log('\n💡 DIAGNÓSTICO: Tabela admins não existe!');
        console.log('📋 SOLUÇÃO:');
        console.log('1. O banco precisa ser inicializado');
        console.log('2. Verifique se o PostgreSQL está configurado');
        console.log('3. Verifique se a inicialização está funcionando');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkDatabase();
