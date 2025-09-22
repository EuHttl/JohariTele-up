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
    <div className="App">
      {/* Header fixo */}
      <header className="header-fixed">
        <div className="header-container">
          {/* Logo e título */}
          <div className="header-logo">
            <div style={{ position: 'relative' }}>
              <div style={{
                height: '40px',
                width: '40px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.4) 0%, rgba(147, 51, 234, 0.4) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(124, 58, 237, 0.3)'
              }}>
                <img 
                  src="/images/favicon/favicon-96x96.png" 
                  alt="TeleUp Logo" 
                  style={{ height: '24px', width: '24px', borderRadius: '6px' }}
                />
              </div>
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                height: '12px',
                width: '12px',
                background: 'linear-gradient(45deg, #a855f7, #ec4899)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
            </div>
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'white',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>Janela de Johari</h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#c084fc',
                margin: 0,
                fontWeight: '500'
              }}>Sistema de Avaliação Comportamental</p>
            </div>
          </div>

          {/* Navegação */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    color: active ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    background: active 
                      ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
                      : 'transparent',
                    border: active 
                      ? '1px solid rgba(124, 58, 237, 0.3)' 
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: active 
                      ? '0 2px 4px rgba(124, 58, 237, 0.2)' 
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon style={{ height: '16px', width: '16px' }} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Usuário e logout */}
          <div className="header-actions">
            <div className="header-user-info">
              <div className="header-user-avatar">
                <User style={{ height: '16px', width: '16px', color: 'white' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}>{user?.name}</p>
                <p style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#c084fc',
                  margin: 0
                }}>{user?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="header-logout-btn"
              title="Sair"
            >
              <LogOut style={{ height: '16px', width: '16px' }} />
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