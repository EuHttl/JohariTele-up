const axios = require('axios');

// Configuração da API de produção
const API_BASE_URL = 'https://joharitele-up-production.up.railway.app/api';

async function testProductionLogin() {
  console.log('🧪 Testando login em produção...');
  console.log('🌐 URL:', API_BASE_URL);
  
  try {
    // Primeiro, testar o health check
    console.log('\n1. Testando health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check OK:', healthResponse.data);
    
    // Forçar reinicialização do banco
    console.log('\n2. Forçando reinicialização do banco...');
    try {
      const initResponse = await axios.post(`${API_BASE_URL}/force-init-db`);
      console.log('✅ Banco reinicializado:', initResponse.data);
    } catch (initError) {
      console.log('⚠️ Erro ao reinicializar banco (pode ser normal):', initError.response?.data || initError.message);
    }
    
    // Testar login
    console.log('\n3. Testando login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', loginResponse.data.user);
    console.log('🔑 Token recebido:', loginResponse.data.token ? 'Sim' : 'Não');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Dicas para resolver:');
      console.log('1. Verifique se o banco foi inicializado corretamente');
      console.log('2. Confirme se o administrador foi criado');
      console.log('3. Verifique as credenciais (email: hyttalo2002@gmail.com, senha: admin123)');
    }
  }
}

// Executar teste
testProductionLogin();
