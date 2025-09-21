import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  participantLogin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext: Inicializando autenticação...');
      const storedToken = localStorage.getItem('authToken');
      console.log('🔐 AuthContext: Token armazenado:', storedToken ? 'SIM' : 'NÃO');
      
      if (storedToken) {
        try {
          console.log('🔐 AuthContext: Verificando token...');
          const response = await authAPI.verify(storedToken);
          if (response.valid) {
            console.log('🔐 AuthContext: Token válido, definindo usuário:', response.user);
            setUser(response.user);
            setToken(storedToken);
          } else {
            console.log('🔐 AuthContext: Token inválido, removendo...');
            localStorage.removeItem('authToken');
            setToken(null);
          }
        } catch (error) {
          console.error('🔐 AuthContext: Erro ao verificar token:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      } else {
        console.log('🔐 AuthContext: Nenhum token armazenado');
      }
      
      console.log('🔐 AuthContext: Finalizando inicialização...');
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login do admin');
      console.log('🔐 AuthContext: Estado atual do usuário:', user);
      console.log('🔐 AuthContext: Chamando authAPI.login...');
      const response = await authAPI.login(email, password);
      console.log('🔐 AuthContext: Resposta recebida:', response);
      
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      console.log('🔐 AuthContext: Login concluído com sucesso');
      console.log('🔐 AuthContext: Novo estado do usuário:', response.user);
    } catch (error) {
      console.error('❌ AuthContext: Erro no login do admin:', error);
      throw error;
    }
  };

  const participantLogin = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Login participante iniciado');
      const response = await authAPI.participantLogin(email, password);
      console.log('🔐 AuthContext: Login participante bem-sucedido');
      
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('❌ AuthContext: Erro no login participante:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    participantLogin,
    logout,
    loading,
  };
  
  // Debug do estado do contexto
  console.log('🔐 AuthContext: Estado atual:', { user, token: token ? 'SIM' : 'NÃO', loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
