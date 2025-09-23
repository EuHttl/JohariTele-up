const axios = require('axios');

async function checkMateusInDB() {
  console.log('🔍 Verificando se o Mateus existe no banco...');
  
  const baseUrl = 'https://joharitele-up-production.up.railway.app';
  
  try {
    // 1. Login como admin
    console.log('\n1. 🔐 Fazendo login como admin...');
    const adminLogin = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'hyttalo2002@gmail.com',
      password: 'admin123'
    }, { timeout: 30000 });
    
    const token = adminLogin.data.token;
    console.log('✅ Login admin funcionando!');
    
    // 2. Listar participantes
    console.log('\n2. 📊 Listando participantes...');
    const participantsResponse = await axios.get(`${baseUrl}/api/participants`, {
      timeout: 30000,
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
    
    // 3. Procurar especificamente pelo Mateus
    const mateus = participantsResponse.data.find(p => p.email === 'tavares@teleup.com');
    
    if (mateus) {
      console.log('✅ Mateus encontrado no banco!');
      console.log('👤 Dados do Mateus:');
      console.log(`   Nome: ${mateus.name}`);
      console.log(`   Email: ${mateus.email}`);
      console.log(`   Código: ${mateus.code}`);
      console.log(`   Senha: ${mateus.code.toLowerCase()}`);
      
      // 4. Testar login com as credenciais corretas
      console.log('\n3. 🔐 Testando login com credenciais corretas...');
      const mateusLogin = await axios.post(`${baseUrl}/api/auth/login`, {
        email: mateus.email,
        password: mateus.code.toLowerCase()
      }, { timeout: 30000 });
      
      console.log('🎉 SUCESSO! Login do Mateus funcionando!');
      console.log('👤 Dados do Mateus:', mateusLogin.data.user);
      
    } else {
      console.log('❌ Mateus NÃO encontrado no banco!');
      console.log('💡 Verifique se o email está correto: tavares@teleup.com');
    }
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.response) {
      console.log('💡 Erro HTTP:', error.response.status);
      console.log('📄 Resposta:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      console.log('💡 TIMEOUT: Requisição demorou mais de 30 segundos');
    } else {
      console.log('💡 Erro de conexão:', error.message);
    }
  }
}

checkMateusInDB();
