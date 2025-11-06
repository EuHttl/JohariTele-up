import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MobileNavigation from './MobileNavigation';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  User,
  Settings,
  CreditCard,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import '../styles/layout.css';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { name: 'Participantes', href: '/app/participants', icon: Users, color: 'text-green-500' },
    { name: 'Relatórios', href: '/app/reports', icon: BarChart3, color: 'text-purple-500' },
    { name: 'Uso', href: '/app/usage', icon: TrendingUp, color: 'text-orange-500' },
    { name: 'Planos', href: '/app/plans', icon: CreditCard, color: 'text-pink-500' },
    { name: 'Configurações', href: '/app/admin', icon: Settings, color: 'text-gray-500' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="app-layout">
      {/* Mobile Navigation */}
      <MobileNavigation isAuthenticated={!!user} onLogout={handleLogout} />
      
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && (
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div className="sidebar-logo-text">
                <h1>Janela de Johari</h1>
                <p>Sistema de Avaliação</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="sidebar-logo-collapsed">
              <LayoutDashboard className="w-6 h-6" />
            </div>
          )}
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                title={!sidebarOpen ? item.name : ''}
              >
                <Icon className="sidebar-nav-icon" />
                {sidebarOpen && <span className="sidebar-nav-text">{item.name}</span>}
                {active && sidebarOpen && <div className="sidebar-nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`sidebar-user ${!sidebarOpen ? 'sidebar-user-collapsed' : ''}`}>
            <div className="sidebar-user-avatar">
              <User className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user?.name || 'Usuário'}</p>
                <p className="sidebar-user-role">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`sidebar-logout ${!sidebarOpen ? 'sidebar-logout-collapsed' : ''}`}
            title={!sidebarOpen ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`main-layout ${!sidebarOpen ? 'main-layout-expanded' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="top-header-left">
            <button 
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="top-header-breadcrumb">
              <span className="breadcrumb-item">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="top-header-right">
            <div className="top-header-user">
              <div className="top-header-user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="top-header-user-details">
                <p className="top-header-user-name">{user?.name || 'Usuário'}</p>
                <p className="top-header-user-role">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content-area">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h2>Menu</h2>
              <button onClick={toggleMobileMenu} className="mobile-menu-close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="mobile-menu-nav">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`mobile-menu-item ${active ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mobile-menu-footer">
              <div className="mobile-menu-user">
                <div className="mobile-menu-user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="mobile-menu-user-name">{user?.name || 'Usuário'}</p>
                  <p className="mobile-menu-user-role">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="mobile-menu-logout">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
