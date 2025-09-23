const axios = require('axios');

async function testMateusDirect() {
  console.log('🔍 Testando login direto do Mateus...');
  
  const baseUrl = 'https://joharitele-up-production.up.railway.app';
  
  try {
    // Testar login do Mateus diretamente
    console.log('\n🔐 Tentando login do Mateus...');
    console.log('📧 Email: tavares@teleup.com');
    console.log('🔑 Senha: d3b63f16');
    
    const mateusLogin = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'tavares@teleup.com',
      password: 'd3b63f16'
    }, { timeout: 30000 });
    
    console.log('🎉 SUCESSO! Login do Mateus funcionando!');
    console.log('👤 Dados do Mateus:', mateusLogin.data.user);
    console.log('🔑 Token:', mateusLogin.data.token ? 'Presente' : 'Ausente');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔍 POSSÍVEIS CAUSAS:');
        console.log('1. Email incorreto: tavares@teleup.com');
        console.log('2. Senha incorreta: d3b63f16');
        console.log('3. Participante não existe no banco');
        console.log('4. Problema na rota de login de participantes');
      }
    } else if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Login demorou mais de 30 segundos');
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

testMateusDirect();
