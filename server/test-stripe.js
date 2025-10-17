const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    console.log('🧪 Testando conexão com Stripe...');
    
    // Testar conexão básica
    const account = await stripe.accounts.retrieve();
    console.log('✅ Conexão com Stripe OK');
    console.log(`📧 Email da conta: ${account.email}`);
    console.log(`🌍 País: ${account.country}`);
    console.log(`💰 Moeda padrão: ${account.default_currency}`);
    
    // Listar produtos existentes
    const products = await stripe.products.list({ limit: 5 });
    console.log(`\n📦 Produtos encontrados: ${products.data.length}`);
    
    products.data.forEach(product => {
      console.log(`  - ${product.name} (${product.id})`);
    });
    
    // Listar preços existentes
    const prices = await stripe.prices.list({ limit: 5 });
    console.log(`\n💵 Preços encontrados: ${prices.data.length}`);
    
    prices.data.forEach(price => {
      console.log(`  - ${price.unit_amount / 100} ${price.currency.toUpperCase()} - ${price.recurring ? 'Recorrente' : 'Único'}`);
    });
    
    console.log('\n✅ Teste do Stripe concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar Stripe:', error.message);
    
    if (error.code === 'api_key_invalid') {
      console.log('\n🔧 Solução: Verifique se STRIPE_SECRET_KEY está correto no .env');
    }
    
    if (error.code === 'api_key_expired') {
      console.log('\n🔧 Solução: Sua chave do Stripe expirou. Gere uma nova no dashboard.');
    }
  }
}

// Executar teste apenas se chamado diretamente
if (require.main === module) {
  testStripeConnection();
}

module.exports = testStripeConnection;
