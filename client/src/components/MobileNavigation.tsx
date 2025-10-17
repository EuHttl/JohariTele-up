import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  User,
  LogOut
} from 'lucide-react';
import '../styles/mobile-navigation.css';

interface MobileNavigationProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/app', label: 'Dashboard', icon: Home },
    { path: '/app/participants', label: 'Participantes', icon: Users },
    { path: '/app/reports', label: 'Relatórios', icon: FileText },
    { path: '/app/assessment', label: 'Avaliação', icon: BarChart3 },
    { path: '/app/settings', label: 'Configurações', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu */}
      <nav className={`mobile-menu ${isOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-logo">
            <User className="w-8 h-8 text-purple-600" />
            <span className="mobile-menu-title">Janela de Johari</span>
          </div>
        </div>

        <div className="mobile-menu-content">
          <ul className="mobile-menu-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="mobile-menu-item">
                  <Link
                    to={item.path}
                    className={`mobile-menu-link ${isActive(item.path) ? 'mobile-menu-link-active' : ''}`}
                    onClick={handleLinkClick}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mobile-menu-footer">
            <button
              className="mobile-menu-logout"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNavigation;
