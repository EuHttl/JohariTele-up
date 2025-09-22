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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header fixo */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
        height: '70px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo e título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                height: '32px',
                width: '32px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
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
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                backdropFilter: 'blur(10px)',
                padding: '0.5rem',
                color: 'white',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Sair"
            >
              <LogOut style={{ height: '16px', width: '16px' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main style={{ 
        paddingTop: '70px', // Espaço para o header fixo
        minHeight: '100vh'
      }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            padding: '0 1.5rem'
          }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;