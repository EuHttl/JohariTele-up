# Script PowerShell para configurar variáveis de ambiente

Write-Host "🔧 Configurando Variáveis de Ambiente - Janela de Johari" -ForegroundColor Cyan
Write-Host ""

# Verificar se os arquivos existem
$serverEnvPath = "server\.env"
$clientEnvPath = "client\.env"

# Criar arquivo .env do servidor se não existir
if (-not (Test-Path $serverEnvPath)) {
    Write-Host "📁 Criando server/.env..." -ForegroundColor Yellow
    
    $serverEnvContent = @"
# Configuração do Servidor
PORT=8080
NODE_ENV=development

# JWT Secret (obrigatório)
JWT_SECRET=johari_secret_key_2024_development

# Banco de Dados
# Para desenvolvimento local (SQLite) - deixe comentado
# Para produção (PostgreSQL) - descomente e configure
# DATABASE_URL=postgresql://usuario:senha@host:porta/database

# Stripe Configuration (obrigatório para pagamentos)
# Obtenha suas chaves em: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_SEU_WEBHOOK_SECRET_AQUI

# URLs do Sistema
FRONTEND_URL=http://localhost:3000

# CORS Origins (para produção)
# CORS_ORIGIN=https://johari.vercel.app
"@
    
    Set-Content -Path $serverEnvPath -Value $serverEnvContent
    Write-Host "✅ server/.env criado!" -ForegroundColor Green
} else {
    Write-Host "✅ server/.env já existe" -ForegroundColor Green
}

# Criar arquivo .env do cliente se não existir
if (-not (Test-Path $clientEnvPath)) {
    Write-Host "📁 Criando client/.env..." -ForegroundColor Yellow
    
    $clientEnvContent = @"
# Configuração do Cliente React
# URL da API do servidor
REACT_APP_API_URL=http://localhost:8080/api

# Chave pública do Stripe (para o frontend)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_SUA_CHAVE_PUBLICA_AQUI
"@
    
    Set-Content -Path $clientEnvPath -Value $clientEnvContent
    Write-Host "✅ client/.env criado!" -ForegroundColor Green
} else {
    Write-Host "✅ client/.env já existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Próximos Passos:" -ForegroundColor Cyan
Write-Host "1. Acesse: https://dashboard.stripe.com/apikeys" -ForegroundColor White
Write-Host "2. Copie suas chaves do Stripe (modo Test)" -ForegroundColor White
Write-Host "3. Edite os arquivos .env com suas chaves" -ForegroundColor White
Write-Host "4. Execute: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação completa em: CONFIGURACAO_RAPIDA.md" -ForegroundColor Yellow
