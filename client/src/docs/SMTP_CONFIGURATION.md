# Guia de Configuração SMTP

Este guia explica como configurar o servidor SMTP para envio de notificações automáticas no sistema Janela de Johari.

## 📧 Configurações SMTP Suportadas

### 1. Gmail (Recomendado)

**Configurações:**
- **Servidor SMTP:** `smtp.gmail.com`
- **Porta:** `587` (TLS) ou `465` (SSL)
- **Conexão Segura:** Sim (TLS/SSL)
- **Autenticação:** Sim

**Como configurar:**

1. **Ative a verificação em 2 etapas** na sua conta Google
2. **Gere uma senha de app:**
   - Acesse: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite "Janela de Johari" como nome
   - Copie a senha gerada (16 caracteres)

3. **Configure no sistema:**
   ```
   Servidor SMTP: smtp.gmail.com
   Porta: 587
   Conexão Segura: Sim
   Usuário: seu-email@gmail.com
   Senha: [senha de app gerada]
   ```

### 2. Outlook/Hotmail

**Configurações:**
- **Servidor SMTP:** `smtp-mail.outlook.com`
- **Porta:** `587`
- **Conexão Segura:** Sim (TLS)

**Como configurar:**
```
Servidor SMTP: smtp-mail.outlook.com
Porta: 587
Conexão Segura: Sim
Usuário: seu-email@outlook.com
Senha: [sua senha normal]
```

### 3. Yahoo Mail

**Configurações:**
- **Servidor SMTP:** `smtp.mail.yahoo.com`
- **Porta:** `587` ou `465`
- **Conexão Segura:** Sim

**Como configurar:**
```
Servidor SMTP: smtp.mail.yahoo.com
Porta: 587
Conexão Segura: Sim
Usuário: seu-email@yahoo.com
Senha: [sua senha normal]
```

### 4. Serviços de Email Corporativo

#### Microsoft Exchange
```
Servidor SMTP: [servidor da empresa]
Porta: 587 ou 25
Conexão Segura: Sim
Usuário: seu-email@empresa.com
Senha: [sua senha corporativa]
```

#### Zoho Mail
```
Servidor SMTP: smtp.zoho.com
Porta: 587
Conexão Segura: Sim
Usuário: seu-email@zoho.com
Senha: [sua senha]
```

## 🔧 Configuração Passo a Passo

### Passo 1: Acessar Configurações
1. Faça login no sistema Janela de Johari
2. Navegue para **Configurações** → **Email**
3. Clique em **Habilitar** se ainda não estiver ativo

### Passo 2: Configurar SMTP
1. **Servidor SMTP:** Digite o servidor do seu provedor
2. **Porta:** Digite a porta (geralmente 587)
3. **Usuário:** Seu endereço de email completo
4. **Senha:** Sua senha ou senha de app
5. **Conexão Segura:** Marque se necessário

### Passo 3: Testar Conexão
1. Clique em **"Testar Conexão"**
2. Aguarde o resultado do teste
3. Se bem-sucedido, clique em **"Salvar Configurações"**

### Passo 4: Configurar Remetente
1. **Nome do Remetente:** "Janela de Johari" (ou personalizado)
2. **Email do Remetente:** Seu email (deve ser o mesmo do SMTP)

## 📋 Templates de Email Disponíveis

### 1. Boas-vindas
- **Quando:** Novo participante cadastrado
- **Conteúdo:** Código de participante, link para avaliação
- **Variáveis:** `{{participantName}}`, `{{participantCode}}`, `{{assessmentLink}}`

### 2. Lembrete
- **Quando:** Participante não completou avaliação
- **Conteúdo:** Incentivo para completar, link direto
- **Variáveis:** `{{participantName}}`, `{{participantCode}}`, `{{assessmentLink}}`

### 3. Avaliação Concluída
- **Quando:** Participante finaliza autoavaliação
- **Conteúdo:** Confirmação, link para relatório
- **Variáveis:** `{{participantName}}`, `{{reportLink}}`

### 4. Relatório Pronto
- **Quando:** Relatório individual gerado
- **Conteúdo:** Link para visualizar relatório
- **Variáveis:** `{{participantName}}`, `{{reportLink}}`

## 🚨 Solução de Problemas

### Erro: "Falha na autenticação"
**Causas possíveis:**
- Senha incorreta
- Verificação em 2 etapas não configurada (Gmail)
- Conta bloqueada por segurança

**Soluções:**
1. Verifique a senha
2. Use senha de app (Gmail)
3. Verifique se a conta não está bloqueada

### Erro: "Conexão recusada"
**Causas possíveis:**
- Porta incorreta
- Firewall bloqueando
- Servidor SMTP incorreto

**Soluções:**
1. Verifique a porta (587 ou 465)
2. Teste com firewall desabilitado
3. Confirme o servidor SMTP

### Erro: "Timeout"
**Causas possíveis:**
- Conexão lenta
- Servidor indisponível
- Configurações de rede

**Soluções:**
1. Aguarde e tente novamente
2. Verifique sua conexão
3. Teste em horário diferente

## 🔒 Segurança

### Boas Práticas
1. **Use senhas de app** para Gmail
2. **Nunca compartilhe** credenciais SMTP
3. **Monitore** logs de envio
4. **Configure limites** de envio se necessário

### Configurações Seguras
- ✅ Sempre use TLS/SSL
- ✅ Use portas seguras (587, 465)
- ✅ Configure autenticação
- ✅ Monitore tentativas de login

## 📊 Monitoramento

### Estatísticas Disponíveis
- **Total de notificações** enviadas
- **Taxa de sucesso** de envio
- **Notificações pendentes**
- **Falhas** de envio

### Logs de Email
- Data/hora de envio
- Destinatário
- Status (enviado/falhou)
- Tipo de notificação

## 🎯 Configurações Recomendadas por Provedor

### Gmail (Mais Popular)
```
Servidor: smtp.gmail.com
Porta: 587
Segurança: TLS
Autenticação: Sim
Senha: Senha de app (16 caracteres)
```

### Outlook (Corporativo)
```
Servidor: smtp-mail.outlook.com
Porta: 587
Segurança: TLS
Autenticação: Sim
Senha: Senha normal
```

### Yahoo (Alternativo)
```
Servidor: smtp.mail.yahoo.com
Porta: 587
Segurança: TLS
Autenticação: Sim
Senha: Senha normal
```

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique** as configurações básicas
2. **Teste** a conexão
3. **Consulte** este guia
4. **Entre em contato** com o suporte técnico

---

**Nota:** Este sistema usa armazenamento local para configurações. Em produção, considere usar variáveis de ambiente para maior segurança.
