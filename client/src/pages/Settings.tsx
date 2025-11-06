import React, { useState } from 'react';
import { Settings as SettingsIcon, Mail, Database, Shield, Bell, ChevronRight } from 'lucide-react';
import EmailSettingsComponent from '../components/EmailSettings';
import '../styles/design-system.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'database' | 'security' | 'notifications'>('email');

  const tabs = [
    { id: 'email', label: 'Email', icon: Mail, description: 'Configurações SMTP' },
    { id: 'database', label: 'Banco de Dados', icon: Database, description: 'Conexão e backup' },
    { id: 'security', label: 'Segurança', icon: Shield, description: 'Autenticação e tokens' },
    { id: 'notifications', label: 'Notificações', icon: Bell, description: 'Alertas e avisos' }
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px' }}>
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Gerencie as configurações do sistema</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)' }}>
        {/* Sidebar Navigation */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-4)',
                      border: 'none',
                      background: isActive ? 'var(--bg-gray-50)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      textAlign: 'left',
                      width: '100%',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--bg-gray-50)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isActive ? 600 : 500, fontSize: '0.875rem' }}>{tab.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                        {tab.description}
                      </div>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {activeTab === 'email' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="stat-icon" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Configurações de Email</h3>
                    <p className="card-subtitle">Configure o servidor SMTP para envio de notificações</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <EmailSettingsComponent />
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="stat-icon" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Banco de Dados</h3>
                    <p className="card-subtitle">Configurações de conexão e backup</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="empty-state">
                  <Database className="empty-state-icon" style={{ color: 'var(--text-tertiary)' }} />
                  <h3 className="empty-state-title">Em Desenvolvimento</h3>
                  <p className="empty-state-description">
                    As configurações de banco de dados estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="stat-icon" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Segurança</h3>
                    <p className="card-subtitle">Configurações de segurança e autenticação</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="empty-state">
                  <Shield className="empty-state-icon" style={{ color: 'var(--text-tertiary)' }} />
                  <h3 className="empty-state-title">Em Desenvolvimento</h3>
                  <p className="empty-state-description">
                    As configurações de segurança estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="stat-icon" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="card-title">Notificações</h3>
                    <p className="card-subtitle">Configure quando e como enviar notificações</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="empty-state">
                  <Bell className="empty-state-icon" style={{ color: 'var(--text-tertiary)' }} />
                  <h3 className="empty-state-title">Em Desenvolvimento</h3>
                  <p className="empty-state-description">
                    As configurações de notificações estarão disponíveis em breve.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
