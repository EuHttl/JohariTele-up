# Janela de Johari - Sistema de Avaliação

Sistema web para aplicação da Janela de Johari, uma ferramenta de psicologia organizacional que ajuda no autoconhecimento e desenvolvimento de equipes.

## 🚀 Tecnologias

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite (zero configuração!)
- **Autenticação**: JWT

## ✨ Características

- ✅ **Fácil de usar**: Interface intuitiva
- ✅ **Zero configuração**: SQLite funciona imediatamente
- ✅ **Pronto para deploy**: Funciona em qualquer plataforma
- ✅ **Responsivo**: Funciona em desktop e mobile
- ✅ **Seguro**: Autenticação JWT e senhas criptografadas

## 🛠️ Instalação e Execução

### 1. Clonar o repositório
```bash
git clone <seu-repositorio>
cd johari
```

### 2. Instalar dependências
```bash
npm run install-all
```

### 3. Configurar variáveis de ambiente
```bash
cp env.example .env
```

### 4. Executar em desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📊 Como Usar

## 📁 Estrutura do Projeto

```
johari/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Context API (autenticação)
│   │   └── services/       # Serviços de API
├── server/                 # Backend Node.js
│   ├── routes/             # Rotas da API
│   ├── database/           # Configuração do SQLite
│   └── index.js           # Servidor principal
└── johari.db              # Banco de dados SQLite (criado automaticamente)
```

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa frontend e backend em desenvolvimento
npm run server       # Executa apenas o backend
npm run client       # Executa apenas o frontend
npm run build        # Build do frontend para produção
npm run install-all  # Instala dependências do projeto e do client
```
## 👥 Janela de Johari

A Janela de Johari é uma ferramenta que divide as características pessoais em 4 quadrantes:

1. **Área Aberta**: O que você e outros sabem sobre você
2. **Área Cega**: O que outros sabem, mas você não percebe
3. **Área Oculta**: O que você sabe, mas outros não
4. **Área Desconhecida**: O que nem você nem outros sabem

## 🎯 Funcionalidades

- ✅ Autoavaliação individual
- ✅ Avaliação entre pares
- ✅ Relatórios detalhados
- ✅ Autenticação segura
- ✅ Backup automático do banco

## 📱 Interface

- **Dashboard**: Visão geral do sistema
- **Participantes**: Gerenciar participantes
- **Avaliações**: Interface de avaliação
- **Relatórios**: Visualizar resultados

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados
- Proteção contra SQL injection (SQLite)

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o arquivo `.env` está configurado
3. Verifique os logs do servidor no terminal

## 🎉 Pronto para Usar!

O sistema está configurado para funcionar imediatamente. Basta executar `npm run dev` e começar a usar!