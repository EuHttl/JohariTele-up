# 🎓 **Apresentação para Professora - Sistema Janela de Johari**

## 📋 **Resumo Executivo**

Desenvolvi um **sistema completo de avaliação comportamental** baseado na teoria da Janela de Johari, combinando fundamentos psicológicos com tecnologia moderna. O projeto oferece uma ferramenta prática para desenvolvimento pessoal e de equipe, com aplicações tanto acadêmicas quanto empresariais.

---

## 🎯 **Objetivos do Projeto**

### **Primários:**
- ✅ Facilitar autoconhecimento através de feedback 360°
- ✅ Promover desenvolvimento de competências interpessoais
- ✅ Criar ferramenta educacional inovadora
- ✅ Demonstrar aplicação prática de conceitos psicológicos

### **Secundários:**
- ✅ Desenvolver competências técnicas (programação, design)
- ✅ Criar base para pesquisas acadêmicas
- ✅ Oferecer solução para dinâmicas de grupo
- ✅ Estabelecer fundamento para trabalhos futuros

---

## 🧠 **Fundamentação Teórica**

### **Janela de Johari (Joseph Luft & Harrington Ingham, 1955)**
A Janela de Johari é um modelo de comunicação e autoconhecimento que divide o "eu" em quatro quadrantes:

1. **Área Aberta**: Conhecida por mim e pelos outros
2. **Área Cega**: Conhecida pelos outros, mas não por mim
3. **Área Oculta**: Conhecida por mim, mas não pelos outros
4. **Área Desconhecida**: Desconhecida por todos

### **Aplicação no Sistema:**
- **67 características comportamentais** baseadas na literatura clássica
- **Avaliação quantitativa** de cada área
- **Scores de autoconhecimento** e percepção dos pares
- **Relatórios comparativos** entre participantes

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend (Interface do Usuário):**
- **React 19** com TypeScript
- **Tailwind CSS** para design responsivo
- **Recharts** para visualizações de dados
- **Context API** para gerenciamento de estado
- **Axios** para comunicação com API

### **Backend (Servidor):**
- **Node.js** com Express
- **PostgreSQL** para produção (Railway)
- **SQLite** para desenvolvimento local
- **JWT** para autenticação segura
- **bcryptjs** para criptografia de senhas

### **Infraestrutura:**
- **Railway** para hospedagem do backend
- **Vercel** para hospedagem do frontend
- **PostgreSQL** como banco de dados principal
- **SSL** para segurança das comunicações

---

## 🎮 **Funcionalidades Implementadas**

### **🔐 Sistema de Autenticação:**
- Login unificado para administradores e participantes
- Geração automática de códigos únicos
- Controle de acesso baseado em roles
- Sessões seguras com JWT

### **👥 Gestão de Participantes:**
- Cadastro de até 15 participantes por sessão
- Geração automática de códigos de acesso
- Controle de progresso individual
- Estatísticas em tempo real

### **📊 Sistema de Avaliação:**
- **Autoavaliação**: 67 características comportamentais
- **Avaliação entre Pares**: Feedback 360° completo
- **Interface intuitiva**: Design responsivo e acessível
- **Validação de dados**: Prevenção de envios incompletos

### **📈 Relatórios e Análises:**
- **Relatório Individual**: Análise detalhada da Janela de Johari
- **Relatório Comparativo**: Comparação entre participantes
- **Análise de Características**: Insights sobre padrões comportamentais
- **Dashboard Administrativo**: Controle e monitoramento

---

## 📊 **Métricas e Scores**

### **🎯 Self Awareness Score (Autoconhecimento):**
```
Fórmula: (Área Aberta ÷ 56 características) × 100

Interpretação:
• 80-100%: Excelente autoconhecimento
• 60-79%: Bom autoconhecimento  
• 40-59%: Regular autoconhecimento
• 0-39%: Baixo autoconhecimento
```

### **👥 Peer Perception Score (Percepção dos Pares):**
```
Fórmula: (Características observadas pelos outros ÷ 56) × 100

Aplicação:
• Mede transparência comportamental
• Identifica pontos cegos
• Avalia comunicação interpessoal
```

### **📈 Análise das 4 Áreas:**
- **Área Aberta**: Transparência e autoconfiança
- **Área Cega**: Oportunidades de feedback
- **Área Oculta**: Necessidade de abertura
- **Área Desconhecida**: Potencial não explorado

---

## 🎓 **Aplicações Educacionais**

### **📚 Disciplinas Relacionadas:**
- **Psicologia Organizacional**: Dinâmicas de grupo e liderança
- **Comportamento Humano**: Análise de padrões comportamentais
- **Tecnologia Educacional**: Efetividade de ferramentas digitais
- **Estatística Aplicada**: Análise de dados comportamentais
- **Gestão de Pessoas**: Desenvolvimento de competências

### **🔬 Possibilidades de Pesquisa:**
- **Efetividade da Janela de Johari**: Validação empírica da ferramenta
- **Impacto do Feedback 360°**: Desenvolvimento de competências
- **Diferenças Geracionais**: Padrões comportamentais por faixa etária
- **Cultura Organizacional**: Influência no autoconhecimento
- **Tecnologia vs. Métodos Tradicionais**: Comparação de efetividade

### **📖 Bases para Publicações:**
- **Artigos Científicos**: Metodologia e resultados
- **Cases de Estudo**: Implementação em organizações
- **Software Acadêmico**: Ferramenta para pesquisadores
- **Dissertações/Teses**: Base para trabalhos de pós-graduação

---

## 🚀 **Propostas de Melhoria**

### **🎯 Melhorias Pedagógicas:**

#### **1. Sistema de Metas e Desenvolvimento**
```javascript
interface PersonalGoal {
  id: string;
  participant_id: string;
  goal: string;
  target_score: number;
  current_score: number;
  deadline: Date;
  mentor: string;
}
```

#### **2. Análise Longitudinal**
- Comparação de scores ao longo do tempo
- Gráficos de evolução individual
- Benchmarking com médias do grupo
- Identificação de tendências comportamentais

#### **3. Sistema de Coaching Automatizado**
- Recomendações personalizadas baseadas nos resultados
- Planos de desenvolvimento individualizados
- Acompanhamento de progresso
- Alertas para check-ins periódicos

### **🔧 Melhorias Técnicas:**

#### **1. Inteligência Artificial**
```javascript
interface AIInsight {
  participant_id: string;
  insight_type: 'strength' | 'development_area' | 'blind_spot';
  description: string;
  confidence_score: number;
  recommendations: string[];
}
```

#### **2. Integração Acadêmica**
- **Exportação para SPSS**: Análise estatística avançada
- **API para pesquisas**: Integração com sistemas acadêmicos
- **Relatórios científicos**: Formatos para publicações
- **Base de dados anonimizada**: Para pesquisas longitudinais

#### **3. Funcionalidades Avançadas**
- **Gamificação**: Sistema de conquistas e badges
- **Análise de rede**: Mapeamento de relacionamentos
- **Predictive Analytics**: Predição de comportamentos
- **Machine Learning**: Padrões comportamentais

---

## 📈 **Valor Acadêmico e Científico**

### **🎯 Contribuições Teóricas:**
- **Validação empírica** da Janela de Johari em ambiente digital
- **Adaptação contemporânea** de ferramenta clássica
- **Integração tecnológica** com fundamentos psicológicos
- **Metodologia inovadora** para avaliação comportamental

### **🔬 Potencial de Pesquisa:**
- **Estudos longitudinais** sobre desenvolvimento pessoal
- **Análise comparativa** entre diferentes grupos
- **Validação estatística** de instrumentos psicológicos
- **Impacto da tecnologia** no autoconhecimento

### **📚 Aplicações Práticas:**
- **Ferramenta educacional** para disciplinas de comportamento
- **Base para coaching** e desenvolvimento pessoal
- **Instrumento de pesquisa** para acadêmicos
- **Solução empresarial** para RH e desenvolvimento

---

## 🎯 **Demonstração Prática**

### **📋 Roteiro da Apresentação (30 min):**

#### **1. Introdução Teórica (5 min)**
- Explicação da Janela de Johari
- Fundamentação psicológica
- Aplicação no contexto educacional

#### **2. Demonstração do Sistema (15 min)**
- Login como administrador
- Criação de participantes
- Processo de autoavaliação
- Avaliação entre pares
- Geração de relatórios

#### **3. Análise dos Resultados (7 min)**
- Interpretação dos scores
- Insights comportamentais
- Aplicações práticas

#### **4. Propostas de Melhoria (3 min)**
- Melhorias pedagógicas
- Funcionalidades técnicas
- Possibilidades de pesquisa

---

## 🎓 **Integração com Objetivos Acadêmicos**

### **📚 Competências Desenvolvidas:**
- **Pesquisa Científica**: Metodologia e análise de dados
- **Tecnologia Educacional**: Desenvolvimento de ferramentas
- **Psicologia Aplicada**: Implementação de teorias
- **Gestão de Projetos**: Planejamento e execução
- **Comunicação Científica**: Apresentação de resultados

### **🔬 Possibilidades de Expansão:**
- **Projeto de Iniciação Científica**: Validação da ferramenta
- **Trabalho de Conclusão de Curso**: Desenvolvimento de funcionalidades
- **Dissertação de Mestrado**: Pesquisa sobre efetividade
- **Tese de Doutorado**: Estudos longitudinais e validação

---

## 💡 **Propostas de Colaboração**

### **🎯 Para a Professora:**
- **Supervisão acadêmica** do projeto
- **Orientação metodológica** para pesquisas
- **Validação científica** dos resultados
- **Apoio para publicações** acadêmicas

### **🔬 Para a Instituição:**
- **Ferramenta educacional** para disciplinas
- **Base para pesquisas** institucionais
- **Diferencial competitivo** acadêmico
- **Parcerias** com outras universidades

### **🌐 Para a Comunidade Científica:**
- **Software open-source** para pesquisadores
- **Base de dados** para estudos comparativos
- **Metodologia** replicável em outras instituições
- **Publicações** em periódicos especializados

---

## 📊 **Métricas de Sucesso**

### **🎯 Técnicas:**
- ✅ Sistema funcionando 100% do tempo
- ✅ Interface responsiva e acessível
- ✅ Dados seguros e confiáveis
- ✅ Performance otimizada

### **🎓 Acadêmicas:**
- ✅ Validação da metodologia
- ✅ Aplicação em contexto real
- ✅ Base para pesquisas futuras
- ✅ Contribuição científica

### **👥 Sociais:**
- ✅ Facilitar autoconhecimento
- ✅ Promover desenvolvimento pessoal
- ✅ Melhorar relacionamentos
- ✅ Criar impacto positivo

---

## 🎉 **Conclusão**

Este projeto representa a **interseção entre tecnologia e psicologia**, oferecendo uma ferramenta moderna para um conceito clássico. Além de demonstrar competências técnicas, ele proporciona uma base sólida para:

- **Pesquisas acadêmicas** sobre comportamento humano
- **Desenvolvimento de competências** interpessoais
- **Aplicação prática** de teorias psicológicas
- **Inovação educacional** através da tecnologia

### **🎯 Próximos Passos Sugeridos:**
1. **Demonstração completa** do sistema
2. **Discussão sobre melhorias** e aplicações
3. **Planejamento de pesquisa** baseada na ferramenta
4. **Definição de colaboração** acadêmica
5. **Estruturação de projeto** de longo prazo

---

## 📞 **Contato e Informações**

**Desenvolvedor**: Hyttalo Costa  
**Email**: hyttalo2002@gmail.com
**Sistema**: https://johari-tele-up.vercel.app  
**Código**: Disponível para revisão acadêmica  
**Documentação**: Completa e detalhada

---

> **"Este projeto não é apenas uma demonstração técnica, mas uma ferramenta real que pode contribuir para o desenvolvimento humano e a pesquisa científica. Estou ansioso para discutir como podemos expandir seu potencial acadêmico e social."**
