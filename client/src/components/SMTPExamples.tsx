import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import '../styles/smtp-examples.css';

const SMTPExamples: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const examples = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      description: 'Mais popular e confiável',
      config: {
        server: 'smtp.gmail.com',
        port: '587',
        security: 'TLS',
        user: 'seu-email@gmail.com',
        password: 'Senha de app (16 caracteres)',
        notes: [
          'Ative verificação em 2 etapas',
          'Gere senha de app em myaccount.google.com/apppasswords',
          'Use a senha de app, não sua senha normal'
        ]
      }
    },
    {
      id: 'outlook',
      name: 'Outlook/Hotmail',
      icon: '📨',
      description: 'Boa para contas corporativas',
      config: {
        server: 'smtp-mail.outlook.com',
        port: '587',
        security: 'TLS',
        user: 'seu-email@outlook.com',
        password: 'Sua senha normal',
        notes: [
          'Use sua senha normal do Outlook',
          'Funciona com @outlook.com, @hotmail.com, @live.com',
          'Pode precisar ativar "Acesso menos seguro"'
        ]
      }
    },
    {
      id: 'yahoo',
      name: 'Yahoo Mail',
      icon: '📬',
      description: 'Alternativa confiável',
      config: {
        server: 'smtp.mail.yahoo.com',
        port: '587',
        security: 'TLS',
        user: 'seu-email@yahoo.com',
        password: 'Sua senha normal',
        notes: [
          'Ative "Acesso menos seguro" nas configurações',
          'Ou use senha de app se disponível',
          'Funciona com @yahoo.com, @ymail.com'
        ]
      }
    },
    {
      id: 'zoho',
      name: 'Zoho Mail',
      icon: '🏢',
      description: 'Ideal para empresas',
      config: {
        server: 'smtp.zoho.com',
        port: '587',
        security: 'TLS',
        user: 'seu-email@zoho.com',
        password: 'Sua senha normal',
        notes: [
          'Configuração simples e direta',
          'Boa para contas corporativas',
          'Suporte técnico excelente'
        ]
      }
    }
  ];

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const getStatusIcon = (itemId: string) => {
    if (copiedItem === itemId) {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    return <Copy className="w-4 h-4" />;
  };

  return (
    <div className="smtp-examples">
      <div className="smtp-examples-header">
        <h3>Exemplos de Configuração SMTP</h3>
        <p>Clique nos valores para copiar e colar nas configurações</p>
      </div>

      <div className="smtp-examples-grid">
        {examples.map((example) => (
          <div key={example.id} className="smtp-example-card">
            <div className="smtp-example-header">
              <div className="smtp-example-icon">{example.icon}</div>
              <div className="smtp-example-info">
                <h4>{example.name}</h4>
                <p>{example.description}</p>
              </div>
            </div>

            <div className="smtp-example-config">
              <div className="config-item">
                <label>Servidor SMTP:</label>
                <div className="config-value">
                  <code>{example.config.server}</code>
                  <button
                    onClick={() => handleCopy(example.config.server, `${example.id}-server`)}
                    className="copy-btn"
                    title="Copiar servidor"
                  >
                    {getStatusIcon(`${example.id}-server`)}
                  </button>
                </div>
              </div>

              <div className="config-item">
                <label>Porta:</label>
                <div className="config-value">
                  <code>{example.config.port}</code>
                  <button
                    onClick={() => handleCopy(example.config.port, `${example.id}-port`)}
                    className="copy-btn"
                    title="Copiar porta"
                  >
                    {getStatusIcon(`${example.id}-port`)}
                  </button>
                </div>
              </div>

              <div className="config-item">
                <label>Segurança:</label>
                <div className="config-value">
                  <code>{example.config.security}</code>
                  <button
                    onClick={() => handleCopy(example.config.security, `${example.id}-security`)}
                    className="copy-btn"
                    title="Copiar segurança"
                  >
                    {getStatusIcon(`${example.id}-security`)}
                  </button>
                </div>
              </div>

              <div className="config-item">
                <label>Usuário:</label>
                <div className="config-value">
                  <code>{example.config.user}</code>
                  <button
                    onClick={() => handleCopy(example.config.user, `${example.id}-user`)}
                    className="copy-btn"
                    title="Copiar usuário"
                  >
                    {getStatusIcon(`${example.id}-user`)}
                  </button>
                </div>
              </div>

              <div className="config-item">
                <label>Senha:</label>
                <div className="config-value">
                  <code>{example.config.password}</code>
                  <button
                    onClick={() => handleCopy(example.config.password, `${example.id}-password`)}
                    className="copy-btn"
                    title="Copiar senha"
                  >
                    {getStatusIcon(`${example.id}-password`)}
                  </button>
                </div>
              </div>
            </div>

            <div className="smtp-example-notes">
              <h5>Notas Importantes:</h5>
              <ul>
                {example.config.notes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))}
              </ul>
            </div>

            {example.id === 'gmail' && (
              <div className="smtp-example-links">
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="example-link"
                >
                  <ExternalLink className="w-4 h-4" />
                  Gerar Senha de App
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="smtp-examples-footer">
        <div className="smtp-examples-tip">
          <h4>💡 Dica Importante</h4>
          <p>
            Após configurar o SMTP, sempre teste a conexão antes de salvar. 
            Isso evita problemas com envio de emails.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMTPExamples;
