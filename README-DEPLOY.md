# 🚀 Deploy da Aplicação Janela de Johari

## ⚡ Deploy Rápido (5 minutos)

### 🎯 Opção 1: Deploy Automático

1. **Execute o script de deploy:**
   ```bash
   # Windows
   deploy.bat
   
   # Linux/Mac
   ./deploy.sh
   ```

2. **Siga as instruções na tela**

### 🎯 Opção 2: Deploy Manual

#### **Backend (Railway)**
1. Acesse [railway.app](https://railway.app)
2. Clique em "Login" → "GitHub"
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione seu repositório
5. Railway detectará automaticamente o Node.js

**Variáveis de Ambiente:**
- `NODE_ENV` = `production`
- `JWT_SECRET` = `johari_window_secret_key_2024_secure`
- `CORS_ORIGIN` = `https://johari-tele-up.vercel.app`

#### **Frontend (Vercel)**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Conecte com GitHub e selecione seu repositório
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

**Variáveis de Ambiente:**
- `REACT_APP_API_URL` = `https://joharitele-up-production.up.railway.app/api`

## 📱 Compartilhar com Participantes

### URLs Finais:
- **Aplicação**: `https://johari-tele-up.vercel.app`
- **Login**: `https://johari-tele-up.vercel.app/login`

### Credenciais:
- **Admin**: `hyttalo2002@gmail.com` / `admin123`
- **Participantes**: `email` / `123456` (12 participantes + 1 admin = 13 membros)

## 🔧 Teste Local

```bash
# Backend
cd server
npm install
npm start

# Frontend (em outro terminal)
cd client
npm install
npm run build
npm install -g serve
serve -s build -l 3000
```

## 📊 Estrutura do Projeto

```
johari-window/
├── client/                 # Frontend React
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Backend Node.js
│   ├── routes/
│   ├── database/
│   └── package.json
├── deploy.bat             # Script de deploy (Windows)
├── deploy.sh              # Script de deploy (Linux/Mac)
└── deploy-instructions.md # Instruções detalhadas
```

## 🛠️ Troubleshooting

### Problemas Comuns:
1. **CORS Error**: Verificar `CORS_ORIGIN` no backend
2. **API não conecta**: Verificar `REACT_APP_API_URL` no frontend
3. **Banco não inicializa**: Verificar logs do Railway
4. **Build falha**: Verificar dependências no package.json

### Logs:
- **Railway**: Dashboard → Project → Deployments → View Logs
- **Vercel**: Dashboard → Project → Functions → View Logs

## 🔒 Segurança

### Produção:
- JWT_SECRET forte
- CORS configurado
- HTTPS obrigatório
- Dados criptografados

### Dados:
- SQLite persistente no Railway
- Backup automático
- Dados dos participantes protegidos

## 📈 Monitoramento

### Railway:
- Uptime automático
- Logs em tempo real
- Métricas de uso

### Vercel:
- Analytics de acesso
- Performance metrics
- Deployments automáticos

## 🎯 Próximos Passos

1. **Deploy**: Siga as instruções acima
2. **Teste**: Verifique se tudo funciona
3. **Compartilhe**: Envie as URLs para os participantes
4. **Monitore**: Acompanhe o uso e performance
5. **Melhore**: Colete feedback e faça melhorias

---

**🎉 Sua aplicação estará online e pronta para uso em poucos minutos!**

