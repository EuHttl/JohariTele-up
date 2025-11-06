import React, { useState, useEffect } from 'react';
import { Check, Crown, Star, Users, FileText, Download, Code, Headphones, Zap, ArrowRight } from 'lucide-react';
import { subscriptionService, SubscriptionPlan, BillingInfo } from '../services/subscriptionService';
import '../styles/design-system.css';

const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<number | string | null>(null);

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

  const handleUpgrade = async (planId: number | string) => {
    try {
      setUpgrading(planId);
      
      const plan = plans.find(p => {
        const pId = String(p.id);
        const searchId = String(planId);
        return pId === searchId || Number(pId) === Number(searchId);
      });
      
      if (!plan) {
        throw new Error('Plano não encontrado');
      }
      
      if (plan.type === 'free') {
        await subscriptionService.upgradePlan(plan.id, billingCycle);
        await loadData();
        alert('Plano atualizado com sucesso!');
      } else {
        await subscriptionService.upgradePlan(plan.id, billingCycle);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar plano:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro ao atualizar plano';
      alert(errorMessage);
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.')) {
      return;
    }

    try {
      if (currentSubscription?.subscription?.stripe_subscription_id) {
        await subscriptionService.cancelSubscriptionWithPayment();
      } else {
        await subscriptionService.cancelSubscription();
      }
      await loadData();
      alert('Assinatura cancelada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      alert(error.response?.data?.message || 'Erro ao cancelar assinatura');
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return <Users className="w-6 h-6" />;
      case 'professional':
        return <Star className="w-6 h-6" />;
      case 'enterprise':
        return <Crown className="w-6 h-6" />;
      default:
        return <Users className="w-6 h-6" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('participantes')) return <Users className="w-4 h-4" />;
    if (feature.includes('avaliação')) return <FileText className="w-4 h-4" />;
    if (feature.includes('Exportação') || feature.includes('PDF')) return <Download className="w-4 h-4" />;
    if (feature.includes('API')) return <Code className="w-4 h-4" />;
    if (feature.includes('Suporte')) return <Headphones className="w-4 h-4" />;
    if (feature.includes('White-label')) return <Zap className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!currentSubscription?.subscription?.plan_id) return false;
    const currentPlanId = String(currentSubscription.subscription.plan_id);
    const planId = String(plan.id);
    return currentPlanId === planId || Number(currentPlanId) === Number(planId);
  };

  const canUpgrade = (plan: SubscriptionPlan) => {
    if (!currentSubscription?.subscription) return true;
    const currentPlanId = String(currentSubscription.subscription.plan_id);
    const currentPlan = plans.find(p => {
      const pId = String(p.id);
      return pId === currentPlanId || Number(pId) === Number(currentPlanId);
    });
    
    if (!currentPlan) return true;
    
    const planOrder: Record<string, number> = { free: 0, professional: 1, enterprise: 2 };
    return (planOrder[plan.type] || 0) > (planOrder[currentPlan.type] || 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando planos...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Planos de Assinatura</h1>
          <p className="page-subtitle">Escolha o plano ideal para suas necessidades</p>
        </div>
        
        {/* Billing Cycle Toggle */}
        <div style={{ 
          display: 'inline-flex', 
          background: 'var(--bg-gray-100)', 
          borderRadius: 'var(--radius-md)', 
          padding: '4px',
          gap: '4px'
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            className="btn"
            style={{
              background: billingCycle === 'monthly' ? 'var(--bg-white)' : 'transparent',
              color: billingCycle === 'monthly' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: billingCycle === 'monthly' ? 'var(--shadow-sm)' : 'none',
              border: 'none'
            }}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className="btn"
            style={{
              background: billingCycle === 'yearly' ? 'var(--bg-white)' : 'transparent',
              color: billingCycle === 'yearly' ? 'var(--color-primary)' : 'var(--text-secondary)',
              boxShadow: billingCycle === 'yearly' ? 'var(--shadow-sm)' : 'none',
              border: 'none',
              position: 'relative'
            }}
          >
            Anual
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: 'var(--color-success)',
              color: 'white',
              fontSize: '0.625rem',
              padding: '2px 6px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600
            }}>
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const savings = subscriptionService.calculateAnnualSavings(plan.price_monthly, plan.price_yearly);
          const isCurrent = isCurrentPlan(plan);
          const canUpgradePlan = canUpgrade(plan);
          const isEnterprise = plan.type === 'enterprise';
          
          return (
            <div 
              key={plan.id} 
              className="card"
              style={{
                position: 'relative',
                border: isEnterprise ? '2px solid var(--color-secondary)' : '1px solid var(--bg-gray-200)',
                background: isEnterprise 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
                  : 'var(--bg-white)',
                transform: isEnterprise ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isEnterprise ? 'var(--shadow-xl)' : 'var(--shadow-sm)'
              }}
            >
              {isEnterprise && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  right: 'var(--space-4)',
                  background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Popular
                </div>
              )}
              
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-4)',
                  left: 'var(--space-4)',
                  background: 'var(--color-success)',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Plano Atual
                </div>
              )}

              <div className="card-body">
                {/* Plan Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    margin: '0 auto var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    background: isEnterprise
                      ? 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)'
                      : plan.type === 'professional'
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    {getPlanIcon(plan.type)}
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 var(--space-2) 0' }}>
                    {plan.name}
                  </h3>
                </div>

                {/* Pricing */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'var(--space-1)' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>R$</span>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                      {billingCycle === 'monthly' 
                        ? Math.floor(price).toString()
                        : Math.floor(price / 12).toString()
                      }
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && savings > 0 && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      Economize {subscriptionService.formatPrice(savings)}/ano
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {plan.features.map((feature, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'var(--color-success-light)',
                          color: 'var(--color-success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <div>
                  {isCurrent ? (
                    <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
                      Plano Atual
                    </button>
                  ) : canUpgradePlan ? (
                    <button
                      className={`btn ${isEnterprise ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={String(upgrading) === String(plan.id)}
                      style={{ 
                        width: '100%',
                        background: isEnterprise 
                          ? 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)'
                          : undefined,
                        border: isEnterprise ? 'none' : undefined,
                        color: isEnterprise ? 'white' : undefined
                      }}
                    >
                      {String(upgrading) === String(plan.id) ? (
                        <>Atualizando...</>
                      ) : (
                        <>
                          Escolher Plano
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
                      Downgrade não permitido
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && currentSubscription.subscription && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sua Assinatura Atual</h3>
            <p className="card-subtitle">Informações sobre sua assinatura ativa</p>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Plano</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentSubscription.subscription.plan?.name || 'Gratuito'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Ciclo</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentSubscription.subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Status</div>
                <div>
                  <span className={`badge ${currentSubscription.subscription.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                    {currentSubscription.subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              {currentSubscription.subscription.expires_at && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>Expira em</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {new Date(currentSubscription.subscription.expires_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
            
            {currentSubscription.subscription.plan?.type !== 'free' && (
              <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--bg-gray-200)' }}>
                <button onClick={handleCancel} className="btn btn-danger">
                  Cancelar Assinatura
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
