const axios = require('axios');

async function testMateusLogin() {
  console.log('🔍 Verificando login do Mateus...');
  
  const baseUrl = 'https://joharitele-up-production.up.railway.app';
  
  try {
    // 1. Primeiro, vamos listar todos os participantes para ver o Mateus
    console.log('\n1. 📊 Listando participantes...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    }, { timeout: 15000 });
    
    const token = loginResponse.data.token;
    console.log('✅ Login admin funcionando!');
    
    const participantsResponse = await axios.get(`${baseUrl}/api/participants`, {
      timeout: 15000,
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 Participantes encontrados:');
    participantsResponse.data.forEach((p, index) => {
      console.log(`${index + 1}. Nome: ${p.name}`);
      console.log(`   Email: ${p.email}`);
      console.log(`   Código: ${p.code}`);
      console.log(`   Senha: ${p.code.toLowerCase()}`);
      console.log('');
    });
    
    // 2. Agora vamos testar o login do Mateus
    console.log('\n2. 🔐 Testando login do Mateus...');
    const mateusLogin = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'tavares@teleup.com',
      password: 'd3b63f16'
    }, { timeout: 15000 });
    
    console.log('✅ Login do Mateus funcionando!');
    console.log('👤 Dados do Mateus:', mateusLogin.data);
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔍 POSSÍVEIS CAUSAS:');
        console.log('1. Email incorreto');
        console.log('2. Senha incorreta');
        console.log('3. Participante não existe no banco');
        console.log('4. Problema na rota de login de participantes');
      }
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

testMateusLogin();
