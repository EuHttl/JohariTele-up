const axios = require('axios');

async function testLogin() {
  console.log('🔐 Testando login específico...');
  
  try {
    const response = await axios.post('https://joharitele-up-production.up.railway.app/api/auth/login', {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    }, {
      timeout: 15000, // 15 segundos
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', response.data.user);
    console.log('🔑 Token:', response.data.token ? 'Presente' : 'Ausente');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Login demorou mais de 15 segundos');
    } else if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

testLogin();
