import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantsAPI } from '../services/api';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  BarChart3, 
  Plus,
  UserCheck,
  Eye,
  EyeOff,
  Target,
  Award,
  ArrowRight,
  Sparkles,
  Star,
  Heart,
  Brain,
} from 'lucide-react';
import '../styles/dashboard.css';

interface StatsData {
  total_participants: number;
  completed_self: number;
  completed_peer: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, participantsData] = await Promise.all([
          participantsAPI.getStats(),
          participantsAPI.getAll()
        ]);
        
        console.log('Dashboard - Stats recebidos:', statsData);
        console.log('Dashboard - Participants recebidos:', participantsData);
        console.log('Dashboard - Participants é array?', Array.isArray(participantsData));
        
        setStats(statsData);
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCompletionPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getStatusBadge = (participant: any) => {
    if (participant.has_completed_self_assessment && participant.has_completed_peer_assessments) {
      return (
        <span className="dashboard-status-badge complete">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completo
        </span>
      );
    } else if (participant.has_completed_self_assessment) {
      return (
        <span className="dashboard-status-badge in-progress">
          <Clock className="w-3 h-3 mr-1" />
          Em Progresso
        </span>
      );
    } else {
      return (
        <span className="dashboard-status-badge pending">
          <EyeOff className="w-3 h-3 mr-1" />
          Pendente
        </span>
      );
    }
  };

  const participantsArray = Array.isArray(participants) ? participants : [];
  const completedParticipants = participantsArray.filter(p => 
    p.has_completed_self_assessment && p.has_completed_peer_assessments
  ).length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading-content">
          <div className="dashboard-loading-spinner"></div>
          <h2 className="dashboard-loading-title">Carregando Dashboard...</h2>
          <p className="dashboard-loading-subtitle">Preparando seus dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-overlay"></div>
        
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-grid">
            <div className="dashboard-hero-text">
              <div className="dashboard-hero-badge">
                <div className="dashboard-hero-icon">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-purple-200 text-sm font-medium">Sistema de Avaliação</span>
              </div>
              
              <h1 className="dashboard-hero-title">
                Janela de <span className="bg-gradient-to-r from-yellow-300 to-pink-400 bg-clip-text text-transparent">Johari</span>
              </h1>
              
              <p className="dashboard-hero-subtitle">
                Descubra o potencial oculto da sua equipe através da análise comportamental mais completa
              </p>
              
              <div className="dashboard-hero-actions">
                <Link 
                  to="/app/participants" 
                  className="dashboard-hero-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Gerenciar Participantes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                
                <Link 
                  to="/app/reports" 
                  className="dashboard-hero-btn-secondary"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Relatórios
                  <Sparkles className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
            
            <div className="dashboard-hero-visual">
              <div className="relative">
                <div className="dashboard-progress-card">
                  <div className="text-center">
                    <div className="dashboard-progress-icon">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="dashboard-progress-title">Progresso Geral</h3>
                    <div className="dashboard-progress-percentage">
                      {getCompletionPercentage(completedParticipants, stats?.total_participants || 1)}%
                    </div>
                    <p className="dashboard-progress-label">Avaliações Completas</p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        {/* Total Participants */}
        <div className="dashboard-stats-card">
          <div className="dashboard-stats-header">
            <div className="dashboard-stats-icon primary">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="dashboard-stats-numbers">
              <div className="dashboard-stats-number">{stats?.total_participants || 0}</div>
              <div className="dashboard-stats-subtitle">de 12</div>
            </div>
          </div>
          <h3 className="dashboard-stats-title">Participantes</h3>
          <p className="dashboard-stats-description">Total cadastrados</p>
          <div className="dashboard-progress-bar">
            <div 
              className="dashboard-progress-fill primary"
              style={{ width: `${((stats?.total_participants || 0) / 12) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Autoavaliações */}
        <div className="dashboard-stats-card">
          <div className="dashboard-stats-header">
            <div className="dashboard-stats-icon success">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="dashboard-stats-numbers">
              <div className="dashboard-stats-number">{stats?.completed_self || 0}</div>
              <div className="dashboard-stats-subtitle">{getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%</div>
            </div>
          </div>
          <h3 className="dashboard-stats-title">Autoavaliações</h3>
          <p className="dashboard-stats-description">Concluídas</p>
          <div className="dashboard-progress-bar">
            <div 
              className="dashboard-progress-fill success"
              style={{ width: `${getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%` }}
            ></div>
          </div>
        </div>

        {/* Avaliações Entre Pares */}
        <div className="dashboard-stats-card">
          <div className="dashboard-stats-header">
            <div className="dashboard-stats-icon purple">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="dashboard-stats-numbers">
              <div className="dashboard-stats-number">{stats?.completed_peer || 0}</div>
              <div className="dashboard-stats-subtitle">{getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%</div>
            </div>
          </div>
          <h3 className="dashboard-stats-title">Entre Pares</h3>
          <p className="dashboard-stats-description">Avaliações</p>
          <div className="dashboard-progress-bar">
            <div 
              className="dashboard-progress-fill purple"
              style={{ width: `${getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%` }}
            ></div>
          </div>
        </div>

        {/* Completos */}
        <div className="dashboard-stats-card">
          <div className="dashboard-stats-header">
            <div className="dashboard-stats-icon warning">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="dashboard-stats-numbers">
              <div className="dashboard-stats-number">{completedParticipants}</div>
              <div className="dashboard-stats-subtitle">finalizados</div>
            </div>
          </div>
          <h3 className="dashboard-stats-title">Completos</h3>
          <p className="dashboard-stats-description">Prontos para análise</p>
          <div className="dashboard-progress-bar">
            <div 
              className="dashboard-progress-fill warning"
              style={{ width: `${getCompletionPercentage(completedParticipants, stats?.total_participants || 1)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="dashboard-participants-section">
        <div className="dashboard-participants-card">
          <div className="dashboard-participants-header">
            <div className="dashboard-participants-title-section">
              <div className="dashboard-participants-title-group">
                <div className="dashboard-participants-title-icon">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="dashboard-participants-title">Participantes</h3>
                  <p className="dashboard-participants-subtitle">Lista de todos os participantes cadastrados</p>
                </div>
              </div>
              <Link 
                to="/app/participants" 
                className="dashboard-participants-add-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Link>
            </div>
          </div>

          <div className="dashboard-participants-content">
            {participantsArray.length === 0 ? (
              <div className="dashboard-empty-state">
                <div className="dashboard-empty-icon">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="dashboard-empty-title">Nenhum participante cadastrado</h3>
                <p className="dashboard-empty-description">
                  Comece adicionando participantes ao sistema para realizar as avaliações.
                </p>
                <Link 
                  to="/app/participants" 
                  className="dashboard-empty-btn"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Adicionar Primeiro Participante
                </Link>
              </div>
            ) : (
              <div className="dashboard-table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Código</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsArray.map((participant) => (
                      <tr key={participant.id}>
                        <td>
                          <div className="dashboard-participant-info">
                            <div className="dashboard-participant-avatar">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="dashboard-participant-details">
                              <p className="dashboard-participant-name">{participant.name}</p>
                              <p className="dashboard-participant-email">{participant.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="dashboard-participant-email">{participant.email}</td>
                        <td>
                          <span className="dashboard-participant-code">{participant.code}</span>
                        </td>
                        <td>{getStatusBadge(participant)}</td>
                        <td>
                          <div className="dashboard-actions">
                            <Link
                              to={`/assessment/${participant.code}`}
                              className="dashboard-action-btn view"
                              title="Visualizar Avaliação"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {participant.has_completed_self_assessment && participant.has_completed_peer_assessments ? (
                              <Link
                                to={`/report/${participant.code}`}
                                className="dashboard-action-btn report"
                                title="Ver Relatório"
                              >
                                <FileText className="w-4 h-4" />
                              </Link>
                            ) : (
                              <span 
                                className="dashboard-action-btn disabled"
                                title="Relatório indisponível - avaliação incompleta"
                              >
                                <FileText className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;