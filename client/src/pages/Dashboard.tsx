import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantsAPI } from '../services/api';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Plus,
  UserCheck,
  Eye,
  EyeOff,
  Target,
  Award,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import '../styles/design-system.css';

interface StatsData {
  total_participants: number;
  completed_self: number;
  completed_peer: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        const [statsData, participantsData] = await Promise.all([
          participantsAPI.getStats(),
          participantsAPI.getAll()
        ]);
        
        setStats(statsData || { total_participants: 0, completed_self: 0, completed_peer: 0 });
        setParticipants(Array.isArray(participantsData) ? participantsData : []);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        // Não é erro se não houver dados, apenas se houver falha na requisição
        if (error.response?.status >= 500 || error.code === 'NETWORK_ERROR') {
          setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        } else {
          // Se for erro 404 ou similar, pode ser que simplesmente não há dados ainda
          setStats({ total_participants: 0, completed_self: 0, completed_peer: 0 });
          setParticipants([]);
        }
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
      return <span className="badge badge-success">Completo</span>;
    } else if (participant.has_completed_self_assessment) {
      return <span className="badge badge-warning">Em Progresso</span>;
    } else {
      return <span className="badge badge-error">Pendente</span>;
    }
  };

  const participantsArray = Array.isArray(participants) ? participants : [];
  const completedParticipants = participantsArray.filter(p => 
    p.has_completed_self_assessment && p.has_completed_peer_assessments
  ).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando dashboard...</p>
      </div>
    );
  }

  // Se houver erro de conexão, mostrar erro
  if (error) {
    return (
      <div className="page-container">
        <ErrorState
          title="Erro ao carregar dados"
          message={error}
          onRetry={() => window.location.reload()}
          showHomeButton={true}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Visão geral do sistema de avaliação comportamental</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats?.total_participants || 0}</p>
              <p className="stat-label">Participantes</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats?.completed_self || 0}</p>
              <p className="stat-label">Autoavaliações</p>
              <div className="stat-change positive">
                <TrendingUp className="w-4 h-4" />
                {getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <Activity className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats?.completed_peer || 0}</p>
              <p className="stat-label">Avaliações entre Pares</p>
              <div className="stat-change positive">
                <TrendingUp className="w-4 h-4" />
                {getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Award className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{completedParticipants}</p>
              <p className="stat-label">Completos</p>
              <div className="stat-change positive">
                <CheckCircle className="w-4 h-4" />
                {getCompletionPercentage(completedParticipants, stats?.total_participants || 1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Progress Overview Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px' }}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title">Progresso Geral</h3>
                <p className="card-subtitle">Visão geral das avaliações</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Autoavaliações</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {stats?.completed_self || 0} / {stats?.total_participants || 0}
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'var(--bg-gray-200)', 
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Avaliações entre Pares</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {stats?.completed_peer || 0} / {stats?.total_participants || 0}
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'var(--bg-gray-200)', 
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title">Distribuição de Status</h3>
                <p className="card-subtitle">Status dos participantes</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Completos</span>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {participantsArray.filter(p => p.has_completed_self_assessment && p.has_completed_peer_assessments).length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Em Progresso</span>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {participantsArray.filter(p => p.has_completed_self_assessment && !p.has_completed_peer_assessments).length}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Pendentes</span>
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {participantsArray.filter(p => !p.has_completed_self_assessment).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Participants List Card */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="stat-icon" style={{ width: '36px', height: '36px' }}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="card-title">Participantes</h3>
                <p className="card-subtitle">Lista de participantes cadastrados</p>
              </div>
            </div>
            <Link to="/app/participants" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Adicionar Participante
            </Link>
          </div>
        </div>
        <div className="card-body">
          {participantsArray.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum participante cadastrado"
              description="Comece adicionando participantes ao sistema para realizar avaliações comportamentais."
              action={{
                label: 'Adicionar Primeiro Participante',
                onClick: () => window.location.href = '/app/participants',
                icon: Plus
              }}
            />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {participantsArray.slice(0, 5).map((participant) => (
                    <tr key={participant.id}>
                      <td style={{ fontWeight: 500 }}>{participant.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{participant.email}</td>
                      <td>{getStatusBadge(participant)}</td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/assessment/${participant.code}`}
                            className="action-btn"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {participantsArray.length > 5 && (
                <div style={{ padding: 'var(--space-4)', textAlign: 'center', borderTop: '1px solid var(--bg-gray-200)' }}>
                  <Link to="/app/participants" className="btn btn-secondary">
                    Ver Todos ({participantsArray.length})
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
        <Link to="/app/participants" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="stat-icon" style={{ margin: '0 auto var(--space-4)' }}>
              <Users className="w-6 h-6" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-2) 0' }}>Gerenciar Participantes</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Adicionar e editar participantes</p>
          </div>
        </Link>

        <Link to="/app/reports" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="stat-icon" style={{ margin: '0 auto var(--space-4)', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-2) 0' }}>Ver Relatórios</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Visualizar análises e insights</p>
          </div>
        </Link>

        <Link to="/app/usage" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div className="stat-icon" style={{ margin: '0 auto var(--space-4)', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Zap className="w-6 h-6" />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 var(--space-2) 0' }}>Uso e Limites</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Monitorar uso do sistema</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
