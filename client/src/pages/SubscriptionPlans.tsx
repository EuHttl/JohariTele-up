import React, { useState, useEffect } from 'react';
import { Check, Crown, Star, Zap, Users, FileText, Download, Api, Headphones } from 'lucide-react';
import { subscriptionService, SubscriptionPlan, BillingInfo } from '../services/subscriptionService';
import '../styles/subscription-plans.css';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription()
      ]);
      
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: number) => {
    try {
      setUpgrading(planId);
      await subscriptionService.upgradePlan(planId, billingCycle);
      await loadData(); // Recarregar dados após upgrade
      alert('Plano atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar plano');
    } finally {
      setUpgrading(null);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Users className="w-8 h-8 text-gray-600" />;
      case 'professional':
        return <Star className="w-8 h-8 text-blue-600" />;
      case 'enterprise':
        return <Crown className="w-8 h-8 text-purple-600" />;
      default:
        return <Users className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('participantes')) return <Users className="w-4 h-4" />;
    if (feature.includes('avaliação')) return <FileText className="w-4 h-4" />;
    if (feature.includes('Exportação') || feature.includes('PDF')) return <Download className="w-4 h-4" />;
    if (feature.includes('API')) return <Api className="w-4 h-4" />;
    if (feature.includes('Suporte')) return <Headphones className="w-4 h-4" />;
    if (feature.includes('White-label')) return <Zap className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    return currentSubscription?.subscription?.plan_id === plan.id;
  };

  const canUpgrade = (plan: SubscriptionPlan) => {
    if (!currentSubscription?.subscription) return true;
    const currentPlanId = currentSubscription.subscription.plan_id;
    const currentPlan = plans.find(p => p.id === currentPlanId);
    
    if (!currentPlan) return true;
    
    // Lógica de upgrade: free < professional < enterprise
    const planOrder = { free: 0, professional: 1, enterprise: 2 };
    return planOrder[plan.type] > planOrder[currentPlan.type];
  };

  if (loading) {
    return (
      <div className="subscription-plans-loading">
        <div className="loading-spinner"></div>
        <p>Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="subscription-plans">
      <div className="subscription-plans-header">
        <h1>Planos de Assinatura</h1>
        <p>Escolha o plano ideal para suas necessidades</p>
        
        <div className="billing-cycle-toggle">
          <button
            className={`billing-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Mensal
          </button>
          <button
            className={`billing-toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            Anual
            <span className="savings-badge">Economize 17%</span>
          </button>
        </div>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const savings = subscriptionService.calculateAnnualSavings(plan.price_monthly, plan.price_yearly);
          const isCurrent = isCurrentPlan(plan);
          const canUpgradePlan = canUpgrade(plan);
          
          return (
            <div key={plan.id} className={`plan-card ${plan.type} ${isCurrent ? 'current' : ''}`}>
              <div className="plan-header">
                <div className="plan-icon">
                  {getPlanIcon(plan.type)}
                </div>
                <h3>{plan.name}</h3>
                {isCurrent && <span className="current-badge">Plano Atual</span>}
              </div>

              <div className="plan-pricing">
                <div className="price">
                  <span className="currency">R$</span>
                  <span className="amount">
                    {billingCycle === 'monthly' 
                      ? Math.floor(price).toString()
                      : Math.floor(price / 12).toString()
                    }
                  </span>
                  <span className="period">
                    /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                  </span>
                </div>
                {billingCycle === 'yearly' && savings > 0 && (
                  <div className="savings">
                    Economize {subscriptionService.formatPrice(savings)}/ano
                  </div>
                )}
              </div>

              <div className="plan-features">
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <div className="feature-icon">
                        {getFeatureIcon(feature)}
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-actions">
                {isCurrent ? (
                  <button className="plan-btn current-btn" disabled>
                    Plano Atual
                  </button>
                ) : canUpgradePlan ? (
                  <button
                    className="plan-btn upgrade-btn"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading === plan.id}
                  >
                    {upgrading === plan.id ? 'Atualizando...' : 'Escolher Plano'}
                  </button>
                ) : (
                  <button className="plan-btn disabled-btn" disabled>
                    Downgrade não permitido
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentSubscription && (
        <div className="current-subscription-info">
          <h3>Sua Assinatura Atual</h3>
          <div className="subscription-details">
            <div className="detail-item">
              <span className="label">Plano:</span>
              <span className="value">
                {currentSubscription.subscription?.plan?.name || 'Gratuito'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Ciclo:</span>
              <span className="value">
                {currentSubscription.subscription?.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value status ${currentSubscription.subscription?.status || 'active'}`}>
                {currentSubscription.subscription?.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {currentSubscription.subscription?.expires_at && (
              <div className="detail-item">
                <span className="label">Expira em:</span>
                <span className="value">
                  {new Date(currentSubscription.subscription.expires_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
