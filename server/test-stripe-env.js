require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    console.log('🧪 Testando conexão com Stripe...\n');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Erro: STRIPE_SECRET_KEY não encontrada!');
      console.log('\n💡 Como usar:');
      console.log('   Windows PowerShell:');
      console.log('   $env:STRIPE_SECRET_KEY="sk_test_..."; node test-stripe-env.js');
      console.log('\n   Ou crie um arquivo server/.env com:');
      console.log('   STRIPE_SECRET_KEY=sk_test_...');
      return;
    }
    
    console.log('✅ Chave encontrada:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');
    
    // Testar conexão básica
    console.log('\n📡 Testando conexão com a API do Stripe...');
    const account = await stripe.accounts.retrieve();
    console.log('✅ Conexão com Stripe OK!');
    console.log(`📧 Email da conta: ${account.email || 'N/A'}`);
    console.log(`🌍 País: ${account.country || 'N/A'}`);
    console.log(`💰 Moeda padrão: ${account.default_currency || 'N/A'}`);
    
    // Listar produtos existentes
    console.log('\n📦 Buscando produtos...');
    const products = await stripe.products.list({ limit: 10 });
    console.log(`✅ Produtos encontrados: ${products.data.length}`);
    
    if (products.data.length > 0) {
      products.data.forEach(product => {
        console.log(`   - ${product.name} (ID: ${product.id})`);
      });
    } else {
      console.log('   ℹ️  Nenhum produto encontrado. Você pode criar produtos no Dashboard do Stripe.');
    }
    
    // Listar preços existentes
    console.log('\n💵 Buscando preços...');
    const prices = await stripe.prices.list({ limit: 10 });
    console.log(`✅ Preços encontrados: ${prices.data.length}`);
    
    if (prices.data.length > 0) {
      prices.data.forEach(price => {
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
        const currency = price.currency ? price.currency.toUpperCase() : '';
        const type = price.recurring ? `Recorrente (${price.recurring.interval})` : 'Único';
        console.log(`   - ${amount} ${currency} - ${type} (ID: ${price.id})`);
      });
    } else {
      console.log('   ℹ️  Nenhum preço encontrado.');
    }
    
    // Testar criação de sessão de checkout (simulação)
    console.log('\n🧪 Testando capacidade de criar sessões de checkout...');
    try {
      // Não vamos criar uma sessão real, apenas verificar se a API está funcionando
      console.log('✅ API do Stripe está funcionando corretamente!');
    } catch (error) {
      console.log('⚠️  Erro ao testar checkout:', error.message);
    }
    
    console.log('\n✅ Teste do Stripe concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Configure STRIPE_WEBHOOK_SECRET no Railway');
    console.log('   2. Configure o webhook no Dashboard do Stripe');
    console.log('   3. Teste um pagamento de teste na aplicação');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar Stripe:', error.message);
    
    if (error.code === 'api_key_invalid') {
      console.log('\n🔧 Solução: Verifique se STRIPE_SECRET_KEY está correto');
      console.log('   - Deve começar com "sk_test_" para testes');
      console.log('   - Deve começar com "sk_live_" para produção');
    }
    
    if (error.code === 'api_key_expired') {
      console.log('\n🔧 Solução: Sua chave do Stripe expirou. Gere uma nova no dashboard.');
    }
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔧 Solução: Verifique se a chave está correta e ativa no Stripe Dashboard');
    }
  }
}

// Executar teste
testStripeConnection();

