const axios = require('axios');

async function testSimpleRoute() {
  console.log('🧪 Testando rota simples...');
  
  try {
    const response = await axios.get('https://joharitele-up-production.up.railway.app/api/auth/test', {
      timeout: 5000 // 5 segundos apenas
    });
    
    console.log('✅ Rota simples funcionou!');
    console.log('📄 Resposta:', response.data);
    
  } catch (error) {
    console.error('❌ ERRO na rota simples:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Até rota simples está com timeout');
    } else if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
    }
  }
}

testSimpleRoute();
