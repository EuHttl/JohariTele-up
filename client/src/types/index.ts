export interface Participant {
  id: number;
  name: string;
  email: string;
  code: string;
  has_completed_self_assessment: boolean;
  has_completed_peer_assessments: boolean;
  created_at: string;
}

export interface Characteristic {
  id: number;
  name: string;
}

export interface Assessment {
  characteristic_id: number;
  selected: boolean;
}

export interface SelfAssessment extends Characteristic {
  selected: boolean | null;
}

export interface PeerAssessment extends Characteristic {
  selected: boolean | null;
}

export interface JohariQuadrant {
  name: string;
  description: string;
  characteristics: string[];
  count: number;
  percentage: number;
}

export interface Insight {
  type: 'positive' | 'attention' | 'opportunity' | 'growth' | 'team';
  title: string;
  message: string;
  recommendation?: string;
}

export interface JohariReport {
  participant: {
    id: number;
    name: string;
    code: string;
    has_completed_self_assessment: boolean;
    has_completed_peer_assessments: boolean;
  };
  quadrants: {
    open: JohariQuadrant;
    blind: JohariQuadrant;
    hidden: JohariQuadrant;
    unknown: JohariQuadrant;
  };
  insights: Insight[];
  generated_at: string;
}

export interface ComparativeReport {
  summary: {
    total_participants: number;
    completed_assessments: number;
    generated_at: string;
  };
  participants: Array<{
    id: number;
    name: string;
    code: string;
    quadrants: {
      open: { count: number; percentage: number };
      blind: { count: number; percentage: number };
      hidden: { count: number; percentage: number };
      unknown: { count: number; percentage: number };
    };
    self_awareness_score: number;
    peer_perception_score: number;
  }>;
  team_insights: Insight[];
}

export interface CharacteristicAnalysis {
  most_selected: Array<{
    name: string;
    self_selections: number;
    peer_selections: number;
    consensus_selections: number;
    consensus_percentage: number;
  }>;
  least_selected: Array<{
    name: string;
    self_selections: number;
    peer_selections: number;
    consensus_selections: number;
    consensus_percentage: number;
  }>;
  generated_at: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  code: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

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

export interface SubscriptionLimits {
  max_participants: number;
  max_assessments_per_month: number;
  can_export: boolean;
  can_use_api: boolean;
  can_white_label: boolean;
  has_priority_support: boolean;
}

export interface BillingInfo {
  current_plan: SubscriptionPlan;
  subscription: Subscription;
  usage: UsageTracking;
  limits: SubscriptionLimits;
}