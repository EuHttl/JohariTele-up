/**
 * Serviço para geração de insights usando IA (OpenAI GPT)
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

class AIInsightsService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    this.model = OPENAI_MODEL;
    this.isAvailable = !!this.apiKey;
  }

  /**
   * Gera insights baseados em avaliação 360 graus
   */
  async generate360Insights(evaluationData) {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.build360InsightsPrompt(evaluationData);
    return await this.callOpenAI(prompt);
  }

  /**
   * Gera insights baseados em competências
   */
  async generateCompetencyInsights(competencyRatings, participantName) {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildCompetencyInsightsPrompt(competencyRatings, participantName);
    return await this.callOpenAI(prompt);
  }

  /**
   * Gera plano de desenvolvimento pessoal
   */
  async generateDevelopmentPlan(strengths, improvements, goals) {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildDevelopmentPlanPrompt(strengths, improvements, goals);
    return await this.callOpenAI(prompt);
  }

  /**
   * Analisa feedback qualitativo e gera insights
   */
  async analyzeFeedbackComments(comments) {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildFeedbackAnalysisPrompt(comments);
    return await this.callOpenAI(prompt);
  }

  /**
   * Gera recomendações de ações específicas
   */
  async generateActionRecommendations(insights, participantContext) {
    if (!this.isAvailable) {
      throw new Error('OpenAI API key não configurada');
    }

    const prompt = this.buildRecommendationsPrompt(insights, participantContext);
    return await this.callOpenAI(prompt);
  }

  /**
   * Analisa sentimento de feedback
   */
  async analyzeSentiment(text) {
    if (!this.isAvailable) {
      // Fallback: análise simples baseada em palavras-chave
      return this.simpleSentimentAnalysis(text);
    }

    const prompt = `Analise o sentimento do seguinte feedback e retorne apenas um JSON com:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": 0.0 a 1.0,
  "emotions": ["emotion1", "emotion2"],
  "summary": "resumo breve"
}

Feedback: "${text}"`;

    try {
      const response = await this.callOpenAI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Erro ao analisar sentimento:', error);
      return this.simpleSentimentAnalysis(text);
    }
  }

  /**
   * Constrói prompt para insights 360
   */
  build360InsightsPrompt(evaluationData) {
    const { participantName, selfRatings, othersRatings, comments } = evaluationData;
    
    return `Você é um especialista em desenvolvimento profissional e análise de feedback 360 graus.

Analise os seguintes dados de avaliação 360 graus e forneça insights valiosos:

Participante: ${participantName}

Autoavaliação:
${JSON.stringify(selfRatings, null, 2)}

Avaliações dos Outros:
${JSON.stringify(othersRatings, null, 2)}

Comentários Recebidos:
${comments.join('\n\n')}

Forneça uma análise em formato JSON com:
1. "strengths": Array de pontos fortes identificados
2. "improvements": Array de áreas de melhoria
3. "gaps": Array de gaps entre autoavaliação e avaliação dos outros
4. "recommendations": Array de recomendações específicas de desenvolvimento
5. "summary": Resumo geral da avaliação

Seja específico, construtivo e acionável nas recomendações.`;
  }

  /**
   * Constrói prompt para insights de competências
   */
  buildCompetencyInsightsPrompt(competencyRatings, participantName) {
    const ratingsText = competencyRatings.map(r => 
      `- ${r.competency}: ${r.rating}/5${r.comment ? ` (${r.comment})` : ''}`
    ).join('\n');

    return `Você é um especialista em desenvolvimento de competências profissionais.

Analise as seguintes avaliações de competências e forneça insights:

Participante: ${participantName}

Avaliações:
${ratingsText}

Forneça uma análise em formato JSON com:
1. "top_strengths": Array das 3 principais competências (com explicação)
2. "development_areas": Array das 3 principais áreas de desenvolvimento (com explicação)
3. "competency_profile": Descrição do perfil de competências geral
4. "development_priorities": Array de prioridades de desenvolvimento com ações específicas
5. "training_suggestions": Array de sugestões de treinamento/cursos

Seja específico e prático nas recomendações.`;
  }

  /**
   * Constrói prompt para plano de desenvolvimento
   */
  buildDevelopmentPlanPrompt(strengths, improvements, goals) {
    return `Crie um plano de desenvolvimento profissional personalizado.

Pontos Fortes:
${strengths.join('\n')}

Áreas de Melhoria:
${improvements.join('\n')}

Objetivos do Participante:
${goals.join('\n')}

Forneça um plano em formato JSON com:
1. "vision": Visão geral do desenvolvimento
2. "short_term_goals": Array de objetivos de curto prazo (1-3 meses)
3. "medium_term_goals": Array de objetivos de médio prazo (3-6 meses)
4. "long_term_goals": Array de objetivos de longo prazo (6-12 meses)
5. "action_items": Array de ações específicas para cada objetivo
6. "resources": Array de recursos sugeridos (livros, cursos, mentorias)
7. "milestones": Array de marcos de progresso

Seja específico, realista e motivador.`;
  }

  /**
   * Constrói prompt para análise de feedback
   */
  buildFeedbackAnalysisPrompt(comments) {
    return `Analise os seguintes feedbacks qualitativos e identifique:

1. Padrões temáticos recorrentes
2. Sentimentos predominantes
3. Tópicos mais mencionados
4. Sugestões implícitas ou explícitas

Feedbacks:
${comments.join('\n\n---\n\n')}

Forneça uma análise em formato JSON com:
1. "themes": Array de temas identificados com frequência
2. "sentiment_analysis": Análise de sentimento geral
3. "key_points": Array de pontos-chave mencionados
4. "suggestions": Array de sugestões identificadas
5. "summary": Resumo geral da análise

Seja objetivo e focado em insights acionáveis.`;
  }

  /**
   * Constrói prompt para recomendações
   */
  buildRecommendationsPrompt(insights, participantContext) {
    return `Com base nos seguintes insights e contexto do participante, forneça recomendações específicas e acionáveis:

Insights:
${JSON.stringify(insights, null, 2)}

Contexto do Participante:
${JSON.stringify(participantContext, null, 2)}

Forneça recomendações em formato JSON com:
1. "immediate_actions": Array de ações imediatas (próximas 2 semanas)
2. "short_term_actions": Array de ações de curto prazo (próximo mês)
3. "long_term_actions": Array de ações de longo prazo (próximos 3 meses)
4. "resources_needed": Array de recursos necessários
5. "success_metrics": Array de métricas de sucesso

Cada ação deve ter: título, descrição, prazo estimado, dificuldade, impacto esperado.`;
  }

  /**
   * Chama a API do OpenAI
   */
  async callOpenAI(prompt) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    try {
      const fetch = require('node-fetch');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em desenvolvimento profissional e análise de feedback. Sempre retorne respostas em formato JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Tentar extrair JSON da resposta
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return { content, raw: true };
      } catch (parseError) {
        return { content, raw: true };
      }
    } catch (error) {
      console.error('Erro ao chamar OpenAI API:', error);
      throw error;
    }
  }

  /**
   * Análise simples de sentimento (fallback)
   */
  simpleSentimentAnalysis(text) {
    const positiveWords = ['excelente', 'ótimo', 'bom', 'parabéns', 'destacou', 'superou', 'eficiente', 'competente'];
    const negativeWords = ['ruim', 'precisa melhorar', 'falta', 'deficiente', 'problema', 'dificuldade', 'insuficiente'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: 0.7, emotions: ['satisfaction'], summary: 'Feedback positivo' };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: 0.3, emotions: ['concern'], summary: 'Feedback negativo' };
    }
    
    return { sentiment: 'neutral', score: 0.5, emotions: [], summary: 'Feedback neutro' };
  }
}

module.exports = new AIInsightsService();

