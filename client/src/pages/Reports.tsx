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
  Lightbulb
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };


  const getSelfAwarenessBadge = (score: number) => {
    if (score >= 70) return 'badge badge-success';
    if (score >= 50) return 'badge badge-warning';
    return 'badge badge-error';
  };

  const getSelfAwarenessLabel = (score: number) => {
    if (score >= 70) return 'Alta';
    if (score >= 50) return 'Média';
    return 'Baixa';
  };

  // Dados para gráficos
  const awarenessData = comparativeReport?.participants.map(p => ({
    name: p.name.split(' ')[0], // Primeiro nome apenas
    open: p.quadrants.open.percentage,
    blind: p.quadrants.blind.percentage,
    hidden: p.quadrants.hidden.percentage,
    unknown: p.quadrants.unknown.percentage,
    awareness: p.self_awareness_score
  })) || [];

  const pieData = comparativeReport ? [
    { 
      name: 'Completos', 
      value: comparativeReport.summary.completed_assessments, 
      color: '#10b981' 
    },
    { 
      name: 'Pendentes', 
      value: comparativeReport.summary.total_participants - comparativeReport.summary.completed_assessments, 
      color: '#ef4444' 
    }
  ] : [];

  const topCharacteristics = characteristicAnalysis?.most_selected.slice(0, 10).map(char => ({
    name: char.name,
    consensus: char.consensus_percentage,
    self: char.self_selections,
    peer: char.peer_selections
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Carregando relatórios...</span>
      </div>
    );
  }

  if (error || !comparativeReport) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error || 'Erro ao carregar relatórios'}
        </h3>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar os relatórios comparativos.
        </p>
        <button onClick={fetchReports} className="btn btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Comparativos</h1>
          <p className="text-gray-600">Análise geral da equipe e características</p>
        </div>
        <button className="btn btn-primary">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Participantes</p>
                <p className="text-2xl font-bold text-gray-900">{comparativeReport.summary.total_participants}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliações Completas</p>
                <p className="text-2xl font-bold text-gray-900">{comparativeReport.summary.completed_assessments}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((comparativeReport.summary.completed_assessments / comparativeReport.summary.total_participants) * 100)}% da equipe
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Autoconsciência Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(comparativeReport.participants.reduce((sum, p) => sum + p.self_awareness_score, 0) / comparativeReport.participants.length)}%
                </p>
                <p className="text-xs text-gray-500">nível da equipe</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Insights */}
      {comparativeReport.team_insights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Insights da Equipe</h3>
            <p className="card-subtitle">Análise e recomendações gerais</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {comparativeReport.team_insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-gray-700 mb-2">{insight.message}</p>
                    {insight.recommendation && (
                      <p className="text-sm text-blue-600 italic">{insight.recommendation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completion Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-hover fade-in">
          <div className="card-header">
            <h3 className="card-title">Status das Avaliações</h3>
            <p className="card-subtitle">Progresso da equipe</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Autoconsciência Individual</h3>
            <p className="card-subtitle">Nível de autoconsciência por participante</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={awarenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ 
                    value: 'Autoconsciência (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '12px' }
                  }}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Autoconsciência']} />
                <Bar 
                  dataKey="awareness" 
                  fill="#3b82f6"
                  name="Autoconsciência"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Participants Comparison */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Comparação Individual</h3>
          <p className="card-subtitle">Detalhamento por participante</p>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Área Aberta</th>
                  <th>Área Cega</th>
                  <th>Área Oculta</th>
                  <th>Área Desconhecida</th>
                  <th>Autoconsciência</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {comparativeReport.participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="font-medium">{participant.name}</td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{participant.quadrants.open.count}</div>
                        <div className="text-gray-500">{participant.quadrants.open.percentage}%</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{participant.quadrants.blind.count}</div>
                        <div className="text-gray-500">{participant.quadrants.blind.percentage}%</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{participant.quadrants.hidden.count}</div>
                        <div className="text-gray-500">{participant.quadrants.hidden.percentage}%</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{participant.quadrants.unknown.count}</div>
                        <div className="text-gray-500">{participant.quadrants.unknown.percentage}%</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getSelfAwarenessBadge(participant.self_awareness_score)}`}>
                        {participant.self_awareness_score}% - {getSelfAwarenessLabel(participant.self_awareness_score)}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/report/${participant.code}`}
                        className="btn btn-sm btn-outline"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Relatório
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Characteristics */}
      {characteristicAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Características Mais Selecionadas</h3>
              <p className="card-subtitle">Consenso entre autoavaliação e avaliação entre pares</p>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCharacteristics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    label={{ 
                      value: 'Consenso (%)', 
                      position: 'insideBottom',
                      style: { textAnchor: 'middle', fontSize: '12px' }
                    }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Consenso']} />
                  <Bar 
                    dataKey="consensus" 
                    fill="#10b981"
                    name="Consenso"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Características Menos Selecionadas</h3>
              <p className="card-subtitle">Áreas com menor consenso</p>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                {characteristicAnalysis.least_selected.slice(0, 10).map((char, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{char.name}</span>
                    <span className="text-sm text-gray-600">{char.consensus_percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4">
        Relatórios gerados em {new Date(comparativeReport.summary.generated_at).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default Reports;
