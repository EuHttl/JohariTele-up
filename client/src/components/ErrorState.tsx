import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/design-system.css';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  type?: 'error' | 'warning' | 'info';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ops! Algo deu errado',
  message = 'Não foi possível carregar os dados. Por favor, tente novamente.',
  onRetry,
  showHomeButton = false,
  type = 'error'
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'var(--color-warning)';
      case 'info':
        return 'var(--color-info)';
      default:
        return 'var(--color-error)';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'var(--color-warning-light)';
      case 'info':
        return 'var(--color-info-light)';
      default:
        return 'var(--color-error-light)';
    }
  };

  return (
    <div className="empty-state" style={{ padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto var(--space-6)',
        borderRadius: '50%',
        background: getBackgroundColor(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: getIconColor()
      }}>
        <AlertCircle className="w-10 h-10" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{message}</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap', marginTop: 'var(--space-6)' }}>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        )}
        {showHomeButton && (
          <Link to="/app/dashboard" className="btn btn-secondary">
            <Home className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

