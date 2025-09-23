import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assessmentsAPI, participantsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Participant, Characteristic, Assessment } from '../types';
import { 
  User, 
  CheckCircle, 
  ArrowLeft, 
  Save,
  AlertCircle,
  Eye,
  Users
} from 'lucide-react';

const AssessmentPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [peers, setPeers] = useState<Participant[]>([]);
  const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<'self' | 'peer'>('self');
  const [selectedPeer, setSelectedPeer] = useState<Participant | null>(null);
  const [assessments, setAssessments] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      // Se o usuário é um participante logado, usar seu código, senão usar o código da URL
      const participantCode = user?.role === 'participant' ? user.code : code;
      
      console.log('📋 Assessment: fetchData iniciado');
      console.log('📋 Assessment: user:', user);
      console.log('📋 Assessment: code (da URL):', code);
      console.log('📋 Assessment: participantCode (final):', participantCode);
      
      const [participantData, characteristicsData, peersData] = await Promise.all([
        participantsAPI.getByCode(participantCode!),
        assessmentsAPI.getCharacteristics(),
        assessmentsAPI.getPeers(participantCode!)
      ]);

      setParticipant(participantData);
      setCharacteristics(characteristicsData);
      setPeers(peersData);

      // Carregar autoavaliação se já existir
      if (participantData.has_completed_self_assessment) {
        const selfAssessments = await assessmentsAPI.getSelfAssessment(participantCode!);
        const assessmentMap: Record<number, boolean> = {};
        selfAssessments.forEach(assessment => {
          if (assessment.selected !== null) {
            assessmentMap[assessment.id] = assessment.selected;
          }
        });
        setAssessments(assessmentMap);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Assessment: Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do participante');
      setLoading(false);
    }
  }, [code, user?.code, user?.role]);

  useEffect(() => {
    if (code || user?.role === 'participant') {
      fetchData();
    }
  }, [code, user, fetchData]);

  const handleCharacteristicChange = (characteristicId: number, selected: boolean) => {
    setAssessments(prev => ({
      ...prev,
      [characteristicId]: selected
    }));
  };

  const handleSaveAssessment = async () => {
    const participantCode = user?.role === 'participant' ? user.code : code;
    if (!participantCode) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const assessmentArray: Assessment[] = characteristics.map(char => ({
        characteristic_id: char.id,
        selected: assessments[char.id] || false
      }));

      if (currentAssessment === 'self') {
        await assessmentsAPI.saveSelfAssessment(participantCode, assessmentArray);
        setSuccess('Autoavaliação salva com sucesso!');
        
        // Atualizar dados do participante
        const updatedParticipant = await participantsAPI.getByCode(participantCode);
        setParticipant(updatedParticipant);
      } else if (selectedPeer) {
        await assessmentsAPI.savePeerAssessment(participantCode, selectedPeer.code, assessmentArray);
        setSuccess(`Avaliação de ${selectedPeer.name} salva com sucesso!`);
      }

      // Limpar seleções para próxima avaliação
      setAssessments({});
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar avaliação');
    } finally {
      setSaving(false);
    }
  };

  const loadPeerAssessment = async (peer: Participant) => {
    const participantCode = user?.role === 'participant' ? user.code : code;
    if (!participantCode) return;

    try {
      const peerAssessments = await assessmentsAPI.getPeerAssessment(participantCode, peer.code);
      const assessmentMap: Record<number, boolean> = {};
      
      peerAssessments.forEach(assessment => {
        if (assessment.selected !== null) {
          assessmentMap[assessment.id] = assessment.selected;
        }
      });
      
      setAssessments(assessmentMap);
      setSelectedPeer(peer);
      setCurrentAssessment('peer');
    } catch (error) {
      console.error('Erro ao carregar avaliação entre pares:', error);
      setError('Erro ao carregar avaliação entre pares');
    }
  };

  const getProgressPercentage = () => {
    const total = characteristics.length;
    const completed = Object.keys(assessments).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getSelectedCount = () => {
    return Object.values(assessments).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Carregando avaliação...</span>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Participante não encontrado</h3>
        <p className="text-gray-600 mb-4">O código fornecido não corresponde a nenhum participante.</p>
        {user?.role === 'admin' ? (
          <Link to="/app/participants" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Participantes
          </Link>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Complete sua avaliação para ver os resultados
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background com efeitos */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }}></div>

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user?.role === 'admin' ? (
              <Link 
                to="/app/participants" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  color: '#c084fc',
                  textDecoration: 'none',
                  borderRadius: '10px',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ArrowLeft style={{ height: '16px', width: '16px' }} />
                Voltar
              </Link>
            ) : null}
            <div>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.25rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {currentAssessment === 'self' ? 'Autoavaliação' : `Avaliação: ${selectedPeer?.name}`}
              </h1>
              <p style={{
                color: '#c084fc',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {participant.name} ({participant.code})
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {getSelectedCount()} de {characteristics.length} selecionadas
            </span>
            <div style={{
              width: '200px',
              height: '8px',
              backgroundColor: 'rgba(55, 65, 81, 0.5)',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)',
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  width: `${getProgressPercentage()}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5'
          }}>
            <AlertCircle style={{ height: '20px', width: '20px', marginRight: '0.75rem' }} />
            {error}
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            color: '#86efac'
          }}>
            <CheckCircle style={{ height: '20px', width: '20px', marginRight: '0.75rem' }} />
            {success}
          </div>
        )}

        {/* Assessment Type Selector */}
        <div style={{
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Tipo de Avaliação
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}>
              Escolha o tipo de avaliação a ser realizada
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            <button
              onClick={() => {
                setCurrentAssessment('self');
                setSelectedPeer(null);
                setAssessments({});
                // Carregar autoavaliação existente
                if (participant.has_completed_self_assessment) {
                  const participantCode = user?.role === 'participant' ? user.code : code;
                  assessmentsAPI.getSelfAssessment(participantCode!).then(selfAssessments => {
                    const assessmentMap: Record<number, boolean> = {};
                    selfAssessments.forEach(assessment => {
                      if (assessment.selected !== null) {
                        assessmentMap[assessment.id] = assessment.selected;
                      }
                    });
                    setAssessments(assessmentMap);
                  });
                }
              }}
              style={{
                padding: '1.5rem',
                borderRadius: '15px',
                border: `2px solid ${currentAssessment === 'self' ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)'}`,
                backgroundColor: currentAssessment === 'self' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                color: 'white',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (currentAssessment !== 'self') {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentAssessment !== 'self') {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <User style={{
                  height: '24px',
                  width: '24px',
                  color: currentAssessment === 'self' ? '#c084fc' : '#6b7280'
                }} />
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    Autoavaliação
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: participant.has_completed_self_assessment ? '#86efac' : '#fbbf24'
                  }}>
                    {participant.has_completed_self_assessment ? '✅ Completa' : '⏳ Pendente'}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setCurrentAssessment('peer')}
              style={{
                padding: '1.5rem',
                borderRadius: '15px',
                border: `2px solid ${currentAssessment === 'peer' ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)'}`,
                backgroundColor: currentAssessment === 'peer' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                color: 'white',
                textAlign: 'left',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (currentAssessment !== 'peer') {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentAssessment !== 'peer') {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                  e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Users style={{
                  height: '24px',
                  width: '24px',
                  color: currentAssessment === 'peer' ? '#c084fc' : '#6b7280'
                }} />
                <div>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '0.25rem'
                  }}>
                    Avaliação Entre Pares
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: participant.has_completed_peer_assessments ? '#86efac' : '#fbbf24'
                  }}>
                    {participant.has_completed_peer_assessments ? '✅ Completa' : '⏳ Pendente'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Peer Selection */}
        {currentAssessment === 'peer' && (
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                Selecionar Participante
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                Escolha qual participante você deseja avaliar
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {peers.map((peer) => (
                <button
                  key={peer.id}
                  onClick={() => loadPeerAssessment(peer)}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `2px solid ${selectedPeer?.id === peer.id ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)'}`,
                    backgroundColor: selectedPeer?.id === peer.id ? 'rgba(124, 58, 237, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                    color: 'white',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPeer?.id !== peer.id) {
                      e.currentTarget.style.borderColor = '#7c3aed';
                      e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPeer?.id !== peer.id) {
                      e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                      e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Eye style={{
                      height: '16px',
                      width: '16px',
                      color: '#9ca3af'
                    }} />
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'white',
                        marginBottom: '0.25rem'
                      }}>
                        {peer.name}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                      }}>
                        {peer.code}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Form */}
        {(currentAssessment === 'self' || (currentAssessment === 'peer' && selectedPeer)) && (
          <div style={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.5rem'
              }}>
                {currentAssessment === 'self' 
                  ? 'Selecione as características que melhor descrevem você'
                  : `Selecione as características que melhor descrevem ${selectedPeer?.name}`
                }
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                Marque as características que você considera verdadeiras. 
                Não há limite de seleções.
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {characteristics.map((characteristic) => (
                <label
                  key={characteristic.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(17, 24, 39, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                    e.currentTarget.style.backgroundColor = 'rgba(17, 24, 39, 0.5)';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assessments[characteristic.id] || false}
                    onChange={(e) => handleCharacteristicChange(characteristic.id, e.target.checked)}
                    style={{
                      marginTop: '2px',
                      height: '16px',
                      width: '16px',
                      accentColor: '#7c3aed'
                    }}
                  />
                  <span style={{
                    fontSize: '0.875rem',
                    color: 'white',
                    lineHeight: '1.4'
                  }}>
                    {characteristic.name}
                  </span>
                </label>
              ))}
            </div>

            {/* Save Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              {user?.role === 'admin' && (
                <Link 
                  to="/app/participants"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'rgba(55, 65, 81, 0.5)',
                    color: '#9ca3af',
                    textDecoration: 'none',
                    borderRadius: '10px',
                    border: '1px solid rgba(55, 65, 81, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.7)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  Cancelar
                </Link>
              )}
              <button
                onClick={handleSaveAssessment}
                disabled={saving || getSelectedCount() === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: saving || getSelectedCount() === 0 ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: saving || getSelectedCount() === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  if (!saving && getSelectedCount() > 0) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(124, 58, 237, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving && getSelectedCount() > 0) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save style={{ height: '16px', width: '16px' }} />
                    Salvar Avaliação
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
