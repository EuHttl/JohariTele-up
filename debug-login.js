const axios = require('axios');

async function debugLogin() {
  console.log('🔍 Debugando problema de login...');
  
  const baseUrl = 'https://joharitele-up-production.up.railway.app';
  
  try {
    // Testar login do Mateus com logs detalhados
    console.log('\n🔐 Tentando login do Mateus...');
    console.log('📧 Email: tavares@teleup.com');
    console.log('🔑 Senha: d3b63f16');
    
    const mateusLogin = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'tavares@teleup.com',
      password: 'd3b63f16'
    }, { 
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🎉 SUCESSO! Login do Mateus funcionando!');
    console.log('👤 Dados do Mateus:', mateusLogin.data.user);
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
      
      if (error.response.status === 500) {
        console.log('\n🔍 ERRO 500 - POSSÍVEIS CAUSAS:');
        console.log('1. Problema com bcrypt.compareSync');
        console.log('2. Campo password não existe na tabela participants');
        console.log('3. Problema na query PostgreSQL');
        console.log('4. Erro no JWT');
        console.log('5. Problema na estrutura do banco');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Login demorou mais de 30 segundos');
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

debugLogin();
