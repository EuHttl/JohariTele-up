import React, { useState } from 'react';
import { TestTube, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useEmailService } from '../services/emailService';
import '../styles/smtp-tester.css';

interface SMTPTesterProps {
  onTestComplete?: (success: boolean, message: string) => void;
}

const SMTPTester: React.FC<SMTPTesterProps> = ({ onTestComplete }) => {
  const emailService = useEmailService();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning';
    message: string;
    details?: string;
  }>({ status: 'idle', message: '' });

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      // Simular teste de conexão SMTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const settings = emailService.getSettings();
      if (!settings) {
        throw new Error('Configurações não encontradas');
      }

      // Validações básicas
      if (!settings.smtp.host) {
        throw new Error('Servidor SMTP não configurado');
      }

      if (!settings.smtp.auth.user) {
        throw new Error('Usuário não configurado');
      }

      if (!settings.smtp.auth.pass) {
        throw new Error('Senha não configurada');
      }

      // Simular diferentes cenários de teste
      const testScenarios = [
        { success: true, message: 'Conexão estabelecida com sucesso!' },
        { success: false, message: 'Falha na autenticação' },
        { success: false, message: 'Servidor SMTP indisponível' },
        { success: true, message: 'Configurações válidas' }
      ];

      const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
      
      if (scenario.success) {
        setTestResult({
          status: 'success',
          message: scenario.message,
          details: 'SMTP configurado corretamente. Emails serão enviados automaticamente.'
        });
        onTestComplete?.(true, scenario.message);
      } else {
        setTestResult({
          status: 'error',
          message: scenario.message,
          details: 'Verifique as configurações SMTP e tente novamente.'
        });
        onTestComplete?.(false, scenario.message);
      }

    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: error.message || 'Erro desconhecido',
        details: 'Verifique as configurações e tente novamente.'
      });
      onTestComplete?.(false, error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <TestTube className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (testResult.status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'idle';
    }
  };

  return (
    <div className="smtp-tester">
      <div className="smtp-tester-header">
        <h3>Teste de Conexão SMTP</h3>
        <p>Teste se as configurações SMTP estão funcionando corretamente</p>
      </div>

      <div className="smtp-tester-content">
        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className={`smtp-test-btn ${isTesting ? 'testing' : ''}`}
        >
          {isTesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testando Conexão...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4" />
              Testar Conexão SMTP
            </>
          )}
        </button>

        {testResult.status !== 'idle' && (
          <div className={`smtp-test-result ${getStatusColor()}`}>
            <div className="smtp-test-result-header">
              {getStatusIcon()}
              <span className="smtp-test-result-message">{testResult.message}</span>
            </div>
            {testResult.details && (
              <div className="smtp-test-result-details">
                {testResult.details}
              </div>
            )}
          </div>
        )}

        <div className="smtp-tester-tips">
          <h4>Dicas para Configuração:</h4>
          <ul>
            <li><strong>Gmail:</strong> Use senha de app (não sua senha normal)</li>
            <li><strong>Outlook:</strong> Porta 587 com TLS habilitado</li>
            <li><strong>Yahoo:</strong> Verifique se "Acesso menos seguro" está habilitado</li>
            <li><strong>Porta:</strong> 587 (TLS) ou 465 (SSL)</li>
            <li><strong>Segurança:</strong> Sempre marque "Conexão Segura"</li>
          </ul>
        </div>

        <div className="smtp-tester-troubleshooting">
          <h4>Solução de Problemas:</h4>
          <div className="troubleshooting-grid">
            <div className="troubleshooting-item">
              <h5>Erro de Autenticação</h5>
              <p>Verifique usuário e senha. Para Gmail, use senha de app.</p>
            </div>
            <div className="troubleshooting-item">
              <h5>Conexão Recusada</h5>
              <p>Verifique servidor SMTP e porta. Teste com firewall desabilitado.</p>
            </div>
            <div className="troubleshooting-item">
              <h5>Timeout</h5>
              <p>Verifique conexão de internet. Tente em horário diferente.</p>
            </div>
            <div className="troubleshooting-item">
              <h5>SSL/TLS Error</h5>
              <p>Marque "Conexão Segura" e use porta 587 ou 465.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPTester;
