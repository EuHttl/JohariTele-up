import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  Star
} from 'lucide-react';
import { DevelopmentInsight } from '../services/developmentAnalysis';
import '../styles/development-insights.css';

interface DevelopmentInsightsProps {
  insights: DevelopmentInsight[];
  participantName: string;
  onGeneratePlan?: (insights: DevelopmentInsight[]) => void;
}

const DevelopmentInsights: React.FC<DevelopmentInsightsProps> = ({ 
  insights, 
  participantName,
  onGeneratePlan 
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  // Filtrar insights por prioridade
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all') return true;
    return insight.priority === activeTab;
  });

  // Função para obter ícone baseado no tipo
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Star className="w-5 h-5" />;
      case 'weakness': return <AlertTriangle className="w-5 h-5" />;
      case 'opportunity': return <Lightbulb className="w-5 h-5" />;
      case 'blind_spot': return <Target className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  // Função para obter cor baseada na prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  // Função para obter cor baseada no tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'type-strength';
      case 'weakness': return 'type-weakness';
      case 'opportunity': return 'type-opportunity';
      case 'blind_spot': return 'type-blind-spot';
      default: return 'type-default';
    }
  };

  return (
    <div className="development-insights-container">
      {/* Header */}
      <div className="development-insights-header">
        <div className="development-insights-title">
          <TrendingUp className="w-6 h-6" />
          <h2>Análise de Desenvolvimento - {participantName}</h2>
        </div>
        <p className="development-insights-subtitle">
          Insights personalizados baseados na Janela de Johari
        </p>
      </div>

      {/* Tabs de Filtro */}
      <div className="development-insights-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <CheckCircle className="w-4 h-4" />
          Todos ({insights.length})
        </button>
        <button 
          className={`tab ${activeTab === 'high' ? 'active' : ''}`}
          onClick={() => setActiveTab('high')}
        >
          <AlertTriangle className="w-4 h-4" />
          Alta Prioridade ({insights.filter(i => i.priority === 'high').length})
        </button>
        <button 
          className={`tab ${activeTab === 'medium' ? 'active' : ''}`}
          onClick={() => setActiveTab('medium')}
        >
          <Target className="w-4 h-4" />
          Média Prioridade ({insights.filter(i => i.priority === 'medium').length})
        </button>
        <button 
          className={`tab ${activeTab === 'low' ? 'active' : ''}`}
          onClick={() => setActiveTab('low')}
        >
          <Star className="w-4 h-4" />
          Baixa Prioridade ({insights.filter(i => i.priority === 'low').length})
        </button>
      </div>

      {/* Lista de Insights */}
      <div className="development-insights-list">
        {filteredInsights.length === 0 ? (
          <div className="development-insights-empty">
            <Lightbulb className="w-12 h-12" />
            <p>Nenhum insight encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          filteredInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`development-insight-card ${getTypeColor(insight.type)} ${getPriorityColor(insight.priority)}`}
            >
              <div className="development-insight-header">
                <div className="development-insight-icon">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="development-insight-content">
                  <h3 className="development-insight-title">{insight.title}</h3>
                  <p className="development-insight-description">{insight.description}</p>
                  <div className="development-insight-meta">
                    <span className={`priority-badge ${getPriorityColor(insight.priority)}`}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </span>
                    <span className="category-badge">{insight.category}</span>
                  </div>
                </div>
                <button 
                  className="development-insight-toggle"
                  onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
                >
                  <ArrowRight className={`w-4 h-4 ${expandedInsight === index ? 'rotated' : ''}`} />
                </button>
              </div>

              {/* Conteúdo Expandido */}
              {expandedInsight === index && (
                <div className="development-insight-expanded">
                  {/* Ações Recomendadas */}
                  <div className="development-insight-section">
                    <h4 className="section-title">
                      <Target className="w-4 h-4" />
                      Ações Recomendadas
                    </h4>
                    <ul className="action-items">
                      {insight.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="action-item">
                          <CheckCircle className="w-4 h-4" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recursos Sugeridos */}
                  <div className="development-insight-section">
                    <h4 className="section-title">
                      <BookOpen className="w-4 h-4" />
                      Recursos Sugeridos
                    </h4>
                    <ul className="resources-list">
                      {insight.resources.map((resource, resourceIndex) => (
                        <li key={resourceIndex} className="resource-item">
                          <ArrowRight className="w-3 h-3" />
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Botão para Gerar Plano */}
      {onGeneratePlan && insights.length > 0 && (
        <div className="development-insights-footer">
          <button 
            className="generate-plan-btn"
            onClick={() => onGeneratePlan(insights)}
          >
            <Calendar className="w-5 h-5" />
            Gerar Plano de Desenvolvimento
          </button>
        </div>
      )}
    </div>
  );
};

export default DevelopmentInsights;
