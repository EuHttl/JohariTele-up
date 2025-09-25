import React, { useState, useEffect } from 'react';
import { Eye, X, User, Users, CheckCircle, AlertCircle } from 'lucide-react';
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
      // Buscar autoavaliação
      const selfResponse = await fetch(`/api/assessments/self/${participantCode}`);
      if (!selfResponse.ok) {
        throw new Error('Erro ao buscar autoavaliação');
      }
      const selfData = await selfResponse.json();
      setSelfAssessment(selfData);

      // Buscar avaliações de pares (agregadas)
      const peerResponse = await fetch(`/api/reports/johari/${participantCode}`);
      if (!peerResponse.ok) {
        throw new Error('Erro ao buscar avaliações de pares');
      }
      const reportData = await peerResponse.json();
      
      // Extrair características selecionadas pelos pares
      if (reportData.quadrants && reportData.quadrants.open) {
        const peerSelected = reportData.quadrants.open.characteristics || [];
        const peerNotSelected = reportData.quadrants.blind?.characteristics || [];
        
        // Combinar todas as características avaliadas pelos pares
        const allPeerCharacteristics = Array.from(new Set([...peerSelected, ...peerNotSelected]));
        
        // Criar dados estruturados para exibição
        const peerData = allPeerCharacteristics.map((char, index) => ({
          id: index + 1,
          name: char,
          selected: peerSelected.includes(char)
        }));
        
        setPeerAssessments(peerData);
      }

    } catch (err: any) {
      console.error('Erro ao buscar avaliações:', err);
      setError(err.message || 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
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
