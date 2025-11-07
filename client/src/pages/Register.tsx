import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Layers,
  Target,
} from 'lucide-react';
import heroIllustration from '../assets/illustrations/auth-hero.svg';
import '../styles/auth.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register(name, email, password, confirmPassword);
      setSuccess(true);

      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);

      return response;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao registrar administrador');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-success-card">
          <div className="auth-success-icon">
            <CheckCircle size={36} />
          </div>
          <h2 className="auth-title">Conta criada com sucesso!</h2>
          <p className="auth-subtitle">
            Estamos preparando seu ambiente personalizado. Você será redirecionado em instantes.
          </p>
          <div className="auth-progress">
            <div className="auth-progress-bar" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <section className="auth-visual">
          <div className="auth-visual-content">
            <span className="auth-visual-badge">
              <Sparkles size={16} />
              Onboarding Administrador
            </span>
            <h2 className="auth-visual-title">
              Estruture feedbacks e{' '}
              <span className="auth-visual-highlight">lideranças conscientes</span>
            </h2>
            <p className="auth-visual-description">
              Crie sua conta para acompanhar a evolução do time, personalizar avaliações e
              transformar dados em estratégias de desenvolvimento.
            </p>
            <ul className="auth-visual-list">
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <Layers size={16} />
                </span>
                Múltiplos métodos de avaliação (360°, competências, objetivos)
              </li>
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <Target size={16} />
                </span>
                Insights inteligentes para planos de desenvolvimento
              </li>
              <li className="auth-visual-item">
                <span className="auth-visual-item-icon">
                  <Sparkles size={16} />
                </span>
                Interface intuitiva com animações suaves em tons de roxo
              </li>
            </ul>
          </div>
          <div className="auth-visual-figure">
            <img
              className="auth-visual-image"
              src={heroIllustration}
              alt="Ilustração de cadastro administrativo"
            />
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-content">
            <div className="auth-badge">
              <Sparkles size={16} />
              Criar Conta Admin
            </div>

            <header className="auth-header">
              <h1 className="auth-title">Comece sua jornada</h1>
              <p className="auth-subtitle">
                Cadastre-se para acessar a Janela de Johari e conduzir feedbacks poderosos com a sua equipe.
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
                <label htmlFor="name" className="auth-label">
                  Nome completo
                </label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="auth-input"
                    placeholder="Digite seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="email" className="auth-label">
                  Email corporativo
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="auth-input"
                    placeholder="nome@empresa.com"
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
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="confirmPassword" className="auth-label">
                  Confirmar senha
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="auth-input"
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta Admin'
                )}
              </button>
            </form>

            <div className="auth-divider" />

            <p className="auth-footer">
              Já possui acesso?{' '}
              <Link to="/login" className="auth-link">
                Faça login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
