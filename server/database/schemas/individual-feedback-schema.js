/**
 * Schema para avaliações individuais e feedback
 * Inclui: 360 graus, competências, objetivos, feedback estruturado
 */

// Tipos de avaliação disponíveis
const EVALUATION_TYPES = {
  JOHARI_WINDOW: 'johari_window',
  THREE_SIXTY: '360_degrees',
  COMPETENCY: 'competency',
  GOALS: 'goals',
  STRUCTURED_FEEDBACK: 'structured_feedback'
};

// Categorias de competências
const COMPETENCY_CATEGORIES = {
  TECHNICAL: 'technical',
  INTERPERSONAL: 'interpersonal',
  LEADERSHIP: 'leadership',
  COMMUNICATION: 'communication',
  STRATEGIC: 'strategic',
  EXECUTION: 'execution'
};

// Status de objetivos
const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * SQL para criar tabelas de avaliação individual (PostgreSQL)
 */
const createIndividualFeedbackTablesSQL = `
  -- Tabela de tipos de avaliação
  CREATE TABLE IF NOT EXISTS evaluation_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de competências
  CREATE TABLE IF NOT EXISTS competencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    evaluation_type_id INTEGER REFERENCES evaluation_types(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de avaliações 360 graus
  CREATE TABLE IF NOT EXISTS three_sixty_evaluations (
    id SERIAL PRIMARY KEY,
    evaluated_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    evaluator_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    evaluation_type_id INTEGER REFERENCES evaluation_types(id),
    relationship_type VARCHAR(50), -- 'peer', 'subordinate', 'supervisor', 'self', 'client'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    is_anonymous BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(evaluated_id, evaluator_id, evaluation_type_id)
  );

  -- Tabela de avaliações de competências
  CREATE TABLE IF NOT EXISTS competency_ratings (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER NOT NULL REFERENCES three_sixty_evaluations(id) ON DELETE CASCADE,
    competency_id INTEGER NOT NULL REFERENCES competencies(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(evaluation_id, competency_id)
  );

  -- Tabela de objetivos individuais (OKR/Goals)
  CREATE TABLE IF NOT EXISTS individual_goals (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'personal', 'professional', 'team', 'company'
    status VARCHAR(50) DEFAULT 'not_started',
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    target_date DATE,
    completion_date DATE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de acompanhamento de progresso de objetivos
  CREATE TABLE IF NOT EXISTS goal_progress (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES individual_goals(id) ON DELETE CASCADE,
    progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    notes TEXT,
    updated_by INTEGER REFERENCES participants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de feedback estruturado individual (Modelo SBI)
  CREATE TABLE IF NOT EXISTS individual_feedback (
    id SERIAL PRIMARY KEY,
    from_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    to_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) DEFAULT 'structured', -- 'structured', 'informal', 'recognition'
    situation TEXT NOT NULL, -- Situação (SBI)
    behavior TEXT NOT NULL, -- Comportamento (SBI)
    impact TEXT NOT NULL, -- Impacto (SBI)
    action_plan TEXT, -- Plano de ação
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_id != to_id)
  );

  -- Tabela de insights gerados por IA
  CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    evaluation_id INTEGER, -- Referência para avaliação relacionada (pode ser NULL)
    insight_type VARCHAR(50) NOT NULL, -- 'strengths', 'improvements', 'recommendations', 'patterns'
    content TEXT NOT NULL,
    metadata JSONB, -- Dados adicionais em formato JSON
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_used VARCHAR(100), -- 'gpt-4', 'gpt-3.5-turbo', etc
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- Insights podem expirar
  );

  -- Índices para melhor performance
  CREATE INDEX IF NOT EXISTS idx_three_sixty_evaluated ON three_sixty_evaluations(evaluated_id);
  CREATE INDEX IF NOT EXISTS idx_three_sixty_evaluator ON three_sixty_evaluations(evaluator_id);
  CREATE INDEX IF NOT EXISTS idx_competency_ratings_evaluation ON competency_ratings(evaluation_id);
  CREATE INDEX IF NOT EXISTS idx_individual_goals_participant ON individual_goals(participant_id);
  CREATE INDEX IF NOT EXISTS idx_individual_feedback_to ON individual_feedback(to_id);
  CREATE INDEX IF NOT EXISTS idx_individual_feedback_from ON individual_feedback(from_id);
  CREATE INDEX IF NOT EXISTS idx_ai_insights_participant ON ai_insights(participant_id);
`;

/**
 * SQL para inserir dados iniciais
 */
const insertInitialDataSQL = `
  -- Inserir tipos de avaliação
  INSERT INTO evaluation_types (name, code, description) VALUES
    ('Janela de Johari', 'johari_window', 'Avaliação de autoconsciência e percepção'),
    ('Avaliação 360 Graus', '360_degrees', 'Feedback de múltiplas fontes'),
    ('Avaliação de Competências', 'competency', 'Avaliação de habilidades e competências'),
    ('Objetivos e Metas', 'goals', 'Acompanhamento de objetivos individuais'),
    ('Feedback Estruturado', 'structured_feedback', 'Feedback usando modelo SBI')
  ON CONFLICT (code) DO NOTHING;

  -- Inserir competências padrão
  INSERT INTO competencies (name, category, description, evaluation_type_id) 
  SELECT 
    name,
    category,
    description,
    (SELECT id FROM evaluation_types WHERE code = 'competency')
  FROM (VALUES
    ('Comunicação Verbal', 'communication', 'Capacidade de se expressar claramente'),
    ('Comunicação Escrita', 'communication', 'Capacidade de escrever de forma clara e objetiva'),
    ('Escuta Ativa', 'communication', 'Capacidade de ouvir e compreender outros'),
    ('Trabalho em Equipe', 'interpersonal', 'Capacidade de trabalhar colaborativamente'),
    ('Relacionamento Interpessoal', 'interpersonal', 'Habilidade de construir relacionamentos'),
    ('Empatia', 'interpersonal', 'Capacidade de entender as emoções dos outros'),
    ('Liderança de Equipe', 'leadership', 'Capacidade de liderar e motivar equipes'),
    ('Tomada de Decisão', 'leadership', 'Capacidade de tomar decisões assertivas'),
    ('Visão Estratégica', 'strategic', 'Capacidade de pensar estrategicamente'),
    ('Planejamento', 'strategic', 'Capacidade de planejar e organizar'),
    ('Execução', 'execution', 'Capacidade de executar tarefas com eficiência'),
    ('Gestão de Tempo', 'execution', 'Capacidade de gerenciar tempo e prioridades'),
    ('Resolução de Problemas', 'technical', 'Capacidade de resolver problemas complexos'),
    ('Pensamento Analítico', 'technical', 'Capacidade de analisar informações'),
    ('Adaptabilidade', 'technical', 'Capacidade de se adaptar a mudanças')
  ) AS v(name, category, description)
  ON CONFLICT DO NOTHING;
`;

module.exports = {
  createIndividualFeedbackTablesSQL,
  insertInitialDataSQL,
  EVALUATION_TYPES,
  COMPETENCY_CATEGORIES,
  GOAL_STATUS
};

