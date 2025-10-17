# 🚀 Configuração Rápida - Sistema de Pagamentos

## 📋 Passo a Passo para Configurar

### 1. Obter Chaves do Stripe

1. **Acesse o Dashboard do Stripe:**
   - Vá para: https://dashboard.stripe.com/apikeys
   - Faça login ou crie uma conta gratuita

2. **Ative o Modo Test:**
   - No canto superior direito, certifique-se que está em "Test mode"
   - Toggle deve estar azul/ativo

3. **Copie as Chaves:**
   - **Secret Key**: `sk_test_...` (clique em "Reveal")
   - **Publishable Key**: `pk_test_...` (visível)

### 2. Configurar Webhook (Opcional para testes locais)

1. **No Dashboard do Stripe:**
   - Vá em "Developers" > "Webhooks"
   - Clique em "Add endpoint"

2. **Para Desenvolvimento Local:**
   - Use o Stripe CLI: `stripe listen --forward-to localhost:8080/api/payments/webhook`
   - Copie o `whsec_...` que aparece

3. **Para Produção:**
   - URL: `https://seu-dominio.com/api/payments/webhook`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

### 3. Executar Configuração Automática

```bash
# Execute o script de configuração
node setup-stripe.js
```

**Ou configure manualmente:**

Edite `server/.env`:
```env
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_aqui
```

Edite `client/.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
```

### 4. Testar Configuração

```bash
# Testar conexão com Stripe
cd server && node test-stripe.js

# Iniciar o sistema
npm run dev
```

## 🧪 Cartões de Teste

Use estes cartões para testar pagamentos:

| Número | Resultado | Descrição |
|--------|-----------|-----------|
| `4242 4242 4242 4242` | ✅ Sucesso | Pagamento aprovado |
| `4000 0000 0000 0002` | ❌ Falha | Cartão recusado |
| `4000 0027 6000 3184` | 🔐 3D Secure | Requer autenticação |

**Outros dados:**
- **CVV**: Qualquer 3 dígitos (ex: 123)
- **Data**: Qualquer data futura (ex: 12/25)
- **CEP**: Qualquer CEP válido (ex: 01234-567)

## 🔧 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se copiou a chave correta
- Confirme que está em modo "Test"
- Certifique-se que não há espaços extras

### Webhook não funciona
- Para desenvolvimento: use Stripe CLI
- Para produção: configure URL HTTPS
- Verifique se eventos estão selecionados

### Pagamento não confirma
- Verifique logs do servidor
- Confirme webhook configurado
- Teste com cartão `4242 4242 4242 4242`

## 🎯 Próximos Passos

1. ✅ Configurar chaves do Stripe
2. ✅ Testar pagamentos
3. ✅ Configurar webhook
4. 🚀 Deploy em produção
5. 💳 Ativar modo "Live" no Stripe

## 📞 Suporte

- **Stripe Docs**: https://stripe.com/docs
- **Dashboard**: https://dashboard.stripe.com
- **Test Mode**: Sempre use em desenvolvimento!
