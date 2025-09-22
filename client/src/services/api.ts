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
  
  // Fallback para produção (URL do Railway)
  const prodUrl = 'https://joharitele-up-production.up.railway.app/api';
  console.log('🌐 Using production URL:', prodUrl);
  return prodUrl;
};

const API_BASE_URL = getApiBaseUrl();
console.log('🌐 Final API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
  withCredentials: false, // Desabilitar credentials para evitar problemas de CORS
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
      const response = await api.post(`${API_BASE_URL}/auth/login`, { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  participantLogin: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${API_BASE_URL}/auth/participant/login`, { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  verify: async (token: string) => {
    const response = await api.post(`${API_BASE_URL}/auth/verify`, { token });
    return response.data;
  },
};

// Participants API
export const participantsAPI = {
  getAll: async (): Promise<Participant[]> => {
    const response = await api.get(`${API_BASE_URL}/participants`);
    return response.data;
  },
  
  getByCode: async (code: string): Promise<Participant> => {
    const response = await api.get(`${API_BASE_URL}/participants/${code}`);
    return response.data;
  },
  
  create: async (name: string, email: string): Promise<Participant> => {
    const response = await api.post(`${API_BASE_URL}/participants`, { name, email });
    return response.data;
  },
  
  update: async (id: number, name: string, email: string) => {
    const response = await api.put(`${API_BASE_URL}/participants/${id}`, { name, email });
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`${API_BASE_URL}/participants/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get(`${API_BASE_URL}/participants/stats/overview`);
    return response.data;
  },
};

// Assessments API
export const assessmentsAPI = {
  getCharacteristics: async (): Promise<Characteristic[]> => {
    const response = await api.get(`${API_BASE_URL}/assessments/characteristics`);
    return response.data;
  },
  
  getSelfAssessment: async (code: string): Promise<SelfAssessment[]> => {
    const response = await api.get(`${API_BASE_URL}/assessments/self/${code}`);
    return response.data;
  },
  
  saveSelfAssessment: async (code: string, assessments: Assessment[]) => {
    const response = await api.post(`${API_BASE_URL}/assessments/self/${code}`, { assessments });
    return response.data;
  },
  
  getPeers: async (code: string): Promise<Participant[]> => {
    const response = await api.get(`${API_BASE_URL}/assessments/peers/${code}`);
    return response.data;
  },
  
  getPeerAssessment: async (assessorCode: string, assessedCode: string): Promise<PeerAssessment[]> => {
    const response = await api.get(`${API_BASE_URL}/assessments/peer/${assessorCode}/${assessedCode}`);
    return response.data;
  },
  
  savePeerAssessment: async (assessorCode: string, assessedCode: string, assessments: Assessment[]) => {
    const response = await api.post(`${API_BASE_URL}/assessments/peer/${assessorCode}/${assessedCode}`, { assessments });
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getJohariReport: async (code: string): Promise<JohariReport> => {
    const response = await api.get(`${API_BASE_URL}/reports/johari/${code}`);
    return response.data;
  },
  
  getComparativeReport: async (): Promise<ComparativeReport> => {
    const response = await api.get(`${API_BASE_URL}/reports/comparative`);
    return response.data;
  },
  
  getCharacteristicAnalysis: async (): Promise<CharacteristicAnalysis> => {
    const response = await api.get(`${API_BASE_URL}/reports/characteristics`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAssessmentTracking: async () => {
    const response = await api.get(`${API_BASE_URL}/admin/assessment-tracking`);
    return response.data;
  },
  
  getAssessmentMatrix: async () => {
    const response = await api.get(`${API_BASE_URL}/admin/assessment-matrix`);
    return response.data;
  },
  
  getParticipantProgress: async () => {
    const response = await api.get(`${API_BASE_URL}/admin/participant-progress`);
    return response.data;
  }
};

export default api;
