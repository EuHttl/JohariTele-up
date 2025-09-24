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
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    scoreRange: { min: 0, max: 100 },
    name: '',
    status: 'all' // all, completed, incomplete
  });

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

  const getFilteredParticipants = () => {
    if (!comparativeReport?.participants) return [];
    
    return comparativeReport.participants.filter((participant: any) => {
      const score = Math.round((participant.self_awareness_score + participant.peer_perception_score) / 2);
      const nameMatch = participant.name.toLowerCase().includes(filters.name.toLowerCase());
      const scoreMatch = score >= filters.scoreRange.min && score <= filters.scoreRange.max;
      
      // Verificar se o participante completou as avaliações baseado nos scores
      const hasCompletedAssessments = participant.self_awareness_score > 0 && participant.peer_perception_score > 0;
      const statusMatch = filters.status === 'all' || 
        (filters.status === 'completed' && hasCompletedAssessments) ||
        (filters.status === 'incomplete' && !hasCompletedAssessments);
      
      return nameMatch && scoreMatch && statusMatch;
    });
  };

  const clearFilters = () => {
    setFilters({
      scoreRange: { min: 0, max: 100 },
      name: '',
      status: 'all'
    });
  };

  const handleExportAllReports = () => {
    if (!comparativeReport) return;
    
    const filteredParticipants = getFilteredParticipants();
    
    // Criar conteúdo HTML para o relatório geral
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório Comparativo - Janela de Johari</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .participant { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .quadrant-stats { display: flex; justify-content: space-between; margin: 10px 0; }
          .quadrant-stat { text-align: center; padding: 10px; border: 1px solid #eee; }
          .open { background-color: #f0f9ff; }
          .blind { background-color: #fefce8; }
          .hidden { background-color: #eff6ff; }
          .unknown { background-color: #faf5ff; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Comparativo - Janela de Johari</h1>
          <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <h3>Total de Participantes</h3>
            <p>${comparativeReport.summary.total_participants}</p>
          </div>
          <div class="stat">
            <h3>Avaliações Completas</h3>
            <p>${comparativeReport.summary.completed_assessments}</p>
          </div>
          <div class="stat">
            <h3>Taxa de Conclusão</h3>
            <p>${Math.round((comparativeReport.summary.completed_assessments / comparativeReport.summary.total_participants) * 100)}%</p>
          </div>
        </div>

        <div class="section">
          <h2>Resumo por Participante</h2>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Área Aberta</th>
                <th>Área Cega</th>
                <th>Área Oculta</th>
                <th>Área Desconhecida</th>
                <th>Score Autoconsciência</th>
              </tr>
            </thead>
            <tbody>
              ${filteredParticipants.map((participant: any) => `
                <tr>
                  <td>${participant.name}</td>
                  <td>${participant.code}</td>
                  <td>${participant.quadrants.open.count} (${participant.quadrants.open.percentage}%)</td>
                  <td>${participant.quadrants.blind.count} (${participant.quadrants.blind.percentage}%)</td>
                  <td>${participant.quadrants.hidden.count} (${participant.quadrants.hidden.percentage}%)</td>
                  <td>${participant.quadrants.unknown.count} (${participant.quadrants.unknown.percentage}%)</td>
                  <td>${participant.self_awareness_score}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${characteristicAnalysis ? `
        <div class="section">
          <h2>Análise de Características</h2>
          <h3>Mais Selecionadas</h3>
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Autoavaliações</th>
                <th>Avaliações entre Pares</th>
                <th>Consenso</th>
                <th>% Consenso</th>
              </tr>
            </thead>
            <tbody>
              ${characteristicAnalysis.most_selected.map((char: any) => `
                <tr>
                  <td>${char.name}</td>
                  <td>${char.self_selections}</td>
                  <td>${char.peer_selections}</td>
                  <td>${char.consensus_selections}</td>
                  <td>${char.consensus_percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `;

    // Criar blob e fazer download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_comparativo_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  const filteredParticipants = getFilteredParticipants();
  const participantsLength = filteredParticipants.length || 1;
  
  const stats = {
    total: filteredParticipants.length,
    completed: filteredParticipants.filter((p: any) => p.completed_at).length,
    avgScore: filteredParticipants.reduce((acc: any, p: any) => acc + (p.self_awareness_score || 0), 0) / participantsLength,
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
          <button 
            className={`reports-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtrar
          </button>
          <button 
            className="reports-export-btn"
            onClick={handleExportAllReports}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="reports-filters-panel">
          <div className="reports-filters-header">
            <h3 className="reports-filters-title">Filtros</h3>
            <button 
              className="reports-clear-filters-btn"
              onClick={clearFilters}
            >
              Limpar Filtros
            </button>
          </div>
          
          <div className="reports-filters-content">
            <div className="reports-filter-group">
              <label className="reports-filter-label">Nome do Participante</label>
              <input
                type="text"
                className="reports-filter-input"
                placeholder="Digite o nome..."
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
            </div>

            <div className="reports-filter-group">
              <label className="reports-filter-label">Faixa de Pontuação</label>
              <div className="reports-range-inputs">
                <input
                  type="number"
                  className="reports-filter-input"
                  placeholder="Mín"
                  min="0"
                  max="100"
                  value={filters.scoreRange.min}
                  onChange={(e) => setFilters({
                    ...filters, 
                    scoreRange: {...filters.scoreRange, min: parseInt(e.target.value) || 0}
                  })}
                />
                <span className="reports-range-separator">-</span>
                <input
                  type="number"
                  className="reports-filter-input"
                  placeholder="Máx"
                  min="0"
                  max="100"
                  value={filters.scoreRange.max}
                  onChange={(e) => setFilters({
                    ...filters, 
                    scoreRange: {...filters.scoreRange, max: parseInt(e.target.value) || 100}
                  })}
                />
              </div>
            </div>

            <div className="reports-filter-group">
              <label className="reports-filter-label">Status da Avaliação</label>
              <select
                className="reports-filter-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Todos</option>
                <option value="completed">Concluídas</option>
                <option value="incomplete">Incompletas</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
            <button 
              className={`reports-chart-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Barras
            </button>
            <button 
              className={`reports-chart-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
            >
              Pizza
            </button>
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
              {chartType === 'bar' ? (
                <BarChart data={getFilteredParticipants().map((p: any) => ({
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
              ) : (
                <PieChart>
                  <Pie
                    data={getFilteredParticipants().map((p: any) => ({
                      name: p.name.split(' ')[0],
                      fullName: p.name,
                      code: p.code,
                      value: Math.round((p.self_awareness_score + p.peer_perception_score) / 2),
                      selfScore: Math.round(p.self_awareness_score),
                      peerScore: Math.round(p.peer_perception_score)
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getFilteredParticipants().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
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
                </PieChart>
              )}
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
          {!comparativeReport?.participants || getFilteredParticipants().length === 0 ? (
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
                  {getFilteredParticipants().map((participant: any) => (
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
                      <td>{participant.email || 'N/A'}</td>
                      <td>
                        <div className="report-score">
                          <span className="report-score-value">{Math.round((participant.self_awareness_score + participant.peer_perception_score) / 2)}</span>
                          {getScoreBadge((participant.self_awareness_score + participant.peer_perception_score) / 2)}
                        </div>
                      </td>
                      <td className="report-date">
                        {participant.completed_at ? formatDate(participant.completed_at) : '-'}
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