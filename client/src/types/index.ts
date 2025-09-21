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
