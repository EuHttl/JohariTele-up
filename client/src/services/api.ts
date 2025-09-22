import axios from 'axios';
import { 
  Participant, 
  Characteristic, 
  Assessment, 
  SelfAssessment, 
  PeerAssessment,
  JohariReport,
  ComparativeReport,
  CharacteristicAnalysis,
  AuthResponse
} from '../types';

// Configuração da URL base da API
const getApiBaseUrl = () => {
  // Verificar se a variável de ambiente está definida (prioridade para produção)
  const envApiUrl = process.env.REACT_APP_API_URL;
  
  if (envApiUrl) {
    console.log('🌐 Using REACT_APP_API_URL:', envApiUrl);
    return envApiUrl;
  }
  
  // Fallback para desenvolvimento local
  const localUrl = 'http://localhost:8080/api';
  console.log('🌐 Using local development URL:', localUrl);
  return localUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 Final API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
  withCredentials: false, // Desabilitar credentials para evitar problemas de CORS
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug para produção
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    hasToken: !!token
  });
  
  return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Debug para produção
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    // Debug para produção
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data
    });
    
    // Só redirecionar se for um erro 401 em uma requisição que não seja de login
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  verify: async (token: string) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },
};

// Participants API
export const participantsAPI = {
  getAll: async (): Promise<Participant[]> => {
    const response = await api.get('/participants');
    return response.data;
  },
  
  getByCode: async (code: string): Promise<Participant> => {
    const response = await api.get(`/participants/${code}`);
    return response.data;
  },
  
  create: async (name: string, email: string): Promise<Participant> => {
    const response = await api.post('/participants', { name, email });
    return response.data;
  },
  
  update: async (id: number, name: string, email: string) => {
    const response = await api.put(`/participants/${id}`, { name, email });
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/participants/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/participants/stats/overview');
    return response.data;
  },
};

// Assessments API
export const assessmentsAPI = {
  getCharacteristics: async (): Promise<Characteristic[]> => {
    const response = await api.get('/assessments/characteristics');
    return response.data;
  },
  
  getSelfAssessment: async (code: string): Promise<SelfAssessment[]> => {
    const response = await api.get(`/assessments/self/${code}`);
    return response.data;
  },
  
  saveSelfAssessment: async (code: string, assessments: Assessment[]) => {
    const response = await api.post(`/assessments/self/${code}`, { assessments });
    return response.data;
  },
  
  getPeers: async (code: string): Promise<Participant[]> => {
    const response = await api.get(`/assessments/peers/${code}`);
    return response.data;
  },
  
  getPeerAssessment: async (assessorCode: string, assessedCode: string): Promise<PeerAssessment[]> => {
    const response = await api.get(`/assessments/peer/${assessorCode}/${assessedCode}`);
    return response.data;
  },
  
  savePeerAssessment: async (assessorCode: string, assessedCode: string, assessments: Assessment[]) => {
    const response = await api.post(`/assessments/peer/${assessorCode}/${assessedCode}`, { assessments });
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getJohariReport: async (code: string): Promise<JohariReport> => {
    const response = await api.get(`/reports/johari/${code}`);
    return response.data;
  },
  
  getComparativeReport: async (): Promise<ComparativeReport> => {
    const response = await api.get('/reports/comparative');
    return response.data;
  },
  
  getCharacteristicAnalysis: async (): Promise<CharacteristicAnalysis> => {
    const response = await api.get('/reports/characteristics');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAssessmentTracking: async () => {
    const response = await api.get('/admin/assessment-tracking');
    return response.data;
  },
  
  getAssessmentMatrix: async () => {
    const response = await api.get('/admin/assessment-matrix');
    return response.data;
  },
  
  getParticipantProgress: async () => {
    const response = await api.get('/admin/participant-progress');
    return response.data;
  }
};

export default api;
