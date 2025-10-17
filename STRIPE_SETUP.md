# Configuração do Stripe - Sistema de Pagamentos

## 🔧 Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_stripe

# URLs do Sistema
FRONTEND_URL=http://localhost:3000
```

## 📋 Passo a Passo para Configurar

### 1. Criar Conta no Stripe
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta ou faça login
3. Ative o modo "Test" (para desenvolvimento)

### 2. Obter Chaves da API
1. No Dashboard do Stripe, vá em **Developers > API Keys**
2. Copie:
   - **Secret Key** (sk_test_...) → `STRIPE_SECRET_KEY`
   - **Publishable Key** (pk_test_...) → `STRIPE_PUBLISHABLE_KEY`

### 3. Configurar Webhook
1. No Dashboard, vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. **Endpoint URL**: `https://seu-dominio.com/api/payments/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copie o **Signing secret** (whsec_...) → `STRIPE_WEBHOOK_SECRET`

### 4. Configurar Produtos no Stripe
1. Vá em **Products** no Dashboard
2. Crie produtos para cada plano:
   - **Plano Profissional** - R$ 97,00/mês
   - **Plano Empresarial** - R$ 197,00/mês
3. Configure preços recorrentes (mensal/anual)

## 🚀 Como Funciona

### Fluxo de Pagamento:
1. **Usuário escolhe plano** → Interface mostra planos
2. **Clica em "Escolher Plano"** → Cria sessão Stripe Checkout
3. **Redireciona para Stripe** → Página de pagamento segura
4. **Usuário paga** → Stripe processa pagamento
5. **Webhook confirma** → Sistema atualiza assinatura
6. **Usuário retorna** → Plano ativo, limites atualizados

### Recursos Implementados:
- ✅ Checkout seguro com Stripe
- ✅ Assinaturas recorrentes (mensal/anual)
- ✅ Webhook para confirmação automática
- ✅ Cancelamento de assinaturas
- ✅ Renovação automática
- ✅ Histórico de pagamentos

## 🔒 Segurança

- **Chaves secretas**: Nunca expor no frontend
- **Webhook signature**: Verificação de autenticidade
- **HTTPS obrigatório**: Em produção
- **Validação de dados**: Todos os inputs validados

## 🧪 Testando

### Cartões de Teste Stripe:
- **Sucesso**: `4242 4242 4242 4242`
- **Falha**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

### Dados de Teste:
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura
- **CEP**: Qualquer CEP válido

## 📊 Monitoramento

- **Dashboard Stripe**: Visualizar pagamentos e assinaturas
- **Logs do sistema**: Verificar webhooks recebidos
- **Banco de dados**: Status das assinaturas

## 🚨 Troubleshooting

### Webhook não funciona:
1. Verificar URL do webhook
2. Confirmar HTTPS em produção
3. Verificar `STRIPE_WEBHOOK_SECRET`
4. Testar com Stripe CLI: `stripe listen --forward-to localhost:8080/api/payments/webhook`

### Pagamento não confirma:
1. Verificar logs do webhook
2. Confirmar eventos configurados
3. Verificar conexão com banco de dados

### Erro de chave inválida:
1. Confirmar chaves corretas do Stripe
2. Verificar se está em modo Test/Production correto
3. Confirmar variáveis de ambiente carregadas
