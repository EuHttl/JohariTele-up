const axios = require('axios');

async function testLoginFinal() {
  console.log('🔐 Testando login final...');
  
  try {
    const response = await axios.post('https://joharitele-up-production.up.railway.app/api/auth/login', {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🎉 LOGIN FUNCIONANDO!');
    console.log('👤 Usuário:', response.data.user);
    console.log('🔑 Token:', response.data.token ? 'Presente' : 'Ausente');
    console.log('📄 Mensagem:', response.data.message);
    
  } catch (error) {
    console.error('❌ ERRO no login:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Login ainda está demorando');
    } else if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

testLoginFinal();
