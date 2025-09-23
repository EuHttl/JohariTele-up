import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { ComparativeReport, CharacteristicAnalysis } from '../types';
import { 
  TrendingUp, 
  Users, 
  Eye,
  Download,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  FileText,
  Share,
  Filter,
  Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/reports.css';

const Reports: React.FC = () => {
  const [comparativeReport, setComparativeReport] = useState<ComparativeReport | null>(null);
  const [characteristicAnalysis, setCharacteristicAnalysis] = useState<CharacteristicAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [comparative, characteristics] = await Promise.all([
        reportsAPI.getComparativeReport(),
        reportsAPI.getCharacteristicAnalysis()
      ]);
      
      setComparativeReport(comparative);
      setCharacteristicAnalysis(characteristics);
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      setError(error.response?.data?.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <span className="report-score-badge excellent">Excelente</span>;
    } else if (score >= 60) {
      return <span className="report-score-badge good">Bom</span>;
    } else if (score >= 40) {
      return <span className="report-score-badge average">Regular</span>;
    } else {
      return <span className="report-score-badge poor">Baixo</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="reports-loading-content">
          <div className="reports-loading-spinner"></div>
          <p className="reports-loading-text">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const participants = comparativeReport?.participants || [];
  const participantsLength = participants.length || 1;
  
  const stats = {
    total: participants.length,
    completed: comparativeReport?.summary?.completed_assessments || 0,
    avgScore: participants.reduce((acc: any, p: any) => acc + (p.self_awareness_score || 0), 0) / participantsLength,
    insights: characteristicAnalysis?.most_selected?.length || 0
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-title-section">
          <div className="reports-title-icon">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="reports-title">Relatórios</h1>
            <p className="reports-subtitle">Análise completa dos resultados da avaliação</p>
          </div>
        </div>
        <div className="reports-actions">
          <button className="reports-filter-btn">
            <Filter className="w-5 h-5 mr-2" />
            Filtrar
          </button>
          <button className="reports-export-btn">
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="reports-stats">
        <div className="reports-stat-card">
          <div className="reports-stat-header">
            <div className="reports-stat-icon total">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div className="reports-stat-number">{stats.total}</div>
          </div>
          <h3 className="reports-stat-label">Total</h3>
          <p className="reports-stat-description">Participantes avaliados</p>
        </div>

        <div className="reports-stat-card">
          <div className="reports-stat-header">
            <div className="reports-stat-icon completed">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="reports-stat-number">{stats.completed}</div>
          </div>
          <h3 className="reports-stat-label">Completos</h3>
          <p className="reports-stat-description">Avaliações finalizadas</p>
        </div>

        <div className="reports-stat-card">
          <div className="reports-stat-header">
            <div className="reports-stat-icon avg-score">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="reports-stat-number">{Math.round(stats.avgScore)}</div>
          </div>
          <h3 className="reports-stat-label">Pontuação Média</h3>
          <p className="reports-stat-description">Score geral da equipe</p>
        </div>

        <div className="reports-stat-card">
          <div className="reports-stat-header">
            <div className="reports-stat-icon insights">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div className="reports-stat-number">{stats.insights}</div>
          </div>
          <h3 className="reports-stat-label">Insights</h3>
          <p className="reports-stat-description">Análises geradas</p>
        </div>
      </div>

      {/* Charts */}
      <div className="reports-chart-container">
        <div className="reports-chart-header">
          <h2 className="reports-chart-title">Distribuição de Pontuações</h2>
          <div className="reports-chart-actions">
            <button className="reports-chart-btn active">Barras</button>
            <button className="reports-chart-btn">Pizza</button>
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="reports-chart-legend">
          <div className="reports-legend-item">
            <div className="reports-legend-color" style={{backgroundColor: '#8b5cf6'}}></div>
            <span className="reports-legend-text">Pontuação Combinada (Self + Peer)</span>
          </div>
          <div className="reports-legend-info">
            <span className="text-sm text-gray-600">Eixo Y: 0-100 pontos | Eixo X: Participantes</span>
          </div>
        </div>
        <div className="reports-chart-content">
          {comparativeReport?.participants && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparativeReport.participants.map((p: any) => ({
                name: p.name.split(' ')[0],
                fullName: p.name,
                code: p.code,
                score: Math.round((p.self_awareness_score + p.peer_perception_score) / 2),
                selfScore: Math.round(p.self_awareness_score),
                peerScore: Math.round(p.peer_perception_score)
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ value: 'Pontuação (0-100)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    <div key="tooltip">
                      <p><strong>Participante:</strong> {props.payload.fullName}</p>
                      <p><strong>Código:</strong> {props.payload.code}</p>
                      <p><strong>Pontuação Combinada:</strong> {value}%</p>
                      <p><strong>Self-Awareness:</strong> {props.payload.selfScore}%</p>
                      <p><strong>Peer Perception:</strong> {props.payload.peerScore}%</p>
                    </div>
                  ]}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Bar dataKey="score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Characteristics Analysis */}
      {characteristicAnalysis && (
        <div className="reports-characteristics">
          <div className="reports-characteristic-card">
            <div className="reports-characteristic-header">
              <div className="reports-characteristic-icon">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="reports-characteristic-title">Análise de Características</h3>
            </div>
            <div className="reports-characteristic-content">
              <p className="mb-2">Total de características mais selecionadas: {characteristicAnalysis.most_selected?.length || 0}</p>
              <p className="mb-2">Total de características menos selecionadas: {characteristicAnalysis.least_selected?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Score Legend */}
      <div className="reports-score-legend">
        <h3 className="reports-legend-title">Legenda de Pontuações</h3>
        <div className="reports-legend-grid">
          <div className="reports-legend-badge">
            <span className="report-score-badge excellent">Excelente</span>
            <span className="reports-legend-range">80-100%</span>
          </div>
          <div className="reports-legend-badge">
            <span className="report-score-badge good">Bom</span>
            <span className="reports-legend-range">60-79%</span>
          </div>
          <div className="reports-legend-badge">
            <span className="report-score-badge average">Regular</span>
            <span className="reports-legend-range">40-59%</span>
          </div>
          <div className="reports-legend-badge">
            <span className="report-score-badge poor">Baixo</span>
            <span className="reports-legend-range">0-39%</span>
          </div>
        </div>
        <p className="reports-legend-description">
          Pontuação baseada na Área Aberta da Janela de Johari: consenso entre autopercepção e percepção dos pares
        </p>
      </div>

      {/* Reports List */}
      <div className="reports-list-card">
        <div className="reports-list-header">
          <h2 className="reports-list-title">Relatórios Individuais</h2>
          <div className="reports-list-info">
            <span className="text-sm text-gray-600">
              Clique em "Visualizar" para ver o relatório completo ou "Baixar" para exportar
            </span>
          </div>
        </div>
        
        <div className="reports-list-content">
          {!comparativeReport?.participants || comparativeReport.participants.length === 0 ? (
            <div className="reports-empty-state">
              <div className="reports-empty-icon">
                <FileText className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="reports-empty-title">Nenhum relatório disponível</h3>
              <p className="reports-empty-description">
                Os relatórios serão gerados automaticamente quando as avaliações forem concluídas.
              </p>
            </div>
          ) : (
            <div className="reports-table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Email</th>
                    <th>Pontuação</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativeReport.participants.map((participant: any) => (
                    <tr key={participant.id}>
                      <td>
                        <div className="report-info">
                          <div className="report-avatar">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="report-details">
                            <p className="report-name">{participant.name}</p>
                            <p className="report-code">{participant.code}</p>
                          </div>
                        </div>
                      </td>
                      <td>{participant.code}</td>
                      <td>
                        <div className="report-score">
                          <span className="report-score-value">{Math.round((participant.self_awareness_score + participant.peer_perception_score) / 2)}</span>
                          {getScoreBadge((participant.self_awareness_score + participant.peer_perception_score) / 2)}
                        </div>
                      </td>
                      <td className="report-date">
                        -
                      </td>
                      <td>
                        <div className="reports-actions-cell">
                          <Link
                            to={`/assessment/${participant.code}`}
                            className="reports-action-btn view"
                            title="Visualizar avaliação"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/report/${participant.code}`}
                            className="reports-action-btn download"
                            title="Baixar relatório"
                          >
                            <Download className="w-4 h-4" />
                          </Link>
                          <button
                            className="reports-action-btn share"
                            title="Compartilhar relatório"
                          >
                            <Share className="w-4 h-4" />
                          </button>
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
  );
};

export default Reports;