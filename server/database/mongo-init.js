const mongoose = require('mongoose');

// Características da Janela de Johari (56 características clássicas)
const johariCharacteristics = [
  'Aceita as pessoas como elas são',
  'Acessível',
  'Adaptável',
  'Afável',
  'Alegre',
  'Ama ser elogiado',
  'Amigável',
  'Apaixonado',
  'Articulado',
  'Atento',
  'Audacioso',
  'Autoconsciente',
  'Bem-humorado',
  'Calmo',
  'Capaz',
  'Carinhoso',
  'Comandante',
  'Compassivo',
  'Competente',
  'Confiável',
  'Consciente',
  'Contemplativo',
  'Controlador',
  'Corajoso',
  'Criativo',
  'Defensivo',
  'Digno de confiança',
  'Direto',
  'Disciplinado',
  'Disposto',
  'Empático',
  'Energético',
  'Extrovertido',
  'Flexível',
  'Gentil',
  'Hábil',
  'Honesto',
  'Idealista',
  'Imaginativo',
  'Independente',
  'Ingênuo',
  'Inspirador',
  'Inteligente',
  'Introspectivo',
  'Introvertido',
  'Líder',
  'Lógico',
  'Lovável',
  'Maturidade',
  'Modesto',
  'Observador',
  'Organizado',
  'Paciente',
  'Poderoso',
  'Pontual',
  'Prudente',
  'Quieto',
  'Reflexivo',
  'Responsável',
  'Seguro de si',
  'Sensível',
  'Sincero',
  'Sorridente',
  'Tímido',
  'Útil',
  'Vigoroso'
];

// Schemas Mongoose
const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const ParticipantSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  has_completed_self_assessment: {
    type: Boolean,
    default: false
  },
  has_completed_peer_assessments: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índices compostos para garantir unicidade por admin
ParticipantSchema.index({ admin_id: 1, email: 1 }, { unique: true });
ParticipantSchema.index({ admin_id: 1, code: 1 }, { unique: true });

const CharacteristicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const SelfAssessmentSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    index: true
  },
  characteristic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Characteristic',
    required: true
  },
  selected: {
    type: Boolean,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índice único para garantir uma avaliação por participante/característica
SelfAssessmentSchema.index({ participant_id: 1, characteristic_id: 1 }, { unique: true });

const PeerAssessmentSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  assessor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    index: true
  },
  assessed_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    index: true
  },
  characteristic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Characteristic',
    required: true
  },
  selected: {
    type: Boolean,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Índice único para garantir uma avaliação por assessor/avaliado/característica
PeerAssessmentSchema.index({ assessor_id: 1, assessed_id: 1, characteristic_id: 1 }, { unique: true });

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['free', 'professional', 'enterprise']
  },
  price_monthly: {
    type: Number,
    default: 0
  },
  price_yearly: {
    type: Number,
    default: 0
  },
  max_participants: {
    type: Number,
    required: true
  },
  max_assessments_per_month: {
    type: Number,
    required: true
  },
  features: {
    type: [String],
    default: []
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const SubscriptionSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  plan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'cancelled', 'expired', 'trial'],
    default: 'trial'
  },
  billing_cycle: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  started_at: {
    type: Date,
    required: true,
    default: Date.now
  },
  expires_at: {
    type: Date
  },
  cancelled_at: {
    type: Date
  },
  stripe_subscription_id: {
    type: String
  },
  stripe_customer_id: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const UsageTrackingSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  subscription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  month_year: {
    type: String,
    required: true
  },
  participants_created: {
    type: Number,
    default: 0
  },
  assessments_completed: {
    type: Number,
    default: 0
  },
  reports_generated: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Índice único para garantir um registro por admin/mês
UsageTrackingSchema.index({ admin_id: 1, month_year: 1 }, { unique: true });

// Modelos
const Admin = mongoose.model('Admin', AdminSchema);
const Participant = mongoose.model('Participant', ParticipantSchema);
const Characteristic = mongoose.model('Characteristic', CharacteristicSchema);
const SelfAssessment = mongoose.model('SelfAssessment', SelfAssessmentSchema);
const PeerAssessment = mongoose.model('PeerAssessment', PeerAssessmentSchema);
const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const UsageTracking = mongoose.model('UsageTracking', UsageTrackingSchema);

let isConnected = false;
let connectionPromise = null;

// Função para garantir conexão
async function ensureConnection() {
  // Se já está conectado, retornar
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  
  // Se já existe uma promise de conexão em andamento, aguardar ela
  if (connectionPromise) {
    await connectionPromise;
    return;
  }
  
  // Criar nova conexão
  const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!mongoUri) {
    throw new Error('MONGODB_URI ou DATABASE_URL não configurado');
  }
  
  connectionPromise = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 30000, // 30 segundos
    socketTimeoutMS: 45000,
  });
  
  try {
    await connectionPromise;
    isConnected = true;
    console.log('✅ Conectado ao MongoDB com sucesso');
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

async function initializeDatabase() {
  console.log('🗄️  Inicializando banco MongoDB...');
  
  try {
    // Garantir conexão antes de qualquer operação
    await ensureConnection();
    
    // Aguardar um pouco para garantir que a conexão está estável
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Conexão com MongoDB não estabelecida');
    }
    
    // Verificar se existe administrador
    const adminCount = await Admin.countDocuments();
    console.log(`📊 Total de administradores: ${adminCount}`);
    
    if (adminCount === 0) {
      console.log('➕ Criando administrador padrão...');
      
      const bcrypt = require('bcryptjs');
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      
      await Admin.create({
        username: 'admin',
        email: 'hyttalo2002@gmail.com',
        password: defaultPassword,
        name: 'Hyttalo Costa'
      });
      
      console.log('✅ Administrador padrão criado!');
      console.log('👤 Email: hyttalo2002@gmail.com');
      console.log('🔑 Senha: admin123');
    } else {
      console.log('ℹ️ Administrador já existe no banco');
    }
    
    // Inserir características se não existirem
    const characteristicsCount = await Characteristic.countDocuments();
    console.log(`📊 Total de características: ${characteristicsCount}`);
    
    if (characteristicsCount === 0) {
      console.log('➕ Inserindo características...');
      
      const characteristicsData = johariCharacteristics.map(name => ({ name }));
      await Characteristic.insertMany(characteristicsData);
      
      console.log('✅ Características inseridas com sucesso!');
    }
    
    // Inserir planos de assinatura se não existirem
    const plansCount = await SubscriptionPlan.countDocuments();
    console.log(`📊 Total de planos: ${plansCount}`);
    
    if (plansCount === 0) {
      console.log('➕ Inserindo planos de assinatura...');
      
      const plans = [
        {
          name: 'Gratuito',
          type: 'free',
          price_monthly: 0,
          price_yearly: 0,
          max_participants: 5,
          max_assessments_per_month: 1,
          features: [
            'Até 5 participantes',
            '1 avaliação por mês',
            'Relatórios básicos',
            'Suporte por email'
          ]
        },
        {
          name: 'Profissional',
          type: 'professional',
          price_monthly: 97,
          price_yearly: 970,
          max_participants: 25,
          max_assessments_per_month: -1,
          features: [
            'Até 25 participantes',
            'Avaliações ilimitadas',
            'Relatórios completos',
            'Exportação PDF/Excel',
            'Notificações automáticas',
            'Suporte prioritário'
          ]
        },
        {
          name: 'Empresarial',
          type: 'enterprise',
          price_monthly: 197,
          price_yearly: 1970,
          max_participants: -1,
          max_assessments_per_month: -1,
          features: [
            'Participantes ilimitados',
            'Avaliações ilimitadas',
            'Relatórios premium',
            'Análise de equipe',
            'API de integração',
            'White-label',
            'Suporte 24/7'
          ]
        }
      ];
      
      await SubscriptionPlan.insertMany(plans);
      
      console.log('✅ Planos de assinatura inseridos com sucesso!');
    }
    
    console.log('✅ Banco MongoDB inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco MongoDB:', error);
    throw error;
  }
}


// Wrapper para compatibilidade com código existente
const db = {
  // Métodos que não são mais necessários, mas mantidos para compatibilidade
  query: async (text, params) => {
    throw new Error('Use os modelos Mongoose diretamente');
  },
  get: async (modelName, query) => {
    await ensureConnection();
    const Model = getModel(modelName);
    return await Model.findOne(query);
  },
  all: async (modelName, query) => {
    await ensureConnection();
    const Model = getModel(modelName);
    return await Model.find(query || {});
  },
  run: async (modelName, data) => {
    await ensureConnection();
    const Model = getModel(modelName);
    if (data._id) {
      return await Model.findByIdAndUpdate(data._id, data, { new: true });
    }
    const doc = await Model.create(data);
    return { lastID: doc._id.toString(), changes: 1 };
  },
  exec: async () => {
    // Não necessário no MongoDB
    return { changes: 1 };
  }
};

function getModel(name) {
  const models = {
    'admins': Admin,
    'participants': Participant,
    'characteristics': Characteristic,
    'self_assessments': SelfAssessment,
    'peer_assessments': PeerAssessment,
    'subscription_plans': SubscriptionPlan,
    'subscriptions': Subscription,
    'usage_tracking': UsageTracking
  };
  return models[name.toLowerCase()];
}

module.exports = {
  db,
  initializeDatabase,
  ensureConnection,
  models: {
    Admin,
    Participant,
    Characteristic,
    SelfAssessment,
    PeerAssessment,
    SubscriptionPlan,
    Subscription,
    UsageTracking
  },
  mongoose
};

