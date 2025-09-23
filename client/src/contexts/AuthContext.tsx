import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ token: string; user: User; message: string }>;
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
          console.log('🔐 AuthContext: Resposta da verificação:', response);
          
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
          console.error('🔐 AuthContext: Erro na verificação do token:', error);
          localStorage.removeItem('authToken');
          setToken(null);
        }
      }
      
      console.log('🔐 AuthContext: Finalizando inicialização, setando loading = false');
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthContext: Iniciando login...');
      const response = await authAPI.login(email, password);
      console.log('🔐 AuthContext: Login bem-sucedido, resposta:', response);
      
      localStorage.setItem('authToken', response.token);
      setToken(response.token);
      setUser(response.user);
      
      console.log('🔐 AuthContext: Estado atualizado - User:', response.user);
      return response; // Retornar a resposta para usar nos componentes
    } catch (error) {
      console.error('🔐 AuthContext: Erro no login:', error);
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
    logout,
    loading,
  };
  

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
