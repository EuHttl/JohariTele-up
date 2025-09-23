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
import '../styles/reports.css';

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
      <div className="individual-status-grid">
        <div className="individual-status-card">
          <div className="individual-status-content">
            <div className="individual-status-icon self">
              <User className="h-6 w-6" />
            </div>
            <div className="individual-status-info">
              <p className="individual-status-label">Autoavaliação</p>
              <p className={`individual-status-value ${participant.has_completed_self_assessment ? 'completed' : 'pending'}`}>
                {participant.has_completed_self_assessment ? 'Completa' : 'Pendente'}
              </p>
            </div>
          </div>
        </div>

        <div className="individual-status-card">
          <div className="individual-status-content">
            <div className="individual-status-icon peers">
              <Users className="h-6 w-6" />
            </div>
            <div className="individual-status-info">
              <p className="individual-status-label">Avaliações Entre Pares</p>
              <p className={`individual-status-value ${participant.has_completed_peer_assessments ? 'completed' : 'pending'}`}>
                {participant.has_completed_peer_assessments ? 'Completas' : 'Pendentes'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Johari Window Quadrants */}
      <div className="individual-quadrants-grid">
        {Object.entries(report.quadrants).map(([key, quadrant]) => (
          <div key={key} className={`individual-quadrant-card ${key}`}>
            <div className="individual-quadrant-header">
              <div className="individual-quadrant-stats">
                <div>
                  <h3 className="individual-quadrant-title">{quadrant.name}</h3>
                  <p className="individual-quadrant-description">{quadrant.description}</p>
                </div>
                <div className="text-right">
                  <div className="individual-quadrant-percentage">{quadrant.percentage}%</div>
                  <div className="individual-quadrant-count">{quadrant.count} características</div>
                </div>
              </div>
            </div>
            <div className="individual-quadrant-body">
              {quadrant.characteristics.length > 0 ? (
                <div className="individual-characteristics-grid">
                  {quadrant.characteristics.map((characteristic, index) => (
                    <div
                      key={index}
                      className={`individual-characteristic-tag ${key}`}
                    >
                      {characteristic}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="individual-empty-state">
                  Nenhuma característica identificada nesta área
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      {report.insights.length > 0 && (
        <div className="individual-insights-card">
          <div className="individual-insights-header">
            <h3 className="individual-insights-title">Insights e Recomendações</h3>
            <p className="individual-insights-subtitle">Análise personalizada baseada nos resultados</p>
          </div>
          <div className="individual-insights-body">
            <div className="individual-insights-grid">
              {report.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`individual-insight-item ${insight.type}`}
                >
                  <div className="individual-insight-header">
                    <div className={`individual-insight-icon ${insight.type}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <h4 className="individual-insight-title">{insight.title}</h4>
                  </div>
                  <p className="individual-insight-message">{insight.message}</p>
                  {insight.recommendation && (
                    <p className="individual-insight-recommendation">
                      {insight.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Johari Window Visualization */}
      <div className="individual-johari-visualization">
        <div className="individual-johari-header">
          <h3 className="individual-johari-title">Visualização da Janela de Johari</h3>
          <p className="individual-johari-subtitle">Representação gráfica dos quatro quadrantes</p>
        </div>
        <div className="individual-johari-body">
          <div className="individual-johari-grid">
            {/* Área Aberta */}
            <div className="individual-johari-quadrant open">
              <div className="individual-johari-quadrant-header">
                <div className="individual-johari-quadrant-icon open">
                  <Eye className="h-5 w-5" />
                </div>
                <h4 className="individual-johari-quadrant-title">Área Aberta</h4>
              </div>
              <p className="individual-johari-quadrant-description">
                Eu sei / Outros sabem
              </p>
              <div className="individual-johari-quadrant-percentage">
                {report.quadrants.open.percentage}%
              </div>
            </div>

            {/* Área Cega */}
            <div className="individual-johari-quadrant blind">
              <div className="individual-johari-quadrant-header">
                <div className="individual-johari-quadrant-icon blind">
                  <EyeOff className="h-5 w-5" />
                </div>
                <h4 className="individual-johari-quadrant-title">Área Cega</h4>
              </div>
              <p className="individual-johari-quadrant-description">
                Eu não sei / Outros sabem
              </p>
              <div className="individual-johari-quadrant-percentage">
                {report.quadrants.blind.percentage}%
              </div>
            </div>

            {/* Área Oculta */}
            <div className="individual-johari-quadrant hidden">
              <div className="individual-johari-quadrant-header">
                <div className="individual-johari-quadrant-icon hidden">
                  <Eye className="h-5 w-5" />
                </div>
                <h4 className="individual-johari-quadrant-title">Área Oculta</h4>
              </div>
              <p className="individual-johari-quadrant-description">
                Eu sei / Outros não sabem
              </p>
              <div className="individual-johari-quadrant-percentage">
                {report.quadrants.hidden.percentage}%
              </div>
            </div>

            {/* Área Desconhecida */}
            <div className="individual-johari-quadrant unknown">
              <div className="individual-johari-quadrant-header">
                <div className="individual-johari-quadrant-icon unknown">
                  <EyeOff className="h-5 w-5" />
                </div>
                <h4 className="individual-johari-quadrant-title">Área Desconhecida</h4>
              </div>
              <p className="individual-johari-quadrant-description">
                Eu não sei / Outros não sabem
              </p>
              <div className="individual-johari-quadrant-percentage">
                {report.quadrants.unknown.percentage}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="individual-report-footer">
        Relatório gerado em {new Date(report.generated_at).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};

export default Report;
