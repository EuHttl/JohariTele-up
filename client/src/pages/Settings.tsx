import React, { useState } from 'react';
import { Settings as SettingsIcon, Mail, Database, Shield, Bell } from 'lucide-react';
import EmailSettingsComponent from '../components/EmailSettings';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'database' | 'security' | 'notifications'>('email');

  const tabs = [
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'Banco de Dados', icon: Database },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-title">
          <SettingsIcon className="w-8 h-8" />
          <h1>Configurações do Sistema</h1>
        </div>
        <p className="settings-subtitle">
          Gerencie as configurações do sistema Johari Tele-up
        </p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'email' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Configurações de Email</h2>
                <p>Configure o servidor SMTP para envio de notificações automáticas</p>
              </div>
              <EmailSettingsComponent />
            </div>
          )}

          {activeTab === 'database' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Banco de Dados</h2>
                <p>Configurações de conexão e backup do banco de dados</p>
              </div>
              <div className="settings-placeholder">
                <Database className="w-16 h-16 text-gray-400" />
                <h3>Configurações de Banco de Dados</h3>
                <p>Em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Segurança</h2>
                <p>Configurações de segurança e autenticação</p>
              </div>
              <div className="settings-placeholder">
                <Shield className="w-16 h-16 text-gray-400" />
                <h3>Configurações de Segurança</h3>
                <p>Em desenvolvimento...</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <div className="settings-panel-header">
                <h2>Notificações</h2>
                <p>Configure quando e como enviar notificações</p>
              </div>
              <div className="settings-placeholder">
                <Bell className="w-16 h-16 text-gray-400" />
                <h3>Configurações de Notificações</h3>
                <p>Em desenvolvimento...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
