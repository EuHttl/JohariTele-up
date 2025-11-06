import React from 'react';
import { LucideIcon } from 'lucide-react';
import '../styles/design-system.css';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  type?: 'default' | 'info' | 'warning';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  type = 'default'
}) => {
  const getIconColor = () => {
    switch (type) {
      case 'info':
        return 'var(--color-info)';
      case 'warning':
        return 'var(--color-warning)';
      default:
        return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="empty-state">
      {Icon && (
        <Icon className="empty-state-icon" style={{ color: getIconColor() }} />
      )}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

