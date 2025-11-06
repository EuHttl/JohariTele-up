import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, TrendingUp, AlertCircle, CheckCircle, Crown, Star, Zap } from 'lucide-react';
import { subscriptionService, UsageInfo } from '../services/subscriptionService';
import { Link } from 'react-router-dom';
import '../styles/design-system.css';

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

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'free': return 'Plano Gratuito';
      case 'professional': return 'Plano Profissional';
      case 'enterprise': return 'Plano Empresarial';
      default: return 'Plano';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando informações de uso...</p>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <AlertCircle className="empty-state-icon" style={{ color: 'var(--color-error)' }} />
          <h3 className="empty-state-title">Erro ao carregar dados</h3>
          <p className="empty-state-description">Não foi possível carregar as informações de uso.</p>
        </div>
      </div>
    );
  }

  const participantsStatus = getUsageStatus(usage.current_participants, usage.limits.max_participants);
  const assessmentsStatus = getUsageStatus(usage.usage.assessments_completed, usage.limits.max_assessments_per_month);

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">Uso da Assinatura</h1>
            <p className="page-subtitle">Monitore o uso do seu plano atual</p>
          </div>
          <Link to="/app/plans" className="btn btn-primary">
            <Zap className="w-4 h-4" />
            Gerenciar Plano
          </Link>
        </div>
      </div>

      {/* Plan Info Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="stat-icon" style={{ 
              background: usage.plan_type === 'enterprise' 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                : usage.plan_type === 'professional'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
            }}>
              {usage.plan_type === 'enterprise' ? (
                <Crown className="w-6 h-6" />
              ) : usage.plan_type === 'professional' ? (
                <Star className="w-6 h-6" />
              ) : (
                <Users className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="card-title">{getPlanName(usage.plan_type)}</h3>
              <p className="card-subtitle">Plano ativo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{usage.current_participants}</p>
              <p className="stat-label">
                {usage.limits.max_participants === -1 
                  ? 'Ilimitado' 
                  : `de ${usage.limits.max_participants} participantes`
                }
              </p>
              {usage.limits.max_participants !== -1 && (
                <div className="stat-change" style={{ 
                  color: participantsStatus === 'critical' ? 'var(--color-error)' : 
                         participantsStatus === 'warning' ? 'var(--color-warning)' : 
                         'var(--color-success)' 
                }}>
                  <TrendingUp className="w-4 h-4" />
                  {getUsagePercentage(usage.current_participants, usage.limits.max_participants).toFixed(0)}% usado
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: 'var(--bg-gray-200)', 
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${getUsagePercentage(usage.current_participants, usage.limits.max_participants)}%`,
                height: '100%',
                background: participantsStatus === 'critical' 
                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  : participantsStatus === 'warning'
                  ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{usage.usage.assessments_completed}</p>
              <p className="stat-label">
                {usage.limits.max_assessments_per_month === -1 
                  ? 'Ilimitado' 
                  : `de ${usage.limits.max_assessments_per_month} avaliações/mês`
                }
              </p>
              {usage.limits.max_assessments_per_month !== -1 && (
                <div className="stat-change" style={{ 
                  color: assessmentsStatus === 'critical' ? 'var(--color-error)' : 
                         assessmentsStatus === 'warning' ? 'var(--color-warning)' : 
                         'var(--color-success)' 
                }}>
                  <TrendingUp className="w-4 h-4" />
                  {getUsagePercentage(usage.usage.assessments_completed, usage.limits.max_assessments_per_month).toFixed(0)}% usado
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: 'var(--bg-gray-200)', 
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${getUsagePercentage(usage.usage.assessments_completed, usage.limits.max_assessments_per_month)}%`,
                height: '100%',
                background: assessmentsStatus === 'critical' 
                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  : assessmentsStatus === 'warning'
                  ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                  : 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Download className="w-6 h-6" />
            </div>
            <div className="stat-content">
              <p className="stat-value">{usage.usage.reports_generated}</p>
              <p className="stat-label">Relatórios gerados</p>
              <div className="stat-change" style={{ color: 'var(--color-success)' }}>
                <CheckCircle className="w-4 h-4" />
                {usage.limits.can_export ? 'Exportação habilitada' : 'Exportação desabilitada'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Recursos do Plano</h3>
          <p className="card-subtitle">Funcionalidades disponíveis no seu plano atual</p>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-md)', 
                background: usage.limits.can_export ? 'var(--color-success-light)' : 'var(--bg-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: usage.limits.can_export ? 'var(--color-success)' : 'var(--text-tertiary)'
              }}>
                {usage.limits.can_export ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Exportação PDF/Excel</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {usage.limits.can_export ? 'Disponível' : 'Não disponível'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-md)', 
                background: usage.limits.can_use_api ? 'var(--color-success-light)' : 'var(--bg-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: usage.limits.can_use_api ? 'var(--color-success)' : 'var(--text-tertiary)'
              }}>
                {usage.limits.can_use_api ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>API Access</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {usage.limits.can_use_api ? 'Disponível' : 'Não disponível'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-md)', 
                background: usage.limits.can_white_label ? 'var(--color-success-light)' : 'var(--bg-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: usage.limits.can_white_label ? 'var(--color-success)' : 'var(--text-tertiary)'
              }}>
                {usage.limits.can_white_label ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>White Label</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {usage.limits.can_white_label ? 'Disponível' : 'Não disponível'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-gray-50)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-md)', 
                background: usage.limits.has_priority_support ? 'var(--color-success-light)' : 'var(--bg-gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: usage.limits.has_priority_support ? 'var(--color-success)' : 'var(--text-tertiary)'
              }}>
                {usage.limits.has_priority_support ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Suporte Prioritário</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {usage.limits.has_priority_support ? 'Disponível' : 'Não disponível'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionUsage;
