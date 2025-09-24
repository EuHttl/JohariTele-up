import React, { useState, useEffect } from 'react';
import { Mail, Settings, Save, TestTube, Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { useEmailService, EmailSettings } from '../services/emailService';
import SMTPTester from './SMTPTester';
import SMTPExamples from './SMTPExamples';
import '../styles/email-settings.css';
import '../styles/smtp-tester.css';
import '../styles/smtp-examples.css';

const EmailSettingsComponent: React.FC = () => {
  const emailService = useEmailService();
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'templates' | 'notifications'>('general');

  useEffect(() => {
    setSettings(emailService.getSettings());
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setIsLoading(true);
    try {
      emailService.updateSettings(settings);
      setTestResult('success');
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      setTestResult('error');
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = () => {
    if (settings) {
      const newSettings = { ...settings, enabled: !settings.enabled };
      setSettings(newSettings);
      emailService.setEnabled(newSettings.enabled);
    }
  };

  const handleSmtpChange = (field: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        smtp: {
          ...settings.smtp,
          [field]: value
        }
      });
    }
  };

  const handleAuthChange = (field: string, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        smtp: {
          ...settings.smtp,
          auth: {
            ...settings.smtp.auth,
            [field]: value
          }
        }
      });
    }
  };

  const handleFromChange = (field: string, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        from: {
          ...settings.from,
          [field]: value
        }
      });
    }
  };

  if (!settings) {
    return (
      <div className="email-settings-loading">
        <div className="loading-spinner"></div>
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="email-settings">
      <div className="email-settings-header">
        <div className="email-settings-title">
          <Mail className="w-6 h-6" />
          <h2>Configurações de Email</h2>
        </div>
        <div className="email-settings-toggle">
          <button
            onClick={handleToggleEnabled}
            className={`email-toggle-btn ${settings.enabled ? 'enabled' : 'disabled'}`}
          >
            {settings.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            {settings.enabled ? 'Habilitado' : 'Desabilitado'}
          </button>
        </div>
      </div>

      <div className="email-settings-tabs">
        <button
          className={`email-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Settings className="w-4 h-4" />
          Geral
        </button>
        <button
          className={`email-tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Mail className="w-4 h-4" />
          Templates
        </button>
        <button
          className={`email-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell className="w-4 h-4" />
          Notificações
        </button>
      </div>

      <div className="email-settings-content">
        {activeTab === 'general' && (
          <div className="email-settings-panel">
            <div className="email-settings-section">
              <h3>Configurações SMTP</h3>
              <div className="email-form-grid">
                <div className="email-form-group">
                  <label>Servidor SMTP</label>
                  <input
                    type="text"
                    value={settings.smtp.host}
                    onChange={(e) => handleSmtpChange('host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="email-input"
                  />
                </div>
                <div className="email-form-group">
                  <label>Porta</label>
                  <input
                    type="number"
                    value={settings.smtp.port}
                    onChange={(e) => handleSmtpChange('port', parseInt(e.target.value))}
                    placeholder="587"
                    className="email-input"
                  />
                </div>
                <div className="email-form-group">
                  <label>Usuário</label>
                  <input
                    type="email"
                    value={settings.smtp.auth.user}
                    onChange={(e) => handleAuthChange('user', e.target.value)}
                    placeholder="seu@email.com"
                    className="email-input"
                  />
                </div>
                <div className="email-form-group">
                  <label>Senha</label>
                  <input
                    type="password"
                    value={settings.smtp.auth.pass}
                    onChange={(e) => handleAuthChange('pass', e.target.value)}
                    placeholder="Sua senha de app"
                    className="email-input"
                  />
                </div>
                <div className="email-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.smtp.secure}
                      onChange={(e) => handleSmtpChange('secure', e.target.checked)}
                    />
                    Conexão Segura (TLS/SSL)
                  </label>
                </div>
              </div>
            </div>

            <div className="email-settings-section">
              <h3>Remetente</h3>
              <div className="email-form-grid">
                <div className="email-form-group">
                  <label>Nome do Remetente</label>
                  <input
                    type="text"
                    value={settings.from.name}
                    onChange={(e) => handleFromChange('name', e.target.value)}
                    placeholder="Johari Tele-up"
                    className="email-input"
                  />
                </div>
                <div className="email-form-group">
                  <label>Email do Remetente</label>
                  <input
                    type="email"
                    value={settings.from.email}
                    onChange={(e) => handleFromChange('email', e.target.value)}
                    placeholder="noreply@johari-teleup.com"
                    className="email-input"
                  />
                </div>
              </div>
            </div>

            <div className="email-settings-actions">
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="email-save-btn"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>
            </div>

            {testResult && (
              <div className={`email-test-result ${testResult}`}>
                {testResult === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Conexão testada com sucesso!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Erro ao testar conexão. Verifique as configurações.</span>
                  </>
                )}
              </div>
            )}

            <SMTPTester onTestComplete={(success, message) => {
              setTestResult(success ? 'success' : 'error');
            }} />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="email-settings-panel">
            <div className="email-templates">
              {settings.templates.map((template) => (
                <div key={template.id} className="email-template-card">
                  <div className="email-template-header">
                    <h4>{template.name}</h4>
                    <span className="email-template-id">{template.id}</span>
                  </div>
                  <div className="email-template-content">
                    <div className="email-template-field">
                      <label>Assunto:</label>
                      <input
                        type="text"
                        value={template.subject}
                        className="email-template-input"
                        readOnly
                      />
                    </div>
                    <div className="email-template-field">
                      <label>Preview:</label>
                      <div className="email-template-preview">
                        {template.html.substring(0, 200)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <SMTPExamples />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="email-settings-panel">
            <div className="email-notifications-stats">
              <div className="email-stat-card">
                <h4>Total de Notificações</h4>
                <span className="email-stat-value">
                  {emailService.getNotifications().length}
                </span>
              </div>
              <div className="email-stat-card">
                <h4>Enviadas</h4>
                <span className="email-stat-value success">
                  {emailService.getNotificationsByStatus('sent').length}
                </span>
              </div>
              <div className="email-stat-card">
                <h4>Pendentes</h4>
                <span className="email-stat-value warning">
                  {emailService.getNotificationsByStatus('pending').length}
                </span>
              </div>
              <div className="email-stat-card">
                <h4>Falharam</h4>
                <span className="email-stat-value error">
                  {emailService.getNotificationsByStatus('failed').length}
                </span>
              </div>
            </div>

            <div className="email-notifications-actions">
              <button
                onClick={() => emailService.processPendingNotifications()}
                className="email-action-btn"
              >
                <Bell className="w-4 h-4" />
                Processar Pendentes
              </button>
              <button
                onClick={() => emailService.cleanupOldNotifications(30)}
                className="email-action-btn secondary"
              >
                <XCircle className="w-4 h-4" />
                Limpar Antigas (30 dias)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSettingsComponent;
