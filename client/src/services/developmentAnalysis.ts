// Serviço para análise de desenvolvimento pessoal baseado na Janela de Johari
// Este arquivo contém toda a lógica para identificar pontos fracos e sugerir melhorias

// Interface para definir os tipos de dados que vamos trabalhar
export interface DevelopmentInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'blind_spot';
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  resources: string[];
}

interface QuadrantAnalysis {
  open: string[];
  blind: string[];
  hidden: string[];
  unknown: string[];
}

// Função principal que analisa os dados de um participante
export function analyzeParticipantDevelopment(participant: any): DevelopmentInsight[] {
  console.log('🔍 Analisando desenvolvimento do participante:', participant.name);
  
  // Extrair os quadrantes da Janela de Johari
  const quadrants: QuadrantAnalysis = {
    open: participant.quadrants?.open?.characteristics || [],
    blind: participant.quadrants?.blind?.characteristics || [],
    hidden: participant.quadrants?.hidden?.characteristics || [],
    unknown: participant.quadrants?.unknown?.characteristics || []
  };

  // Array que vai armazenar todos os insights de desenvolvimento
  const insights: DevelopmentInsight[] = [];

  // 1. ANÁLISE DA ÁREA CEGA (Blind Spots) - Pontos cegos que outros veem
  if (quadrants.blind.length > 0) {
    insights.push(...analyzeBlindSpots(quadrants.blind));
  }

  // 2. ANÁLISE DA ÁREA OCULTA (Hidden) - Potencial não explorado
  if (quadrants.hidden.length > 0) {
    insights.push(...analyzeHiddenPotential(quadrants.hidden));
  }

  // 3. ANÁLISE DA ÁREA DESCONHECIDA (Unknown) - Oportunidades de crescimento
  if (quadrants.unknown.length > 0) {
    insights.push(...analyzeUnknownOpportunities(quadrants.unknown));
  }

  // 4. ANÁLISE DE DESEQUILÍBRIOS - Quando há muita diferença entre auto e peer
  insights.push(...analyzeImbalances(participant));

  // 5. ANÁLISE DE PONTOS FORTES - Para manter e desenvolver
  if (quadrants.open.length > 0) {
    insights.push(...analyzeStrengths(quadrants.open));
  }

  console.log('✅ Insights gerados:', insights.length);
  return insights;
}

// Função para analisar pontos cegos (Área Cega)
function analyzeBlindSpots(blindCharacteristics: string[]): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];

  // Mapear características para categorias de desenvolvimento
  const characteristicCategories = {
    'comunicação': ['Articulado', 'Direto', 'Comunicativo'],
    'liderança': ['Líder', 'Comandante', 'Poderoso'],
    'relacionamento': ['Empático', 'Gentil', 'Carinhoso'],
    'trabalho_equipe': ['Colaborativo', 'Apoiador', 'Solidário'],
    'criatividade': ['Criativo', 'Imaginativo', 'Inovador'],
    'organização': ['Organizado', 'Disciplinado', 'Pontual']
  };

  // Para cada categoria, verificar se há pontos cegos
  Object.entries(characteristicCategories).forEach(([category, characteristics]) => {
    const blindInCategory = blindCharacteristics.filter(char => 
      characteristics.some(cat => char.toLowerCase().includes(cat.toLowerCase()))
    );

    if (blindInCategory.length > 0) {
      insights.push({
        type: 'blind_spot',
        category: category,
        title: `Desenvolvimento em ${getCategoryTitle(category)}`,
        description: `Você tem potencial em ${blindInCategory.join(', ')} que outros já reconhecem, mas você ainda não desenvolveu plenamente.`,
        priority: 'high',
        actionItems: getActionItemsForCategory(category),
        resources: getResourcesForCategory(category)
      });
    }
  });

  return insights;
}

// Função para analisar potencial oculto (Área Oculta)
function analyzeHiddenPotential(hiddenCharacteristics: string[]): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];

  if (hiddenCharacteristics.length > 0) {
    insights.push({
      type: 'opportunity',
      category: 'autoconhecimento',
      title: 'Potencial Oculto Identificado',
      description: `Você possui ${hiddenCharacteristics.join(', ')} que ainda não compartilhou com outros. Considere como pode usar essas habilidades para contribuir mais com a equipe.`,
      priority: 'medium',
      actionItems: [
        'Identifique situações onde pode aplicar essas características',
        'Compartilhe suas habilidades com colegas de confiança',
        'Busque feedback sobre como outros percebem essas qualidades'
      ],
      resources: [
        'Workshop de Comunicação Assertiva',
        'Mentoria com líder sênior',
        'Projetos que permitam demonstrar essas habilidades'
      ]
    });
  }

  return insights;
}

// Função para analisar oportunidades desconhecidas (Área Desconhecida)
function analyzeUnknownOpportunities(unknownCharacteristics: string[]): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];

  if (unknownCharacteristics.length > 0) {
    insights.push({
      type: 'opportunity',
      category: 'crescimento',
      title: 'Oportunidades de Crescimento',
      description: `Existem áreas como ${unknownCharacteristics.slice(0, 3).join(', ')} que podem ser desenvolvidas para expandir seu potencial.`,
      priority: 'low',
      actionItems: [
        'Experimente novas atividades que desenvolvam essas características',
        'Busque mentoria em áreas específicas',
        'Participe de treinamentos focados'
      ],
      resources: [
        'Cursos de desenvolvimento pessoal',
        'Coaching individual',
        'Programas de mentoria'
      ]
    });
  }

  return insights;
}

// Função para analisar desequilíbrios entre autoavaliação e percepção dos pares
function analyzeImbalances(participant: any): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];
  
  const selfScore = participant.self_awareness_score || 0;
  const peerScore = participant.peer_perception_score || 0;
  const difference = Math.abs(selfScore - peerScore);

  // Se há uma diferença significativa (mais de 20 pontos)
  if (difference > 20) {
    if (selfScore > peerScore) {
      insights.push({
        type: 'weakness',
        category: 'autoconhecimento',
        title: 'Subestimação da Percepção dos Outros',
        description: `Sua autoavaliação (${selfScore}%) é significativamente maior que a percepção dos pares (${peerScore}%). Isso pode indicar uma visão inflada de si mesmo.`,
        priority: 'high',
        actionItems: [
          'Busque feedback mais específico e honesto',
          'Reflita sobre possíveis pontos cegos',
          'Pratique escuta ativa e aceitação de críticas'
        ],
        resources: [
          'Sessões de feedback 360°',
          'Coaching de autoconhecimento',
          'Workshop de escuta ativa'
        ]
      });
    } else {
      insights.push({
        type: 'weakness',
        category: 'autoconhecimento',
        title: 'Subestimação das Próprias Habilidades',
        description: `A percepção dos pares (${peerScore}%) é maior que sua autoavaliação (${selfScore}%). Você pode estar subestimando suas capacidades.`,
        priority: 'medium',
        actionItems: [
          'Reconheça e celebre suas conquistas',
          'Pratique autoconfiança em situações profissionais',
          'Busque validação de suas habilidades'
        ],
        resources: [
          'Programa de desenvolvimento de autoconfiança',
          'Mentoria para reconhecimento de potencial',
          'Workshop de autoestima profissional'
        ]
      });
    }
  }

  return insights;
}

// Função para analisar pontos fortes (Área Aberta)
function analyzeStrengths(openCharacteristics: string[]): DevelopmentInsight[] {
  const insights: DevelopmentInsight[] = [];

  if (openCharacteristics.length > 0) {
    insights.push({
      type: 'strength',
      category: 'reconhecimento',
      title: 'Pontos Fortes Reconhecidos',
      description: `Excelente! Você e outros reconhecem suas habilidades em ${openCharacteristics.slice(0, 3).join(', ')}. Continue desenvolvendo essas áreas.`,
      priority: 'low',
      actionItems: [
        'Mantenha o foco nessas áreas de excelência',
        'Use essas habilidades para mentorar outros',
        'Busque oportunidades de liderança'
      ],
      resources: [
        'Programas de mentoria',
        'Oportunidades de liderança',
        'Desenvolvimento de especialização'
      ]
    });
  }

  return insights;
}

// Funções auxiliares para mapear categorias
function getCategoryTitle(category: string): string {
  const titles: { [key: string]: string } = {
    'comunicação': 'Comunicação',
    'liderança': 'Liderança',
    'relacionamento': 'Relacionamento Interpessoal',
    'trabalho_equipe': 'Trabalho em Equipe',
    'criatividade': 'Criatividade',
    'organização': 'Organização'
  };
  return titles[category] || category;
}

function getActionItemsForCategory(category: string): string[] {
  const actionItems: { [key: string]: string[] } = {
    'comunicação': [
      'Pratique apresentações em público',
      'Participe de workshops de comunicação',
      'Solicite feedback sobre sua comunicação'
    ],
    'liderança': [
      'Busque oportunidades de liderar projetos',
      'Desenvolva habilidades de coaching',
      'Pratique tomada de decisões'
    ],
    'relacionamento': [
      'Pratique escuta ativa',
      'Desenvolva empatia',
      'Participe de atividades em equipe'
    ],
    'trabalho_equipe': [
      'Colabore mais em projetos',
      'Ofereça ajuda aos colegas',
      'Participe de atividades de team building'
    ],
    'criatividade': [
      'Participe de brainstorming',
      'Experimente novas abordagens',
      'Busque inspiração em diferentes áreas'
    ],
    'organização': [
      'Use ferramentas de gestão de tempo',
      'Desenvolva sistemas de organização',
      'Pratique planejamento e priorização'
    ]
  };
  return actionItems[category] || [];
}

function getResourcesForCategory(category: string): string[] {
  const resources: { [key: string]: string[] } = {
    'comunicação': [
      'Curso de Oratória',
      'Workshop de Comunicação Não-Violenta',
      'Mentoria em Apresentações'
    ],
    'liderança': [
      'Programa de Desenvolvimento de Liderança',
      'Coaching Executivo',
      'Curso de Gestão de Pessoas'
    ],
    'relacionamento': [
      'Workshop de Inteligência Emocional',
      'Curso de Relacionamento Interpessoal',
      'Programa de Mentoria'
    ],
    'trabalho_equipe': [
      'Atividades de Team Building',
      'Workshop de Colaboração',
      'Programa de Desenvolvimento de Equipe'
    ],
    'criatividade': [
      'Workshop de Design Thinking',
      'Curso de Inovação',
      'Programa de Criatividade'
    ],
    'organização': [
      'Curso de Gestão de Tempo',
      'Workshop de Produtividade',
      'Ferramentas de Organização'
    ]
  };
  return resources[category] || [];
}

// Função para gerar um plano de desenvolvimento personalizado
export function generateDevelopmentPlan(insights: DevelopmentInsight[]): {
  shortTerm: DevelopmentInsight[];
  mediumTerm: DevelopmentInsight[];
  longTerm: DevelopmentInsight[];
  summary: string;
} {
  // Separar insights por prioridade e prazo
  const shortTerm = insights.filter(insight => insight.priority === 'high');
  const mediumTerm = insights.filter(insight => insight.priority === 'medium');
  const longTerm = insights.filter(insight => insight.priority === 'low');

  // Gerar resumo personalizado
  const summary = `Plano de desenvolvimento com ${insights.length} áreas identificadas: ${shortTerm.length} prioridades altas, ${mediumTerm.length} médias e ${longTerm.length} de longo prazo.`;

  return {
    shortTerm,
    mediumTerm,
    longTerm,
    summary
  };
}
