import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  User,
  Settings
} from 'lucide-react';
import '../styles/layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Participantes', href: '/app/participants', icon: Users },
    { name: 'Relatórios', href: '/app/reports', icon: BarChart3 },
    { name: 'Admin', href: '/app/admin', icon: Settings },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app">
      {/* Header fixo */}
      <header className="header-fixed">
        <div className="header-container">
          {/* Logo e título */}
          <div className="header-logo">
            <div className="header-logo-text">
              <h1>Janela de Johari</h1>
              <p>Sistema de Avaliação Comportamental</p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="header-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`header-nav-link ${active ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Usuário e logout */}
          <div className="header-actions">
            <div className="header-user-info">
              <div className="header-user-avatar">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="header-user-details">
                <p className="header-user-name">{user?.name}</p>
                <p className="header-user-role">{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="header-logout-btn"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="main-content">
        <div className="main-container">
          <div className="main-wrapper">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;