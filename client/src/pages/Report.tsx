import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reportsAPI, participantsAPI } from '../services/api';
import { JohariReport, Participant } from '../types';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  EyeOff, 
  Lightbulb,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const Report: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [report, setReport] = useState<JohariReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [participantData, reportData] = await Promise.all([
        participantsAPI.getByCode(code!),
        reportsAPI.getJohariReport(code!)
      ]);

      setParticipant(participantData);
      setReport(reportData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    if (code) {
      fetchData();
    }
  }, [code, fetchData]);

  const getQuadrantColor = (quadrantName: string) => {
    switch (quadrantName.toLowerCase()) {
      case 'área aberta':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'área cega':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'área oculta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'área desconhecida':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'attention':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'growth':
        return <TrendingUp className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'attention':
        return 'border-yellow-200 bg-yellow-50';
      case 'opportunity':
        return 'border-blue-200 bg-blue-50';
      case 'growth':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleDownloadPDF = () => {
    if (!participant || !report) return;
    
    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório - ${participant.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .quadrant { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
          .open { background-color: #f0f9ff; }
          .blind { background-color: #fefce8; }
          .hidden { background-color: #eff6ff; }
          .unknown { background-color: #faf5ff; }
          .characteristics { margin-top: 10px; }
          .characteristic { display: inline-block; background: #e5e7eb; padding: 4px 8px; margin: 2px; border-radius: 4px; font-size: 12px; }
          .insight { border-left: 4px solid #3b82f6; padding: 10px; margin: 10px 0; background: #f8fafc; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório da Janela de Johari</h1>
          <h2>${participant.name} (${participant.code})</h2>
          <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div class="stats">
          <div class="stat">
            <h3>Autoavaliação</h3>
            <p>${participant.has_completed_self_assessment ? 'Completa' : 'Pendente'}</p>
          </div>
          <div class="stat">
            <h3>Avaliações Entre Pares</h3>
            <p>${participant.has_completed_peer_assessments ? 'Completas' : 'Pendentes'}</p>
          </div>
        </div>

        <div class="section">
          <h2>Janela de Johari</h2>
          
          <div class="quadrant open">
            <h3>Área Aberta (${report.quadrants.open.percentage}%)</h3>
            <p>Características conhecidas por você e pelos outros</p>
            <div class="characteristics">
              ${report.quadrants.open.characteristics.map(char => `<span class="characteristic">${char}</span>`).join('')}
            </div>
          </div>

          <div class="quadrant blind">
            <h3>Área Cega (${report.quadrants.blind.percentage}%)</h3>
            <p>Características conhecidas pelos outros, mas não por você</p>
            <div class="characteristics">
              ${report.quadrants.blind.characteristics.map(char => `<span class="characteristic">${char}</span>`).join('')}
            </div>
          </div>

          <div class="quadrant hidden">
            <h3>Área Oculta (${report.quadrants.hidden.percentage}%)</h3>
            <p>Características conhecidas por você, mas não pelos outros</p>
            <div class="characteristics">
              ${report.quadrants.hidden.characteristics.map(char => `<span class="characteristic">${char}</span>`).join('')}
            </div>
          </div>

          <div class="quadrant unknown">
            <h3>Área Desconhecida (${report.quadrants.unknown.percentage}%)</h3>
            <p>Características desconhecidas por você e pelos outros</p>
            <div class="characteristics">
              ${report.quadrants.unknown.characteristics.map(char => `<span class="characteristic">${char}</span>`).join('')}
            </div>
          </div>
        </div>

        ${report.insights.length > 0 ? `
        <div class="section">
          <h2>Insights e Recomendações</h2>
          ${report.insights.map(insight => `
            <div class="insight">
              <h4>${insight.title}</h4>
              <p>${insight.message}</p>
              ${insight.recommendation ? `<p><em>${insight.recommendation}</em></p>` : ''}
            </div>
          `).join('')}
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
    link.download = `relatorio_${participant.code}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Carregando relatório...</span>
      </div>
    );
  }

  if (error || !participant || !report) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {error || 'Relatório não encontrado'}
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'Não foi possível gerar o relatório para este participante.'}
        </p>
        <Link to="/app/participants" className="btn btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Voltar aos Participantes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/participants" className="btn btn-outline">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório Individual</h1>
            <p className="text-gray-600">
              {participant.name} ({participant.code})
            </p>
          </div>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleDownloadPDF}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Autoavaliação</p>
                <p className={`text-lg font-bold ${participant.has_completed_self_assessment ? 'text-green-600' : 'text-red-600'}`}>
                  {participant.has_completed_self_assessment ? 'Completa' : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliações Entre Pares</p>
                <p className={`text-lg font-bold ${participant.has_completed_peer_assessments ? 'text-green-600' : 'text-red-600'}`}>
                  {participant.has_completed_peer_assessments ? 'Completas' : 'Pendentes'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Johari Window Quadrants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(report.quadrants).map(([key, quadrant]) => (
          <div key={key} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="card-title">{quadrant.name}</h3>
                  <p className="card-subtitle">{quadrant.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{quadrant.count}</div>
                  <div className="text-sm text-gray-600">{quadrant.percentage}%</div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {quadrant.characteristics.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {quadrant.characteristics.map((characteristic, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md border ${getQuadrantColor(quadrant.name)}`}
                    >
                      {characteristic}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma característica identificada nesta área
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {report.insights.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Insights e Recomendações</h3>
            <p className="card-subtitle">Análise personalizada baseada nos resultados</p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {report.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-gray-700 mb-2">{insight.message}</p>
                      {insight.recommendation && (
                        <p className="text-sm text-gray-600 italic">
                          {insight.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Johari Window Visualization */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Visualização da Janela de Johari</h3>
          <p className="card-subtitle">Representação gráfica dos quatro quadrantes</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Área Aberta */}
            <div className="p-4 border-2 border-green-300 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-800">Área Aberta</h4>
              </div>
              <p className="text-sm text-green-700 mb-2">
                Eu sei / Outros sabem
              </p>
              <div className="text-2xl font-bold text-green-600">
                {report.quadrants.open.percentage}%
              </div>
            </div>

            {/* Área Cega */}
            <div className="p-4 border-2 border-yellow-300 rounded-lg bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Área Cega</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-2">
                Eu não sei / Outros sabem
              </p>
              <div className="text-2xl font-bold text-yellow-600">
                {report.quadrants.blind.percentage}%
              </div>
            </div>

            {/* Área Oculta */}
            <div className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Área Oculta</h4>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                Eu sei / Outros não sabem
              </p>
              <div className="text-2xl font-bold text-blue-600">
                {report.quadrants.hidden.percentage}%
              </div>
            </div>

            {/* Área Desconhecida */}
            <div className="p-4 border-2 border-purple-300 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Área Desconhecida</h4>
              </div>
              <p className="text-sm text-purple-700 mb-2">
                Eu não sei / Outros não sabem
              </p>
              <div className="text-2xl font-bold text-purple-600">
                {report.quadrants.unknown.percentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 py-4">
        Relatório gerado em {new Date(report.generated_at).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default Report;
