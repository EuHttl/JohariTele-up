import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const ParticipantLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/participant/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
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
                border: '1px solid rgba(124, 58, 237, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <img 
                  src="/images/logo-johari.svg" 
                  alt="Janela de Johari Logo" 
                  style={{ 
                    height: '32px', 
                    width: '32px', 
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
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
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'white',
                margin: 0,
                letterSpacing: '-0.025em'
              }}>Portal do Participante</h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#c084fc',
                margin: 0,
                fontWeight: '500'
              }}>Janela de Johari</p>
            </div>
          </div>
          
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
                }}>{user?.email}</p>
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
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#000000',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'relative',
          zIndex: 1
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ParticipantLayout;