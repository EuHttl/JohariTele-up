const axios = require('axios');

async function test() {
  try {
    console.log('🧪 Testando API...');
    
    // Testar health check
    const health = await axios.get('https://joharitele-up-production.up.railway.app/api/health');
    console.log('✅ Health:', health.data);
    
    // Testar login
    const login = await axios.post('https://joharitele-up-production.up.railway.app/api/auth/login', {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    });
    console.log('✅ Login:', login.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

test();
