import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔄 Tentando fazer login:', { email, password });

    try {
      // Login unificado - funciona para admin e participantes
      const response = await login(email, password);
      console.log('🎯 Login: Resposta recebida:', response);
      
      // Redirecionar baseado no role
      if (response.user.role === 'admin') {
        console.log('🎯 Login: Redirecionando para admin dashboard');
        navigate('/app/dashboard');
      } else {
        console.log('🎯 Login: Redirecionando para participant assessment');
        navigate('/participant/assessment');
      }
    } catch (err: any) {
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.error || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000000',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background com efeitos */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }}></div>

      {/* Container do Login */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.5),
          0 0 0 1px rgba(124, 58, 237, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1)
        `,
        border: '1px solid rgba(124, 58, 237, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Efeito de brilho no topo */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 50%, #7c3aed 100%)'
        }}></div>

        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              height: '80px',
              width: '80px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              transition: 'all 0.3s ease'
            }}>
              <img 
                src="/images/favicon/favicon-96x96.png" 
                alt="Janela de Johari Logo" 
                style={{ 
                  height: '48px', 
                  width: '48px',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              height: '16px',
              width: '16px',
              background: 'linear-gradient(45deg, #a855f7, #ec4899)',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
            }}></div>
          </div>
        </div>
        
        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Janela de Johari
          </h1>
          <p style={{
            color: '#c084fc',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Sistema de Avaliação Comportamental
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '0.75rem',
            marginTop: '0.5rem'
          }}>
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            {/* Campo Usuário */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#c084fc',
                marginBottom: '0.5rem'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <User style={{ height: '18px', width: '18px', color: '#8b5cf6' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    backgroundColor: 'rgba(55, 65, 81, 0.7)',
                    border: '2px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                    e.target.style.backgroundColor = 'rgba(55, 65, 81, 0.7)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#c084fc',
                marginBottom: '0.5rem'
              }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <Lock style={{ height: '18px', width: '18px', color: '#8b5cf6' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    backgroundColor: 'rgba(55, 65, 81, 0.7)',
                    border: '2px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    outline: 'none'
                  }}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#8b5cf6';
                    e.target.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                    e.target.style.backgroundColor = 'rgba(55, 65, 81, 0.7)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(153, 27, 27, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <AlertCircle style={{ 
                height: '16px', 
                width: '16px', 
                color: '#fca5a5', 
                marginRight: '0.5rem',
                flexShrink: 0
              }} />
              <span style={{ color: '#fca5a5', fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading 
                ? 'rgba(124, 58, 237, 0.5)' 
                : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(124, 58, 237, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.4)';
              }
            }}
          >
            {loading ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }}></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Link para registro */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            Não tem uma conta?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#8b5cf6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Registre-se como admin
            </Link>
          </p>
        </div>

        {/* Efeitos de partículas */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            width: '4px',
            height: '4px',
            backgroundColor: '#a855f7',
            borderRadius: '50%',
            animation: 'pulse 3s infinite',
            opacity: 0.6
          }}></div>
          <div style={{
            position: 'absolute',
            top: '75%',
            right: '25%',
            width: '3px',
            height: '3px',
            backgroundColor: '#c084fc',
            borderRadius: '50%',
            animation: 'pulse 4s infinite',
            opacity: 0.4,
            animationDelay: '1s'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '33%',
            width: '2px',
            height: '2px',
            backgroundColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'pulse 5s infinite',
            opacity: 0.5,
            animationDelay: '2s'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default Login;