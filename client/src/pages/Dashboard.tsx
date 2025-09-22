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
        setParticipants([]); // Garantir que sempre seja array
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
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
          color: '#166534',
          border: '1px solid #bbf7d0'
        }}>
          <CheckCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
          Completo
        </span>
      );
    } else if (participant.has_completed_self_assessment) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          color: '#92400e',
          border: '1px solid #fcd34d'
        }}>
          <Clock style={{ width: '12px', height: '12px', marginRight: '4px' }} />
          Em Progresso
        </span>
      );
    } else {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.625rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
          color: '#991b1b',
          border: '1px solid #f87171'
        }}>
          <EyeOff style={{ width: '12px', height: '12px', marginRight: '4px' }} />
          Pendente
        </span>
      );
    }
  };

  // Debug mais detalhado
  console.log('Dashboard - Estado atual:', {
    participants,
    participantsType: typeof participants,
    isArray: Array.isArray(participants),
    length: participants?.length,
    firstItem: participants?.[0]
  });

  const completedParticipants = Array.isArray(participants) 
    ? participants.filter(p => p.has_completed_self_assessment && p.has_completed_peer_assessments).length 
    : 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 50%, #eff6ff 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <p style={{ 
            marginTop: '1rem', 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: '#374151' 
          }}>Carregando Dashboard...</p>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280' 
          }}>Preparando seus dados</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-overlay"></div>
        
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-grid">
            <div className="dashboard-hero-text">
              <div className="dashboard-hero-badge">
                <div className="dashboard-hero-icon">
                  <Brain style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <span style={{
                  color: '#c084fc',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>Sistema de Avaliação</span>
              </div>
              
              <h1 className="dashboard-hero-title">
                Janela de <span style={{
                  background: 'linear-gradient(135deg, #fde047 0%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Johari</span>
              </h1>
              
              <p className="dashboard-hero-subtitle">
                Descubra o potencial oculto da sua equipe através da análise comportamental mais completa
              </p>
              
              <div className="dashboard-hero-actions">
                <Link 
                  to="/app/participants" 
                  className="dashboard-hero-btn"
                >
                  <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                  Gerenciar Participantes
                  <ArrowRight style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                </Link>
                
                <Link 
                  to="/app/reports" 
                  className="dashboard-hero-btn-secondary"
                >
                  <BarChart3 style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                  Ver Relatórios
                  <Sparkles style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                </Link>
              </div>
            </div>
            
            <div className="dashboard-hero-visual">
              <div style={{ position: 'relative' }}>
                <div className="dashboard-progress-card">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem'
                    }}>
                      <Target style={{ width: '32px', height: '32px', color: 'white' }} />
                    </div>
                    <h3 style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem'
                    }}>Progresso Geral</h3>
                    <div style={{
                      fontSize: '3rem',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>
                      {getCompletionPercentage(completedParticipants, stats?.total_participants || 1)}%
                    </div>
                    <p style={{
                      color: '#c084fc',
                      fontSize: '0.875rem'
                    }}>Avaliações Completas</p>
          </div>
        </div>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star style={{ width: '16px', height: '16px', color: 'white' }} />
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
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
              }}>
                <Users style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>{stats?.total_participants || 0}</div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>de 12</div>
              </div>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>Participantes</h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>Total cadastrados</p>
            <div style={{
              marginTop: '1rem',
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                height: '8px',
                borderRadius: '9999px',
                transition: 'all 0.5s ease',
                width: `${((stats?.total_participants || 0) / 12) * 100}%`
              }}></div>
          </div>
        </div>

          {/* Autoavaliações */}
          <div className="dashboard-stats-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
              }}>
                <UserCheck style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>{stats?.completed_self || 0}</div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>{getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%</div>
              </div>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>Autoavaliações</h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>Concluídas</p>
            <div style={{
              marginTop: '1rem',
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                height: '8px',
                borderRadius: '9999px',
                transition: 'all 0.5s ease',
                width: `${getCompletionPercentage(stats?.completed_self || 0, stats?.total_participants || 1)}%`
              }}></div>
            </div>
          </div>

          {/* Avaliações Entre Pares */}
          <div className="dashboard-stats-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4)'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>{stats?.completed_peer || 0}</div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>{getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%</div>
        </div>
      </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>Entre Pares</h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>Avaliações</p>
            <div style={{
              marginTop: '1rem',
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                height: '8px',
                borderRadius: '9999px',
                transition: 'all 0.5s ease',
                width: `${getCompletionPercentage(stats?.completed_peer || 0, stats?.total_participants || 1)}%`
              }}></div>
            </div>
              
          {/* Completos */}
          <div className="dashboard-stats-card">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <div style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.4)'
              }}>
                <Award style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#111827'
                }}>{completedParticipants}</div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>finalizados</div>
              </div>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.25rem'
            }}>Completos</h3>
            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>Prontos para análise</p>
            <div style={{
              marginTop: '1rem',
              width: '100%',
              backgroundColor: '#e5e7eb',
              borderRadius: '9999px',
              height: '8px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
                height: '8px',
                borderRadius: '9999px',
                transition: 'all 0.5s ease',
                width: `${getCompletionPercentage(completedParticipants, stats?.total_participants || 1)}%`
              }}></div>
              </div>
            </div>
          </div>
        </div>

      {/* Participants Table */}
      <div className="dashboard-participants-section">
        <div className="dashboard-participants-card">
          <div className="dashboard-participants-header">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  borderRadius: '8px'
                }}>
                  <Users style={{ width: '20px', height: '20px', color: 'white' }} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>Participantes</h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>Lista de todos os participantes cadastrados</p>
                </div>
              </div>
              <Link 
                to="/app/participants" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(139, 92, 246, 0.4)';
                }}
              >
                <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                Adicionar
              </Link>
        </div>
      </div>

          <div className="dashboard-participants-content">
            {!participants || participants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Users style={{ width: '32px', height: '32px', color: '#9ca3af' }} />
        </div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>Nenhum participante cadastrado</h3>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '1.5rem'
                }}>Comece adicionando participantes ao sistema para realizar as avaliações.</p>
                <Link 
                  to="/app/participants" 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.4)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(139, 92, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(139, 92, 246, 0.4)';
                  }}
                >
                  <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                  Adicionar Primeiro Participante
              </Link>
            </div>
            ) : (
              <div className="dashboard-table-responsive">
                <table className="dashboard-table">
                <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Nome</th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Email</th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Código</th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Status</th>
                      <th style={{
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        fontWeight: '600',
                        color: '#111827'
                      }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                    {participants?.map((participant, index) => (
                      <tr key={participant.id} style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}>
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{
                              fontWeight: '500',
                              color: '#111827'
                            }}>{participant.name}</span>
                          </div>
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#6b7280'
                        }}>{participant.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px'
                          }}>
                            {participant.code}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{getStatusBadge(participant)}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/assessment/${participant.code}`}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#dbeafe',
                                color: '#2563eb',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                transition: 'background-color 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#bfdbfe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#dbeafe';
                              }}
                              title="Visualizar Avaliação"
                            >
                              <Eye style={{ width: '16px', height: '16px' }} />
                          </Link>
                          {participant.has_completed_self_assessment && participant.has_completed_peer_assessments ? (
                            <Link
                              to={`/report/${participant.code}`}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#dcfce7',
                                  color: '#16a34a',
                                  borderRadius: '8px',
                                  textDecoration: 'none',
                                  transition: 'background-color 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#bbf7d0';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dcfce7';
                                }}
                                title="Ver Relatório"
                              >
                                <FileText style={{ width: '16px', height: '16px' }} />
                            </Link>
                          ) : (
                              <span 
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#f3f4f6',
                                  color: '#9ca3af',
                                  borderRadius: '8px',
                                  cursor: 'not-allowed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Relatório indisponível - avaliação incompleta"
                              >
                                <FileText style={{ width: '16px', height: '16px' }} />
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