#!/bin/bash

echo "🚀 Iniciando deploy da aplicação Janela de Johari..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Git está configurado
if ! git config user.email > /dev/null 2>&1; then
    print_error "Git não está configurado. Configure primeiro:"
    echo "git config --global user.name 'Seu Nome'"
    echo "git config --global user.email 'seu@email.com'"
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script no diretório raiz do projeto"
    exit 1
fi

print_status "Preparando projeto para deploy..."

# Build do frontend
print_status "Fazendo build do frontend..."
cd client
if npm run build; then
    print_success "Build do frontend concluído!"
else
    print_error "Falha no build do frontend"
    exit 1
fi
cd ..

# Preparar arquivos para deploy
print_status "Preparando arquivos..."

# Criar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
client/node_modules/

# Production builds
client/build/

# Environment variables
.env
.env.local
.env.production
server/.env

# Database
*.db
*.sqlite

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF
    print_success ".gitignore criado"
fi

# Verificar se há mudanças para commit
if git diff --quiet && git diff --cached --quiet; then
    print_warning "Nenhuma mudança para commit"
else
    print_status "Fazendo commit das mudanças..."
    git add .
    git commit -m "Deploy: Build de produção $(date)"
    print_success "Commit realizado"
fi

# Verificar se remote origin existe
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "Remote origin não configurado"
    echo "Configure o remote origin com:"
    echo "git remote add origin https://github.com/seu-usuario/johari-window.git"
    echo "git push -u origin main"
else
    print_status "Fazendo push para o repositório..."
    if git push origin main; then
        print_success "Push realizado com sucesso!"
    else
        print_error "Falha no push"
        exit 1
    fi
fi

print_success "🎉 Deploy preparado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://railway.app e faça deploy do backend"
echo "2. Acesse https://vercel.com e faça deploy do frontend"
echo "3. Configure as variáveis de ambiente conforme deploy-instructions.md"
echo ""
echo "📖 Instruções completas em: deploy-instructions.md"

