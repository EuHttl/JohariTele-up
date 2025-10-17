import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, TrendingUp, AlertCircle, CheckCircle, Crown, Star } from 'lucide-react';
import { subscriptionService, UsageInfo } from '../services/subscriptionService';
import '../styles/subscription-usage.css';

const SubscriptionUsage: React.FC = () => {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const usageData = await subscriptionService.getUsage();
      setUsage(usageData);
    } catch (error) {
      console.error('Erro ao carregar uso:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 100; // Ilimitado
    return Math.min((current / max) * 100, 100);
  };

  const getUsageStatus = (current: number, max: number) => {
    const percentage = getUsagePercentage(current, max);
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'good';
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Users className="w-6 h-6 text-gray-600" />;
      case 'professional':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <Users className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="subscription-usage-loading">
        <div className="loading-spinner"></div>
        <p>Carregando informações de uso...</p>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="subscription-usage-error">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3>Erro ao carregar dados</h3>
        <p>Não foi possível carregar as informações de uso.</p>
      </div>
    );
  }

  return (
    <div className="subscription-usage">
      <div className="usage-header">
        <div className="usage-title">
          <h1>Uso da Assinatura</h1>
          <div className="plan-badge">
            {getPlanIcon(usage.plan_type)}
            <span className="plan-name">
              {usage.plan_type === 'free' && 'Plano Gratuito'}
              {usage.plan_type === 'professional' && 'Plano Profissional'}
              {usage.plan_type === 'enterprise' && 'Plano Empresarial'}
            </span>
          </div>
        </div>
      </div>

      <div className="usage-stats">
        <div className="stat-card participants">
          <div className="stat-header">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-title">
              <h3>Participantes</h3>
              <p>Criados este mês</p>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-numbers">
              <span className="current">{usage.current_participants}</span>
              <span className="separator">/</span>
              <span className="limit">
                {usage.limits.max_participants === -1 ? '∞' : usage.limits.max_participants}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className={`stat-progress ${getUsageStatus(usage.current_participants, usage.limits.max_participants)}`}
                style={{ 
                  width: `${getUsagePercentage(usage.current_participants, usage.limits.max_participants)}%` 
                }}
              />
            </div>
            <div className="stat-status">
              {usage.limits.max_participants === -1 ? (
                <div className="status-unlimited">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ilimitado</span>
                </div>
              ) : (
                <div className={`status-${getUsageStatus(usage.current_participants, usage.limits.max_participants)}`}>
                  {getUsageStatus(usage.current_participants, usage.limits.max_participants) === 'critical' && <AlertCircle className="w-4 h-4" />}
                  {getUsageStatus(usage.current_participants, usage.limits.max_participants) === 'warning' && <AlertCircle className="w-4 h-4" />}
                  {getUsageStatus(usage.current_participants, usage.limits.max_participants) === 'good' && <CheckCircle className="w-4 h-4" />}
                  <span>
                    {usage.limits.max_participants - usage.current_participants} restantes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card assessments">
          <div className="stat-header">
            <div className="stat-icon">
              <FileText className="w-6 h-6" />
            </div>
            <div className="stat-title">
              <h3>Avaliações</h3>
              <p>Completadas este mês</p>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-numbers">
              <span className="current">{usage.usage.assessments_completed}</span>
              <span className="separator">/</span>
              <span className="limit">
                {usage.limits.max_assessments_per_month === -1 ? '∞' : usage.limits.max_assessments_per_month}
              </span>
            </div>
            <div className="stat-bar">
              <div 
                className={`stat-progress ${getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month)}`}
                style={{ 
                  width: `${getUsagePercentage(usage.usage.assessments_completed, usage.limits.max_assessments_per_month)}%` 
                }}
              />
            </div>
            <div className="stat-status">
              {usage.limits.max_assessments_per_month === -1 ? (
                <div className="status-unlimited">
                  <CheckCircle className="w-4 h-4" />
                  <span>Ilimitado</span>
                </div>
              ) : (
                <div className={`status-${getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month)}`}>
                  {getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month) === 'critical' && <AlertCircle className="w-4 h-4" />}
                  {getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month) === 'warning' && <AlertCircle className="w-4 h-4" />}
                  {getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month) === 'good' && <CheckCircle className="w-4 h-4" />}
                  <span>
                    {usage.limits.max_assessments_per_month - usage.usage.assessments_completed} restantes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card reports">
          <div className="stat-header">
            <div className="stat-icon">
              <Download className="w-6 h-6" />
            </div>
            <div className="stat-title">
              <h3>Relatórios</h3>
              <p>Gerados este mês</p>
            </div>
          </div>
          <div className="stat-content">
            <div className="stat-numbers">
              <span className="current">{usage.usage.reports_generated}</span>
              <span className="separator">/</span>
              <span className="limit">∞</span>
            </div>
            <div className="stat-bar">
              <div className="stat-progress unlimited" style={{ width: '100%' }} />
            </div>
            <div className="stat-status">
              <div className="status-unlimited">
                <CheckCircle className="w-4 h-4" />
                <span>Ilimitado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-overview">
        <h2>Recursos do Seu Plano</h2>
        <div className="features-grid">
          <div className={`feature-item ${usage.limits.can_export ? 'enabled' : 'disabled'}`}>
            <Download className="w-5 h-5" />
            <span>Exportação de Relatórios</span>
            {usage.limits.can_export ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          
          <div className={`feature-item ${usage.limits.can_use_api ? 'enabled' : 'disabled'}`}>
            <TrendingUp className="w-5 h-5" />
            <span>Acesso à API</span>
            {usage.limits.can_use_api ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          
          <div className={`feature-item ${usage.limits.can_white_label ? 'enabled' : 'disabled'}`}>
            <Crown className="w-5 h-5" />
            <span>White-label</span>
            {usage.limits.can_white_label ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
          
          <div className={`feature-item ${usage.limits.has_priority_support ? 'enabled' : 'disabled'}`}>
            <Users className="w-5 h-5" />
            <span>Suporte Prioritário</span>
            {usage.limits.has_priority_support ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {usage.plan_type === 'free' && (
        <div className="upgrade-cta">
          <h3>Quer mais recursos?</h3>
          <p>Atualize para um plano superior e desbloqueie mais funcionalidades!</p>
          <button className="upgrade-btn">
            Ver Planos Disponíveis
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionUsage;
