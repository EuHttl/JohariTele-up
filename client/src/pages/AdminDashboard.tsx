import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  BarChart3,
  Grid3X3,
  Eye,
  RefreshCw,
  Settings,
  Database,
  Server,
  Shield,
  Download,
  Upload
} from 'lucide-react';
import '../styles/admin.css';

interface AssessmentTracking {
  summary: {
    total_possible_evaluations: number;
    completed_evaluations: number;
    partial_evaluations: number;
    not_started: number;
  };
  evaluations: Array<{
    assessor: {
      id: number;
      name: string;
      code: string;
    };
    evaluations: Array<{
      assessed: {
        id: number;
        name: string;
        code: string;
      };
      status: 'completed' | 'partial' | 'not_started';
      last_activity?: string;
    }>;
  }>;
}

interface SystemStatus {
  database: 'online' | 'offline';
  api: 'online' | 'offline';
  storage: 'online' | 'offline';
}

interface SystemSettings {
  email_notifications: boolean;
  auto_backup: boolean;
  debug_mode: boolean;
  backup_frequency: string;
  last_backup: string | null;
  backup_retention_days: number;
}

interface BackupFile {
  filename: string;
  size: number;
  created: string;
  modified: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState<AssessmentTracking | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    api: 'online',
    storage: 'online'
  });
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trackingData, settingsData, backupsData] = await Promise.all([
        adminAPI.getAssessmentTracking(),
        adminAPI.getSettings(),
        adminAPI.getBackups()
      ]);
      
      setTracking(trackingData);
      setSettings(settingsData);
      setBackups(backupsData);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError(error.response?.data?.message || 'Erro ao carregar dados do admin');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await adminAPI.createBackup();
      setSuccess(`Backup criado com sucesso: ${result.filename}`);
      
      // Atualizar lista de backups
      const backupsData = await adminAPI.getBackups();
      setBackups(backupsData);
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
      setError(error.response?.data?.error || 'Erro ao criar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (!window.confirm(`Tem certeza que deseja restaurar o backup "${filename}"? Esta ação irá substituir todos os dados atuais.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await adminAPI.restoreBackup(filename);
      setSuccess(`Backup restaurado com sucesso: ${result.filename}`);
      
      // Recarregar dados
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao restaurar backup:', error);
      setError(error.response?.data?.error || 'Erro ao restaurar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Tem certeza que deseja limpar TODOS os dados do sistema? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await adminAPI.clearData();
      setSuccess(result.message);
      
      // Recarregar dados
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao limpar dados:', error);
      setError(error.response?.data?.error || 'Erro ao limpar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingToggle = async (settingKey: keyof SystemSettings) => {
    if (!settings) return;

    try {
      const newSettings = {
        ...settings,
        [settingKey]: !settings[settingKey]
      };
      
      const updatedSettings = await adminAPI.updateSettings(newSettings);
      setSettings(updatedSettings);
      setSuccess('Configuração atualizada com sucesso');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      setError(error.response?.data?.error || 'Erro ao atualizar configuração');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-content">
          <div className="admin-loading-spinner"></div>
          <p className="admin-loading-text">Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  const stats = {
    users: tracking?.evaluations.length || 0,
    sessions: tracking?.summary.total_possible_evaluations || 0,
    assessments: tracking?.summary.completed_evaluations || 0,
    reports: Math.floor((tracking?.summary.completed_evaluations || 0) / 2)
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-section">
          <div className="admin-title-icon">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="admin-title">Painel Administrativo</h1>
            <p className="admin-subtitle">Gerencie o sistema e monitore as atividades</p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="admin-action-btn" onClick={fetchData}>
            <RefreshCw className="w-5 h-5 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon users">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="admin-stat-number">{stats.users}</div>
          </div>
          <h3 className="admin-stat-label">Usuários</h3>
          <p className="admin-stat-description">Participantes ativos</p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon sessions">
              <Grid3X3 className="w-8 h-8 text-white" />
            </div>
            <div className="admin-stat-number">{stats.sessions}</div>
          </div>
          <h3 className="admin-stat-label">Sessões</h3>
          <p className="admin-stat-description">Total de avaliações</p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon assessments">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div className="admin-stat-number">{stats.assessments}</div>
          </div>
          <h3 className="admin-stat-label">Avaliações</h3>
          <p className="admin-stat-description">Concluídas</p>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <div className="admin-stat-icon reports">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="admin-stat-number">{stats.reports}</div>
          </div>
          <h3 className="admin-stat-label">Relatórios</h3>
          <p className="admin-stat-description">Gerados</p>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="admin-sections">
        {/* System Status */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Server className="admin-section-icon" />
              Status do Sistema
            </h2>
          </div>
          <div className="admin-section-content">
            <div className="admin-system-status">
              <div className="admin-status-item">
                <div className={`admin-status-indicator ${systemStatus.database}`}></div>
                <div className="admin-status-label">Database</div>
                <div className="admin-status-value">{systemStatus.database}</div>
              </div>
              <div className="admin-status-item">
                <div className={`admin-status-indicator ${systemStatus.api}`}></div>
                <div className="admin-status-label">API</div>
                <div className="admin-status-value">{systemStatus.api}</div>
              </div>
              <div className="admin-status-item">
                <div className={`admin-status-indicator ${systemStatus.storage}`}></div>
                <div className="admin-status-label">Storage</div>
                <div className="admin-status-value">{systemStatus.storage}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Clock className="admin-section-icon" />
              Atividade Recente
            </h2>
          </div>
          <div className="admin-section-content">
            <div className="admin-activity-list">
              {tracking?.evaluations.slice(0, 5).map((evaluation, index) => (
                <div key={index} className="admin-activity-item">
                  <div className="admin-activity-icon">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="admin-activity-content">
                    <p className="admin-activity-title">{evaluation.assessor.name}</p>
                    <p className="admin-activity-description">
                      {evaluation.evaluations.filter(e => e.status === 'completed').length} avaliações concluídas
                    </p>
                  </div>
                  <div className="admin-activity-time">
                    {evaluation.evaluations.find(e => e.last_activity)?.last_activity 
                      ? new Date(evaluation.evaluations.find(e => e.last_activity)!.last_activity!).toLocaleDateString()
                      : '-'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Settings className="admin-section-icon" />
              Configurações
            </h2>
          </div>
          <div className="admin-section-content">
            <div className="admin-settings-list">
              <div className="admin-setting-item">
                <div className="admin-setting-info">
                  <p className="admin-setting-label">Notificações por Email</p>
                  <p className="admin-setting-description">Enviar lembretes automáticos</p>
                </div>
                <button 
                  className={`admin-setting-toggle ${settings?.email_notifications ? 'active' : ''}`}
                  onClick={() => handleSettingToggle('email_notifications')}
                ></button>
              </div>
              <div className="admin-setting-item">
                <div className="admin-setting-info">
                  <p className="admin-setting-label">Backup Automático</p>
                  <p className="admin-setting-description">Criar backup diário</p>
                </div>
                <button 
                  className={`admin-setting-toggle ${settings?.auto_backup ? 'active' : ''}`}
                  onClick={() => handleSettingToggle('auto_backup')}
                ></button>
              </div>
              <div className="admin-setting-item">
                <div className="admin-setting-info">
                  <p className="admin-setting-label">Modo Debug</p>
                  <p className="admin-setting-description">Logs detalhados</p>
                </div>
                <button 
                  className={`admin-setting-toggle ${settings?.debug_mode ? 'active' : ''}`}
                  onClick={() => handleSettingToggle('debug_mode')}
                ></button>
              </div>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <Database className="admin-section-icon" />
              Gerenciamento de Dados
            </h2>
          </div>
          <div className="admin-section-content">
            <div className="admin-database-actions">
              <button className="admin-db-btn primary" onClick={handleBackup}>
                <Download className="w-4 h-4 mr-2" />
                Criar Backup
              </button>
              <button className="admin-db-btn danger" onClick={handleClearData}>
                <XCircle className="w-4 h-4 mr-2" />
                Limpar Dados
              </button>
            </div>
            
            <div className="admin-database-info">
              <div className="admin-db-info-grid">
                <div className="admin-db-info-item">
                  <p className="admin-db-info-label">Último Backup</p>
                  <p className="admin-db-info-value">
                    {backups.length > 0 
                      ? new Date(backups[0].created).toLocaleString('pt-BR')
                      : 'Nenhum backup'
                    }
                  </p>
                </div>
                <div className="admin-db-info-item">
                  <p className="admin-db-info-label">Backups Disponíveis</p>
                  <p className="admin-db-info-value">{backups.length}</p>
                </div>
                <div className="admin-db-info-item">
                  <p className="admin-db-info-label">Registros</p>
                  <p className="admin-db-info-value">{stats.users + stats.sessions}</p>
                </div>
                <div className="admin-db-info-item">
                  <p className="admin-db-info-label">Versão</p>
                  <p className="admin-db-info-value">1.0.0</p>
                </div>
              </div>
            </div>

            {backups.length > 0 && (
              <div className="admin-backups-list">
                <h4 className="admin-backups-title">Backups Disponíveis</h4>
                <div className="admin-backups-grid">
                  {backups.slice(0, 5).map((backup, index) => (
                    <div key={index} className="admin-backup-item">
                      <div className="admin-backup-info">
                        <p className="admin-backup-filename">{backup.filename}</p>
                        <p className="admin-backup-details">
                          {new Date(backup.created).toLocaleDateString('pt-BR')} • 
                          {(backup.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button 
                        className="admin-backup-restore-btn"
                        onClick={() => handleRestore(backup.filename)}
                      >
                        <Upload className="w-4 h-4" />
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;