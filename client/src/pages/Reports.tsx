import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { ComparativeReport, CharacteristicAnalysis } from '../types';
import { 
  TrendingUp, 
  Users, 
  Download,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  FileText,
  Share,
  Filter,
  Target,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PDFExportButton, { ComparativeReportPDFButton, ElementPDFButton } from '../components/PDFExportButton';
import AdvancedFilters, { FilterOptions } from '../components/AdvancedFilters';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import '../styles/design-system.css';

const Reports: React.FC = () => {
  const [comparativeReport, setComparativeReport] = useState<ComparativeReport | null>(null);
  const [characteristicAnalysis, setCharacteristicAnalysis] = useState<CharacteristicAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    scoreRange: { min: 0, max: 100 },
    status: 'all',
    name: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showOnlyHighPerformers: false,
    showOnlyIncomplete: false
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setError('');
      setLoading(true);
      const [comparative, characteristics] = await Promise.all([
        reportsAPI.getComparativeReport(),
        reportsAPI.getCharacteristicAnalysis()
      ]);
      
      setComparativeReport(comparative);
      setCharacteristicAnalysis(characteristics);
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      // Se for erro de conexão, mostrar erro. Se for 404 ou vazio, apenas não há dados
      if (error.response?.status >= 500 || error.code === 'NETWORK_ERROR') {
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
      } else {
        // Pode ser que simplesmente não há relatórios ainda
        setComparativeReport(null);
        setCharacteristicAnalysis(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return <span className="badge badge-success">Excelente</span>;
    } else if (score >= 60) {
      return <span className="badge badge-info">Bom</span>;
    } else if (score >= 40) {
      return <span className="badge badge-warning">Regular</span>;
    } else {
      return <span className="badge badge-error">Baixo</span>;
    }
  };

  const getFilteredParticipants = () => {
    if (!comparativeReport?.participants) return [];
    
    const hasActiveFilters = filters.name || 
      filters.status !== 'all' || 
      filters.dateRange.start || 
      filters.dateRange.end ||
      filters.showOnlyHighPerformers ||
      filters.showOnlyIncomplete;
    
    if (!hasActiveFilters) {
      return comparativeReport.participants;
    }
    
    let filtered = comparativeReport.participants.filter((participant: any) => {
      const score = Math.round((participant.self_awareness_score + participant.peer_perception_score) / 2);
      const isCompleted = participant.self_awareness_score > 0 && participant.peer_perception_score > 0;
      
      const nameMatch = !filters.name || participant.name.toLowerCase().includes(filters.name.toLowerCase());
      const scoreMatch = score >= filters.scoreRange.min && score <= filters.scoreRange.max;
      const statusMatch = filters.status === 'all' || 
        (filters.status === 'completed' && isCompleted) ||
        (filters.status === 'incomplete' && !isCompleted);
      
      let dateMatch = true;
      if (filters.dateRange.start || filters.dateRange.end) {
        const participantDate = new Date(participant.created_at);
        if (filters.dateRange.start && participantDate < new Date(filters.dateRange.start)) {
          dateMatch = false;
        }
        if (filters.dateRange.end && participantDate > new Date(filters.dateRange.end)) {
          dateMatch = false;
        }
      }
      
      const highPerformerMatch = !filters.showOnlyHighPerformers || score >= 80;
      const incompleteMatch = !filters.showOnlyIncomplete || !isCompleted;
      
      return nameMatch && scoreMatch && statusMatch && dateMatch && highPerformerMatch && incompleteMatch;
    });
    
    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          const scoreA = (a.self_awareness_score + a.peer_perception_score) / 2;
          const scoreB = (b.self_awareness_score + b.peer_perception_score) / 2;
          comparison = scoreA - scoreB;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'status':
          const statusA = (a.self_awareness_score > 0 && a.peer_perception_score > 0) ? 1 : 0;
          const statusB = (b.self_awareness_score > 0 && b.peer_perception_score > 0) ? 1 : 0;
          comparison = statusA - statusB;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  };

  const getChartData = () => {
    if (!comparativeReport?.participants) return [];
    
    return comparativeReport.participants.map((p: any) => ({
      name: p.name.split(' ')[0],
      fullName: p.name,
      code: p.code,
      score: Math.round((p.self_awareness_score + p.peer_perception_score) / 2),
      selfScore: Math.round(p.self_awareness_score),
      peerScore: Math.round(p.peer_perception_score)
    }));
  };

  const generateReportContent = () => {
    if (!comparativeReport) return 'Relatório não disponível';
    
    const participants = comparativeReport.participants || [];
    const totalParticipants = participants.length;
    const completedAssessments = participants.filter((p: any) => p.self_awareness_score > 0 && p.peer_perception_score > 0).length;
    const averageScore = participants.reduce((acc: number, p: any) => acc + (p.self_awareness_score + p.peer_perception_score) / 2, 0) / totalParticipants;
    
    return `
      RELATÓRIO COMPARATIVO - JANELA DE JOHARI
      
      Total de Participantes: ${totalParticipants}
      Avaliações Completas: ${completedAssessments}
      Taxa de Conclusão: ${Math.round((completedAssessments / totalParticipants) * 100)}%
      
      PONTUAÇÃO MÉDIA GERAL: ${Math.round(averageScore)}%
      
      Este relatório foi gerado automaticamente pelo sistema Janela de Johari.
    `;
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando relatórios...</p>
      </div>
    );
  }

  // Se houver erro de conexão, mostrar erro
  if (error) {
    return (
      <div className="page-container">
        <ErrorState
          title="Erro ao carregar relatórios"
          message={error}
          onRetry={fetchReports}
        />
      </div>
    );
  }

  const filteredParticipants = getFilteredParticipants();
  const participantsLength = filteredParticipants.length || 1;
  
  const stats = {
    total: filteredParticipants.length,
    completed: filteredParticipants.filter((p: any) => p.self_awareness_score > 0 && p.peer_perception_score > 0).length,
    avgScore: filteredParticipants.reduce((acc: any, p: any) => acc + (p.self_awareness_score || 0), 0) / participantsLength,
    insights: characteristicAnalysis?.most_selected?.length || 0
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">Relatórios</h1>
            <p className="page-subtitle">Análise completa dos resultados da avaliação</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            <ComparativeReportPDFButton
              reportContent={generateReportContent()}
            />
            <ElementPDFButton
              elementId="reports-container"
              label="Exportar Tudo"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        totalParticipants={comparativeReport?.participants?.length || 0}
        filteredCount={getFilteredParticipants().length}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Participantes</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.completed}</p>
              <p className="stat-label">Completos</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{Math.round(stats.avgScore)}</p>
              <p className="stat-label">Pontuação Média</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{stats.insights}</p>
              <p className="stat-label">Insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      {comparativeReport?.participants && getChartData().length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <h3 className="card-title">Distribuição de Pontuações</h3>
                <p className="card-subtitle">Visualização gráfica dos resultados</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button 
                  className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChartType('bar')}
                >
                  Barras
                </button>
                <button 
                  className={`btn btn-sm ${chartType === 'pie' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setChartType('pie')}
                >
                  Pizza
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Pontuação (0-100)', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      <div key="tooltip" style={{ padding: 'var(--space-2)' }}>
                        <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{props.payload.fullName}</div>
                        <div style={{ fontSize: '0.875rem' }}>Código: {props.payload.code}</div>
                        <div style={{ fontSize: '0.875rem' }}>Pontuação: {value}%</div>
                        <div style={{ fontSize: '0.875rem' }}>Self: {props.payload.selfScore}%</div>
                        <div style={{ fontSize: '0.875rem' }}>Peer: {props.payload.peerScore}%</div>
                      </div>
                    ]}
                  />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, score }) => `${name}: ${score}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="score"
                  >
                    {getChartData().map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: 'var(--radius-md)',
                      color: '#f8fafc'
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Análise de Performance</h3>
          <p className="card-subtitle">Lista detalhada de participantes e pontuações</p>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {!comparativeReport?.participants || filteredParticipants.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum relatório disponível"
              description="Os relatórios serão gerados automaticamente quando as avaliações forem concluídas. Comece adicionando participantes e realizando avaliações."
              action={{
                label: 'Ver Participantes',
                onClick: () => window.location.href = '/app/participants',
                icon: Users
              }}
              type="info"
            />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Pontuação</th>
                    <th>Auto</th>
                    <th>Pares</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant: any) => {
                    const score = Math.round((participant.self_awareness_score + participant.peer_perception_score) / 2);
                    const isCompleted = participant.self_awareness_score > 0 && participant.peer_perception_score > 0;
                    
                    return (
                      <tr key={participant.code}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-md)',
                              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}>
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{participant.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{participant.code}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{score}%</span>
                            {getScoreBadge(score)}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {Math.round(participant.self_awareness_score)}%
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {Math.round(participant.peer_perception_score)}%
                        </td>
                        <td>
                          {isCompleted ? (
                            <span className="badge badge-success">Completo</span>
                          ) : (
                            <span className="badge badge-warning">Incompleto</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/report/${participant.code}`}
                              className="action-btn"
                              title="Ver relatório individual"
                            >
                              <FileText className="w-4 h-4" />
                            </Link>
                            <PDFExportButton
                              type="individual"
                              data={{
                                title: `Relatório Individual - ${participant.name}`,
                                subtitle: 'Análise de Autoconsciência',
                                participantName: participant.name,
                                participantCode: participant.code,
                                generatedAt: new Date(),
                                content: `Relatório de ${participant.name}\n\nPontuação: ${score}%\nAuto: ${Math.round(participant.self_awareness_score)}%\nPeer: ${Math.round(participant.peer_perception_score)}%`
                              }}
                              className="action-btn"
                            >
                              <Download className="w-4 h-4" />
                            </PDFExportButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Characteristics Analysis */}
      {characteristicAnalysis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          {/* Most Selected */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Mais Selecionadas</h3>
              <p className="card-subtitle">{characteristicAnalysis.most_selected.length} características</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Característica</th>
                      <th>Auto</th>
                      <th>Pares</th>
                      <th>Consenso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characteristicAnalysis.most_selected.slice(0, 5).map((char: any, index: number) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 500 }}>{char.name}</td>
                        <td>{char.self_selections}</td>
                        <td>{char.peer_selections}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontWeight: 600 }}>{char.consensus_selections}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              ({char.consensus_percentage}%)
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Least Selected */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Menos Selecionadas</h3>
              <p className="card-subtitle">{characteristicAnalysis.least_selected.length} características</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Característica</th>
                      <th>Auto</th>
                      <th>Pares</th>
                      <th>Consenso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characteristicAnalysis.least_selected.slice(0, 5).map((char: any, index: number) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 500 }}>{char.name}</td>
                        <td>{char.self_selections}</td>
                        <td>{char.peer_selections}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <span style={{ fontWeight: 600 }}>{char.consensus_selections}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              ({char.consensus_percentage}%)
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
