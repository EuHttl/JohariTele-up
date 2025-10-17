const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configuração do Stripe - Janela de Johari\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupStripe() {
  try {
    console.log('📋 Para obter suas chaves do Stripe:');
    console.log('1. Acesse: https://dashboard.stripe.com/apikeys');
    console.log('2. Certifique-se de estar no modo "Test" (toggle no canto superior direito)');
    console.log('3. Copie as chaves Secret e Publishable\n');

    const secretKey = await askQuestion('🔑 Cole sua STRIPE_SECRET_KEY (sk_test_...): ');
    const publishableKey = await askQuestion('🔑 Cole sua STRIPE_PUBLISHABLE_KEY (pk_test_...): ');
    
    const webhookSecret = await askQuestion('🔗 Cole sua STRIPE_WEBHOOK_SECRET (whsec_...) [opcional]: ');

    if (!secretKey.startsWith('sk_test_')) {
      console.log('❌ Erro: STRIPE_SECRET_KEY deve começar com "sk_test_"');
      rl.close();
      return;
    }

    if (!publishableKey.startsWith('pk_test_')) {
      console.log('❌ Erro: STRIPE_PUBLISHABLE_KEY deve começar com "pk_test_"');
      rl.close();
      return;
    }

    // Atualizar arquivo .env do servidor
    const serverEnvPath = path.join(__dirname, 'server', '.env');
    let serverEnv = fs.readFileSync(serverEnvPath, 'utf8');
    
    serverEnv = serverEnv.replace('STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI', `STRIPE_SECRET_KEY=${secretKey}`);
    serverEnv = serverEnv.replace('STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI', `STRIPE_PUBLISHABLE_KEY=${publishableKey}`);
    
    if (webhookSecret && webhookSecret.startsWith('whsec_')) {
      serverEnv = serverEnv.replace('STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI', `STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
    }

    fs.writeFileSync(serverEnvPath, serverEnv);

    // Atualizar arquivo .env do cliente
    const clientEnvPath = path.join(__dirname, 'client', '.env');
    let clientEnv = fs.readFileSync(clientEnvPath, 'utf8');
    
    clientEnv = clientEnv.replace('REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI', `REACT_APP_STRIPE_PUBLISHABLE_KEY=${publishableKey}`);

    fs.writeFileSync(clientEnvPath, clientEnv);

    console.log('\n✅ Configuração concluída com sucesso!');
    console.log('📁 Arquivos atualizados:');
    console.log('  - server/.env');
    console.log('  - client/.env');
    
    console.log('\n🧪 Para testar a conexão com o Stripe:');
    console.log('   cd server && node test-stripe.js');
    
    console.log('\n🚀 Para iniciar o sistema:');
    console.log('   npm run dev');

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
  } finally {
    rl.close();
  }
}

setupStripe();
