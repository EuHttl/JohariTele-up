# 🔧 Variáveis de Ambiente para Railway

## 📋 Variáveis Obrigatórias

### Backend (Railway)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=johari_window_secret_key_2024_secure
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-railway-backend.railway.app/api
```

## 🗄️ Variáveis de Banco de Dados (Opcionais)

**Nota**: O projeto atualmente usa SQLite por padrão, mas suporta PostgreSQL e MySQL. Se você quiser usar um banco externo no Railway, adicione estas variáveis:

### Para PostgreSQL
```env
DB_TYPE=postgres
DB_HOST=your-postgres-host.railway.app
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_NAME=johari_assessment
```

### Para MySQL
```env
DB_TYPE=mysql
DB_HOST=your-mysql-host.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=johari_assessment
```

## 🚀 Como Configurar no Railway

### 1. Acesse o Dashboard do Railway
- Vá para [railway.app](https://railway.app)
- Selecione seu projeto

### 2. Adicione as Variáveis
- Clique em "Variables" no menu lateral
- Adicione cada variável uma por uma:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `JWT_SECRET` | `johari_window_secret_key_2024_secure` | Chave secreta para JWT (mude para algo único) |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | URL do seu frontend no Vercel |

### 3. Para Banco de Dados Externo (Opcional)
Se você quiser usar PostgreSQL ou MySQL em vez do SQLite:

1. **Adicione um serviço de banco no Railway:**
   - Clique em "New" → "Database" → "PostgreSQL" (ou MySQL)
   - Railway criará automaticamente as variáveis de conexão

2. **As variáveis serão criadas automaticamente:**
   - `DATABASE_URL` (conexão completa)
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` (PostgreSQL)
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` (MySQL)

3. **Adicione a variável de tipo:**
   - `DB_TYPE=postgres` (ou `mysql`)

## 🔒 Segurança

### ⚠️ Importante:
- **NUNCA** commite arquivos `.env` no repositório
- Use senhas fortes para `JWT_SECRET`
- Configure `CORS_ORIGIN` corretamente
- Para produção, use um `JWT_SECRET` único e complexo

### 🔐 JWT_SECRET Seguro:
```bash
# Gere uma chave segura (Linux/Mac)
openssl rand -base64 32

# Ou use um gerador online
# https://generate-secret.vercel.app/32
```

## 📝 Exemplo Completo

### Backend (.env no Railway):
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_key_here_2024
CORS_ORIGIN=https://johari-window.vercel.app
```

### Frontend (.env no Vercel):
```env
REACT_APP_API_URL=https://johari-window-backend.railway.app/api
```

## 🛠️ Troubleshooting

### Problemas Comuns:

1. **CORS Error**: Verifique se `CORS_ORIGIN` está correto
2. **API não conecta**: Verifique se `REACT_APP_API_URL` está correto
3. **JWT inválido**: Verifique se `JWT_SECRET` é o mesmo em ambos os ambientes
4. **Banco não conecta**: Verifique as variáveis de banco de dados

### Logs:
- Railway: Dashboard → Project → Deployments → View Logs
- Vercel: Dashboard → Project → Functions → View Logs

---

**✅ Após configurar essas variáveis, sua aplicação estará pronta para produção!**
