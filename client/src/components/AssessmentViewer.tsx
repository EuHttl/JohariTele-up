import React, { useState, useEffect } from 'react';
import { Eye, X, User, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { assessmentsAPI } from '../services/api';
import '../styles/assessment-viewer.css';

interface AssessmentData {
  id: number;
  name: string;
  selected: boolean;
}

interface AssessmentViewerProps {
  participantCode: string;
  participantName: string;
  isOpen: boolean;
  onClose: () => void;
}

const AssessmentViewer: React.FC<AssessmentViewerProps> = ({
  participantCode,
  participantName,
  isOpen,
  onClose
}) => {
  const [selfAssessment, setSelfAssessment] = useState<AssessmentData[]>([]);
  const [peerAssessments, setPeerAssessments] = useState<AssessmentData[]>([]);
  const [peerAssessors, setPeerAssessors] = useState<any[]>([]);
  const [selectedAssessor, setSelectedAssessor] = useState<any>(null);
  const [assessorEvaluations, setAssessorEvaluations] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && participantCode) {
      fetchAssessments();
    }
  }, [isOpen, participantCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAssessments = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Buscando avaliações para:', participantCode);
      
      // Buscar autoavaliação usando a API configurada
      console.log('📊 Buscando autoavaliação...');
      const selfData = await assessmentsAPI.getSelfAssessment(participantCode);
      console.log('✅ Dados autoavaliação:', selfData);
      
      // Processar dados da autoavaliação
      const processedSelfData = Array.isArray(selfData) ? selfData.map((item: any, index: number) => ({
        id: index + 1,
        name: item.name || 'Característica sem nome',
        selected: item.selected === true || item.selected === 1
      })) : [];
      
      setSelfAssessment(processedSelfData);

      // Buscar avaliações de pares usando a API configurada
      console.log('📊 Buscando avaliações de pares...');
      const peerData = await assessmentsAPI.getPeerCharacteristics(participantCode);
      console.log('✅ Dados avaliações pares:', peerData);
      
      // Processar dados das avaliações de pares
      const processedPeerData = Array.isArray(peerData) ? peerData.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || 'Característica sem nome',
        selected: item.selected === true || item.selected === 1
      })) : [];
      
      console.log('✅ Dados processados dos pares:', processedPeerData);
      setPeerAssessments(processedPeerData);

      // Buscar pares que avaliaram este participante
      console.log('📊 Buscando pares que avaliaram...');
      const assessorsData = await assessmentsAPI.getPeerAssessors(participantCode);
      console.log('✅ Pares que avaliaram:', assessorsData);
      setPeerAssessors(assessorsData);

    } catch (err: any) {
      console.error('❌ Erro ao buscar avaliações:', err);
      setError(`Erro ao carregar avaliações: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessorEvaluations = async (assessor: any) => {
    try {
      console.log('🔍 Buscando avaliações do par:', assessor.name);
      const evaluations = await assessmentsAPI.getPeerAssessment(assessor.code, participantCode);
      console.log('✅ Avaliações do par:', evaluations);
      
      const processedEvaluations = Array.isArray(evaluations) ? evaluations.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name || 'Característica sem nome',
        selected: item.selected === true || item.selected === 1
      })) : [];
      
      setAssessorEvaluations(processedEvaluations);
      setSelectedAssessor(assessor);
    } catch (error: any) {
      console.error('❌ Erro ao carregar avaliações do par:', error);
      setError(`Erro ao carregar avaliações de ${assessor.name}: ${error.message}`);
    }
  };

  const getSelectedCount = (assessments: AssessmentData[]) => {
    return assessments.filter(a => a.selected).length;
  };

  const getSelectedCharacteristics = (assessments: AssessmentData[]) => {
    return assessments.filter(a => a.selected).map(a => a.name);
  };

  const getNotSelectedCharacteristics = (assessments: AssessmentData[]) => {
    return assessments.filter(a => !a.selected).map(a => a.name);
  };

  if (!isOpen) return null;

  return (
    <div className="assessment-viewer-overlay" onClick={onClose}>
      <div className="assessment-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assessment-viewer-header">
          <div className="assessment-viewer-title">
            <Eye className="w-6 h-6 text-purple-400" />
            <h2>Avaliações de {participantName}</h2>
          </div>
          <button onClick={onClose} className="assessment-viewer-close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="assessment-viewer-content">
          {loading ? (
            <div className="assessment-viewer-loading">
              <div className="assessment-viewer-spinner"></div>
              <p>Carregando avaliações...</p>
            </div>
          ) : error ? (
            <div className="assessment-viewer-error">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="assessment-viewer-grid">
              {/* Autoavaliação */}
              <div className="assessment-viewer-section">
                <div className="assessment-viewer-section-header">
                  <User className="w-5 h-5 text-blue-400" />
                  <h3>Autoavaliação</h3>
                  <span className="assessment-viewer-count">
                    {getSelectedCount(selfAssessment)} selecionadas
                  </span>
                </div>
                
                <div className="assessment-viewer-stats">
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Total de características:</span>
                    <span className="assessment-viewer-stat-value">{selfAssessment.length}</span>
                  </div>
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Selecionadas:</span>
                    <span className="assessment-viewer-stat-value selected">
                      {getSelectedCount(selfAssessment)}
                    </span>
                  </div>
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Não selecionadas:</span>
                    <span className="assessment-viewer-stat-value not-selected">
                      {selfAssessment.length - getSelectedCount(selfAssessment)}
                    </span>
                  </div>
                </div>

                <div className="assessment-viewer-characteristics">
                  <div className="assessment-viewer-characteristics-group">
                    <h4 className="assessment-viewer-group-title selected">
                      <CheckCircle className="w-4 h-4" />
                      Características Selecionadas ({getSelectedCount(selfAssessment)})
                    </h4>
                    <div className="assessment-viewer-tags">
                      {getSelectedCharacteristics(selfAssessment).map((char, index) => (
                        <span key={index} className="assessment-viewer-tag selected">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="assessment-viewer-characteristics-group">
                    <h4 className="assessment-viewer-group-title not-selected">
                      <AlertCircle className="w-4 h-4" />
                      Características Não Selecionadas ({selfAssessment.length - getSelectedCount(selfAssessment)})
                    </h4>
                    <div className="assessment-viewer-tags">
                      {getNotSelectedCharacteristics(selfAssessment).map((char, index) => (
                        <span key={index} className="assessment-viewer-tag not-selected">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Avaliações de Pares */}
              <div className="assessment-viewer-section">
                <div className="assessment-viewer-section-header">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3>Avaliações dos Pares</h3>
                  <span className="assessment-viewer-count">
                    {getSelectedCount(peerAssessments)} selecionadas
                  </span>
                </div>
                
                <div className="assessment-viewer-stats">
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Total de características:</span>
                    <span className="assessment-viewer-stat-value">{peerAssessments.length}</span>
                  </div>
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Selecionadas:</span>
                    <span className="assessment-viewer-stat-value selected">
                      {getSelectedCount(peerAssessments)}
                    </span>
                  </div>
                  <div className="assessment-viewer-stat">
                    <span className="assessment-viewer-stat-label">Não selecionadas:</span>
                    <span className="assessment-viewer-stat-value not-selected">
                      {peerAssessments.length - getSelectedCount(peerAssessments)}
                    </span>
                  </div>
                </div>

                <div className="assessment-viewer-characteristics">
                  <div className="assessment-viewer-characteristics-group">
                    <h4 className="assessment-viewer-group-title selected">
                      <CheckCircle className="w-4 h-4" />
                      Características Selecionadas ({getSelectedCount(peerAssessments)})
                    </h4>
                    <div className="assessment-viewer-tags">
                      {getSelectedCharacteristics(peerAssessments).map((char, index) => (
                        <span key={index} className="assessment-viewer-tag selected">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="assessment-viewer-characteristics-group">
                    <h4 className="assessment-viewer-group-title not-selected">
                      <AlertCircle className="w-4 h-4" />
                      Características Não Selecionadas ({peerAssessments.length - getSelectedCount(peerAssessments)})
                    </h4>
                    <div className="assessment-viewer-tags">
                      {getNotSelectedCharacteristics(peerAssessments).map((char, index) => (
                        <span key={index} className="assessment-viewer-tag not-selected">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Avaliações Individuais dos Pares */}
              <div className="assessment-viewer-section">
                <div className="assessment-viewer-section-header">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3>Avaliações Individuais dos Pares</h3>
                  <span className="assessment-viewer-count">
                    {peerAssessors.length} pares avaliaram
                  </span>
                </div>

                {peerAssessors.length > 0 ? (
                  <div className="assessment-viewer-assessors">
                    <div className="assessment-viewer-assessors-list">
                      {peerAssessors.map((assessor, index) => (
                        <button
                          key={index}
                          onClick={() => fetchAssessorEvaluations(assessor)}
                          className={`assessment-viewer-assessor-btn ${
                            selectedAssessor?.id === assessor.id ? 'active' : ''
                          }`}
                        >
                          <div className="assessment-viewer-assessor-info">
                            <span className="assessment-viewer-assessor-name">{assessor.name}</span>
                            <span className="assessment-viewer-assessor-stats">
                              {assessor.characteristics_evaluated} características avaliadas
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedAssessor && (
                      <div className="assessment-viewer-assessor-details">
                        <div className="assessment-viewer-assessor-header">
                          <h4>Avaliação de {selectedAssessor.name}</h4>
                          <span className="assessment-viewer-count">
                            {getSelectedCount(assessorEvaluations)} selecionadas
                          </span>
                        </div>

                        <div className="assessment-viewer-stats">
                          <div className="assessment-viewer-stat">
                            <span className="assessment-viewer-stat-label">Total de características:</span>
                            <span className="assessment-viewer-stat-value">{assessorEvaluations.length}</span>
                          </div>
                          <div className="assessment-viewer-stat">
                            <span className="assessment-viewer-stat-label">Selecionadas:</span>
                            <span className="assessment-viewer-stat-value selected">
                              {getSelectedCount(assessorEvaluations)}
                            </span>
                          </div>
                          <div className="assessment-viewer-stat">
                            <span className="assessment-viewer-stat-label">Não selecionadas:</span>
                            <span className="assessment-viewer-stat-value not-selected">
                              {assessorEvaluations.length - getSelectedCount(assessorEvaluations)}
                            </span>
                          </div>
                        </div>

                        <div className="assessment-viewer-characteristics">
                          <div className="assessment-viewer-characteristics-group">
                            <h4 className="assessment-viewer-group-title selected">
                              <CheckCircle className="w-4 h-4" />
                              Características Selecionadas ({getSelectedCount(assessorEvaluations)})
                            </h4>
                            <div className="assessment-viewer-tags">
                              {getSelectedCharacteristics(assessorEvaluations).map((char, index) => (
                                <span key={index} className="assessment-viewer-tag selected">
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="assessment-viewer-characteristics-group">
                            <h4 className="assessment-viewer-group-title not-selected">
                              <AlertCircle className="w-4 h-4" />
                              Características Não Selecionadas ({assessorEvaluations.length - getSelectedCount(assessorEvaluations)})
                            </h4>
                            <div className="assessment-viewer-tags">
                              {getNotSelectedCharacteristics(assessorEvaluations).map((char, index) => (
                                <span key={index} className="assessment-viewer-tag not-selected">
                                  {char}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="assessment-viewer-empty">
                    <p>Nenhum par avaliou este participante ainda.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="assessment-viewer-footer">
          <button onClick={onClose} className="assessment-viewer-btn">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentViewer;
