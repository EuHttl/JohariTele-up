import api from './api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  type: 'free' | 'professional' | 'enterprise';
  price_monthly: number;
  price_yearly: number;
  max_participants: number;
  max_assessments_per_month: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  admin_id: number;
  plan_id: number;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  billing_cycle: 'monthly' | 'yearly';
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface UsageTracking {
  id: number;
  admin_id: number;
  subscription_id: number;
  month_year: string;
  participants_created: number;
  assessments_completed: number;
  reports_generated: number;
  created_at: string;
  updated_at: string;
}

export interface BillingInfo {
  hasSubscription: boolean;
  subscription?: Subscription;
  usage?: UsageTracking;
  current_participants?: number;
  message?: string;
}

export interface UsageInfo {
  success: boolean;
  usage: UsageTracking;
  limits: {
    max_participants: number;
    max_assessments_per_month: number;
    can_export: boolean;
    can_use_api: boolean;
    can_white_label: boolean;
    has_priority_support: boolean;
  };
  current_participants: number;
  plan_type: string;
}

class SubscriptionService {
  /**
   * Buscar todos os planos disponíveis
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get('/subscriptions/plans');
      return response.data.plans;
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      throw error;
    }
  }

  /**
   * Buscar informações da assinatura atual
   */
  async getCurrentSubscription(): Promise<BillingInfo> {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinatura atual:', error);
      throw error;
    }
  }

  /**
   * Buscar informações de uso atual
   */
  async getUsage(): Promise<UsageInfo> {
    try {
      const response = await api.get('/subscriptions/usage');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar uso:', error);
      throw error;
    }
  }

  /**
   * Atualizar plano de assinatura
   */
  async upgradePlan(planId: number, billingCycle: 'monthly' | 'yearly'): Promise<any> {
    try {
      const response = await api.post('/subscriptions/upgrade', {
        plan_id: planId,
        billing_cycle: billingCycle
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(): Promise<any> {
    try {
      const response = await api.post('/subscriptions/cancel');
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de assinaturas
   */
  async getSubscriptionHistory(): Promise<any> {
    try {
      const response = await api.get('/subscriptions/history');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Verificar se pode realizar uma ação baseada no plano
   */
  canPerformAction(limits: UsageInfo['limits'], action: string, currentUsage?: number): boolean {
    switch (action) {
      case 'create_participant':
        return limits.max_participants === -1 || (currentUsage || 0) < limits.max_participants;
      case 'export_report':
        return limits.can_export;
      case 'use_api':
        return limits.can_use_api;
      case 'white_label':
        return limits.can_white_label;
      default:
        return true;
    }
  }

  /**
   * Formatar preço para exibição
   */
  formatPrice(price: number): string {
    if (price === 0) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  /**
   * Calcular economia anual
   */
  calculateAnnualSavings(monthlyPrice: number, yearlyPrice: number): number {
    const monthlyTotal = monthlyPrice * 12;
    return monthlyTotal - yearlyPrice;
  }

  /**
   * Obter cor do plano
   */
  getPlanColor(planType: string): string {
    switch (planType) {
      case 'free':
        return 'text-gray-600';
      case 'professional':
        return 'text-blue-600';
      case 'enterprise':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Obter cor de fundo do plano
   */
  getPlanBgColor(planType: string): string {
    switch (planType) {
      case 'free':
        return 'bg-gray-50';
      case 'professional':
        return 'bg-blue-50';
      case 'enterprise':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  }
}

export const subscriptionService = new SubscriptionService();
