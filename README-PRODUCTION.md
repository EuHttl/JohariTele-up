# 🎯 Janela de Johari - Sistema de Avaliação

Sistema completo para aplicação da Janela de Johari, permitindo autoavaliação e avaliação entre pares.

## 🚀 Deploy em Produção

### Railway (Backend)
- **URL**: https://johari-production.up.railway.app
- **Banco**: PostgreSQL
- **Status**: ✅ Ativo

### Vercel (Frontend)
- **URL**: https://johari-window.vercel.app
- **Status**: ✅ Ativo

## 📋 Funcionalidades

- ✅ **Autenticação** de administradores
- ✅ **Gestão de participantes** (até 15)
- ✅ **Autoavaliação** com 67 características
- ✅ **Avaliação entre pares**
- ✅ **Relatórios** da Janela de Johari
- ✅ **Dashboard** administrativo

## 🗄️ Banco de Dados

- **Produção**: PostgreSQL (Railway)
- **Desenvolvimento**: SQLite (local)

## 🔧 Tecnologias

### Backend
- Node.js + Express
- PostgreSQL/SQLite
- JWT Authentication
- CORS configurado

### Frontend
- React + TypeScript
- Tailwind CSS
- Axios para API
- Context API para estado

## 📁 Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Node.js
├── railway.json     # Configuração Railway
└── README.md        # Documentação completa
```

## 🔐 Variáveis de Ambiente

### Railway (Backend)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=johari_window_secret_key_2024_secure
DATABASE_URL=postgresql://...
```

### Vercel (Frontend)
```env
REACT_APP_API_URL=https://johari-production.up.railway.app/api
```

## 🎯 Acesso

- **Admin**: admin / admin123
- **Participante**: Código gerado automaticamente

## 📊 Status

- ✅ **Backend**: Funcionando
- ✅ **Frontend**: Funcionando  
- ✅ **Banco**: Conectado
- ✅ **Deploy**: Ativo

---

**Desenvolvido com ❤️ para facilitar a aplicação da Janela de Johari**
