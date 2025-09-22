import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  BarChart3,
  Grid3X3,
  Eye,
  RefreshCw
} from 'lucide-react';

interface AssessmentTracking {
  summary: {
    total_possible_evaluations: number;
    completed_evaluations: number;
    partial_evaluations: number;
    not_started: number;
  };
  evaluations: Array<{
    assessor: {
      id: number;
      name: string;
      code: string;
    };
    evaluations: Array<{
      assessed: {
        id: number;
        name: string;
        code: string;
      };
      characteristics_evaluated: number;
      last_evaluation_date: string;
      status: string;
    }>;
  }>;
}

interface AssessmentMatrix {
  participants: string[];
  matrix: Array<{
    assessor: string;
    evaluations: Array<{
      assessed: string;
      characteristics_count: number;
      status_icon: string;
    }>;
  }>;
}

interface ParticipantProgress {
  id: number;
  name: string;
  code: string;
  self_assessment: {
    completed: boolean;
    characteristics_count: number;
    progress_percentage: number;
  };
  peer_assessments_given: {
    peers_evaluated: number;
    total_peers: number;
    progress_percentage: number;
  };
  peer_assessments_received: {
    peers_who_evaluated_me: number;
    total_peers: number;
    progress_percentage: number;
  };
  overall_status: {
    completed: boolean;
    peer_assessments_completed: boolean;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [trackingData, setTrackingData] = useState<AssessmentTracking | null>(null);
  const [matrixData, setMatrixData] = useState<AssessmentMatrix | null>(null);
  const [progressData, setProgressData] = useState<ParticipantProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tracking' | 'matrix' | 'progress'>('tracking');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tracking, matrix, progress] = await Promise.all([
        adminAPI.getAssessmentTracking(),
        adminAPI.getAssessmentMatrix(),
        adminAPI.getParticipantProgress()
      ]);

      setTrackingData(tracking);
      setMatrixData(matrix);
      setProgressData(progress);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completa': return 'text-green-600 bg-green-100';
      case 'Parcial': return 'text-yellow-600 bg-yellow-100';
      case 'Não iniciada': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completa': return <CheckCircle className="h-4 w-4" />;
      case 'Parcial': return <Clock className="h-4 w-4" />;
      case 'Não iniciada': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você precisa ser um administrador para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Carregando dashboard administrativo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erro ao carregar dados
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          <RefreshCw className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o progresso das avaliações entre pares
          </p>
        </div>
        <button onClick={fetchData} className="btn btn-primary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Summary Stats */}
      {trackingData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card hover-lift">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Total de Avaliações</p>
                  <p className="text-lg font-bold text-gray-900">
                    {trackingData.summary.total_possible_evaluations}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Completas</p>
                  <p className="text-lg font-bold text-gray-900">
                    {trackingData.summary.completed_evaluations}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Parciais</p>
                  <p className="text-lg font-bold text-gray-900">
                    {trackingData.summary.partial_evaluations}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card hover-lift">
            <div className="card-body p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Não Iniciadas</p>
                  <p className="text-lg font-bold text-gray-900">
                    {trackingData.summary.not_started}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="card-header">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tracking'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Rastreamento Detalhado
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4 inline mr-2" />
              Matriz de Avaliações
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Progresso Individual
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Tracking Tab */}
          {activeTab === 'tracking' && trackingData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Rastreamento por Avaliador
              </h3>
              {trackingData.evaluations.map((assessor) => (
                <div key={assessor.assessor.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      {assessor.assessor.name} ({assessor.assessor.code})
                    </h4>
                    <span className="text-sm text-gray-500">
                      {assessor.evaluations.filter(e => e.status === 'Completa').length} de{' '}
                      {assessor.evaluations.length} completas
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {assessor.evaluations.map((evaluation) => (
                      <div
                        key={`${assessor.assessor.id}-${evaluation.assessed.id}`}
                        className={`flex items-center justify-between p-2 rounded border ${
                          evaluation.status === 'Completa' ? 'bg-green-50 border-green-200' :
                          evaluation.status === 'Parcial' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-red-50 border-red-200'
                        }`}
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {evaluation.assessed.name}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                          {getStatusIcon(evaluation.status)}
                          <span className="ml-1">{evaluation.characteristics_evaluated}/56</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Matrix Tab */}
          {activeTab === 'matrix' && matrixData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Matriz de Avaliações
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avaliador
                      </th>
                      {matrixData.participants.map((participant) => (
                        <th key={participant} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {participant.split(' ')[0]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {matrixData.matrix.map((row) => (
                      <tr key={row.assessor}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.assessor}
                        </td>
                        {matrixData.participants.map((participant) => {
                          const evaluation = row.evaluations.find(e => e.assessed === participant);
                          return (
                            <td key={participant} className="px-3 py-4 whitespace-nowrap text-center">
                              {evaluation ? (
                                <span className={`text-2xl ${evaluation.status_icon === '✅' ? 'text-green-600' : evaluation.status_icon === '🟡' ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {evaluation.status_icon}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-600 text-xl mr-2">✅</span>
                  <div>
                    <div className="font-medium">Completa (56/56)</div>
                    <div className="text-xs text-gray-500">Todas características avaliadas</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-600 text-xl mr-2">🟡</span>
                  <div>
                    <div className="font-medium">Parcial (1-55)</div>
                    <div className="text-xs text-gray-500">Avaliação incompleta</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-red-600 text-xl mr-2">❌</span>
                  <div>
                    <div className="font-medium">Não iniciada (0)</div>
                    <div className="text-xs text-gray-500">Nenhuma característica avaliada</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Progresso Individual dos Participantes
              </h3>
              <div className="space-y-3">
                {progressData.map((participant) => (
                  <div key={participant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {participant.name} ({participant.code})
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        participant.overall_status.completed 
                          ? 'bg-green-100 text-green-800' 
                          : participant.overall_status.peer_assessments_completed
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {participant.overall_status.completed ? '✅ Completo' : 
                         participant.overall_status.peer_assessments_completed ? '🟡 Em Progresso' : 
                         '❌ Pendente'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Autoavaliação */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Autoavaliação</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            participant.self_assessment.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {participant.self_assessment.completed ? 'Completa' : 'Pendente'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participant.self_assessment.progress_percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {participant.self_assessment.characteristics_count}/56 características / characteristics
                        </p>
                      </div>

                      {/* Avaliações Dadas */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Avaliações Dadas</span>
                          <span className="text-xs text-gray-600">
                            {participant.peer_assessments_given.peers_evaluated}/{participant.peer_assessments_given.total_peers}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participant.peer_assessments_given.progress_percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {participant.peer_assessments_given.progress_percentage}% completo / complete
                        </p>
                      </div>

                      {/* Avaliações Recebidas */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Avaliações Recebidas</span>
                          <span className="text-xs text-gray-600">
                            {participant.peer_assessments_received.peers_who_evaluated_me}/{participant.peer_assessments_received.total_peers}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participant.peer_assessments_received.progress_percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {participant.peer_assessments_received.progress_percentage}% dos pares avaliaram / of peers evaluated
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
