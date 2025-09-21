# 🚀 Deploy da Aplicação Janela de Johari

## 📋 Pré-requisitos
- Conta no GitHub
- Conta no Railway (gratuita)
- Conta no Vercel (gratuita)

## 🎯 Deploy do Backend (Railway)

### 1. Preparar Repositório
```bash
# No diretório raiz do projeto
git init
git add .
git commit -m "Initial commit - Janela de Johari"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/johari-window.git
git push -u origin main
```

### 2. Deploy no Railway
1. Acesse [railway.app](https://railway.app)
2. Clique em "Login" → "GitHub"
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório
5. Railway detectará automaticamente o Node.js

### 3. Configurar Variáveis de Ambiente
No Railway Dashboard:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `johari_window_secret_key_2024_secure`
- `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app`

### 4. Configurar Build
Railway usará automaticamente:
- **Root Directory**: `/server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 🎨 Deploy do Frontend (Vercel)

### 1. Preparar Frontend
```bash
# No diretório client
cd client
npm install
npm run build
```

### 2. Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Conecte com GitHub e selecione seu repositório
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3. Configurar Variáveis de Ambiente
No Vercel Dashboard:
- `REACT_APP_API_URL` = `https://your-railway-backend.railway.app/api`

## 🔄 Atualizar URLs

### 1. Backend (Railway)
Após deploy, copie a URL do Railway e atualize:
- `CORS_ORIGIN` = URL do Vercel

### 2. Frontend (Vercel)
Após deploy, copie a URL do Railway e atualize:
- `REACT_APP_API_URL` = URL do Railway + `/api`

## 📱 Compartilhar com Participantes

### URLs Finais:
- **Aplicação**: `https://your-app.vercel.app`
- **Login Admin**: `https://your-app.vercel.app/login`
- **Login Participante**: `https://your-app.vercel.app/login`

### Credenciais:
- **Admin**: `hyttalo2002@gmail.com` / `admin123`
- **Participante**: `hyttalo2002@gmail.com` / `123456`
- **Outros Participantes**: `email` / `123456`

## 🛠️ Comandos Úteis

### Build Local (Teste)
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run build
npm install -g serve
serve -s build -l 3000
```

### Deploy Manual
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run build
# Upload da pasta build para servidor
```

## 🔧 Troubleshooting

### Problemas Comuns:
1. **CORS Error**: Verificar `CORS_ORIGIN` no backend
2. **API não conecta**: Verificar `REACT_APP_API_URL` no frontend
3. **Banco não inicializa**: Verificar logs do Railway
4. **Build falha**: Verificar dependências no package.json

### Logs:
- **Railway**: Dashboard → Project → Deployments → View Logs
- **Vercel**: Dashboard → Project → Functions → View Logs

## 📊 Monitoramento

### Railway:
- Uptime automático
- Logs em tempo real
- Métricas de uso

### Vercel:
- Analytics de acesso
- Performance metrics
- Deployments automáticos

## 🔒 Segurança

### Produção:
- JWT_SECRET forte
- CORS configurado
- HTTPS obrigatório
- Rate limiting (opcional)

### Dados:
- SQLite persistente no Railway
- Backup automático
- Dados criptografados
