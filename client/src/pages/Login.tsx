import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Lock,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import '../styles/auth.css';

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

    try {
      const response = await login(email, password);

      if (response.user.role === 'admin') {
        navigate('/app/dashboard');
      } else {
        navigate('/participant/assessment');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <span className="auth-visual-badge">
              <Sparkles size={16} />
              Relações Transparentes
            </span>
            <h2 className="auth-visual-title">
              Autoconhecimento &amp; feedbacks que{' '}
              <span className="auth-visual-highlight">potencializam equipes</span>
            </h2>
            <p className="auth-visual-description">
              Conecte-se à plataforma para acompanhar avaliações, gerar insights e fortalecer
              as relações dentro da sua organização.
            </p>
            <ul className="auth-visual-list">
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <ShieldCheck size={16} />
                </span>
                Segurança e privacidade de ponta a ponta
              </li>
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <MessageCircle size={16} />
                </span>
                Feedback inteligente com apoio de IA
              </li>
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <Sparkles size={16} />
                </span>
                Experiência moderna e responsiva
              </li>
            </ul>
          </div>
          <div className="auth-visual-figure">
            <img
              className="auth-visual-image"
              src="/images/illustrations/auth-hero.svg"
              alt="Ilustração de avaliação comportamental"
            />
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-content">
            <div className="auth-badge">
              <Sparkles size={16} />
              Acesso Administrativo
            </div>

            <header className="auth-header">
              <h1 className="auth-title">Bem-vindo de volta</h1>
              <p className="auth-subtitle">
                Utilize seus dados para entrar na Janela de Johari e conduzir avaliações,
                participantes e relatórios de maneira simples e encantadora.
              </p>
            </header>

            {error && (
              <div className="auth-error">
                <AlertCircle size={18} className="auth-error-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="email" className="auth-label">
                  Email
                </label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="auth-input"
                    placeholder="Digite seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="password" className="auth-label">
                  Senha
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="auth-input"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="auth-divider" />

            <p className="auth-footer">
              Não possui acesso?{' '}
              <Link to="/register" className="auth-link">
                Crie uma conta de administrador
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;