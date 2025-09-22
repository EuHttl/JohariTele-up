import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'participant';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute: Verificando acesso');
  console.log('🛡️ ProtectedRoute: Loading:', loading);
  console.log('🛡️ ProtectedRoute: User:', user);
  console.log('🛡️ ProtectedRoute: Required role:', requiredRole);
  console.log('🛡️ ProtectedRoute: Token no localStorage:', localStorage.getItem('authToken') ? 'SIM' : 'NÃO');

  if (loading) {
    console.log('🛡️ ProtectedRoute: Ainda carregando...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    console.log('🛡️ ProtectedRoute: Usuário não autenticado, redirecionando...');
    // Sempre redirecionar para /login (rota unificada)
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem o role correto
  if (requiredRole && user.role !== requiredRole) {
    console.log('🛡️ ProtectedRoute: Role incorreto, redirecionando...');
    // Se o usuário é admin mas tentou acessar rota de participante, redirecionar para admin
    if (user.role === 'admin' && requiredRole === 'participant') {
      return <Navigate to="/app/dashboard" replace />;
    }
    // Se o usuário é participante mas tentou acessar rota de admin, redirecionar para participante
    if (user.role === 'participant' && requiredRole === 'admin') {
      return <Navigate to="/participant/assessment" replace />;
    }
    // Role não autorizado
    return <Navigate to="/login" replace />;
  }

  console.log('🛡️ ProtectedRoute: Acesso autorizado!');
  return <>{children}</>;
};

export default ProtectedRoute;
