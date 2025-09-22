const axios = require('axios');

async function testBackend() {
  console.log('🧪 Testando status do backend...');
  
  try {
    // Testar health check
    console.log('\n1. 🏥 Testando Health Check...');
    const health = await axios.get('https://joharitele-up-production.up.railway.app/api/health', {
      timeout: 10000 // 10 segundos
    });
    console.log('✅ Health Check OK:', health.data);
    
    // Testar login com timeout menor
    console.log('\n2. 🔐 Testando Login (timeout 10s)...');
    const login = await axios.post('https://joharitele-up-production.up.railway.app/api/auth/login', {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    }, {
      timeout: 10000 // 10 segundos
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', login.data.user);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Backend não está respondendo em tempo hábil');
      console.log('🔧 Possíveis causas:');
      console.log('   - Backend está reiniciando');
      console.log('   - Problema com banco de dados');
      console.log('   - Servidor sobrecarregado');
    } else if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status, error.response.data);
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

testBackend();
