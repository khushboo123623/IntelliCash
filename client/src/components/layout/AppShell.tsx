
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Network,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Database,
  History,
  Settings,
  LogOut,
  Landmark,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { User } from '../../types';

export type PageId =
  | 'overview'
  | 'atm-network'
  | 'predictions'
  | 'refill-actions'
  | 'analytics'
  | 'data-explorer'
  | 'prediction-history'
  | 'settings'
  | 'atm-details';

interface AppShellProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extraParam?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={19} /> },
  { id: 'atm-network', label: 'ATM Network', icon: <Network size={19} /> },
  { id: 'predictions', label: 'Predictions', icon: <TrendingUp size={19} /> },
  { id: 'refill-actions', label: 'Refill Actions', icon: <RefreshCw size={19} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={19} /> },
  { id: 'data-explorer', label: 'Data Explorer', icon: <Database size={19} /> },
  { id: 'prediction-history', label: 'Prediction History', icon: <History size={19} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={19} /> },
];

const PAGE_LABELS: Record<PageId, string> = {
  overview: 'Overview',
  'atm-network': 'ATM Network',
  predictions: 'Predictions',
  'refill-actions': 'Refill Actions',
  analytics: 'Analytics',
  'data-explorer': 'Data Explorer',
  'prediction-history': 'Prediction History',
  settings: 'Settings',
  'atm-details': 'ATM Details',
};

export const AppShell: React.FC<AppShellProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isInitialActive = (id: PageId) =>
    currentPage === id ||
    (id === 'atm-network' && currentPage === 'atm-details');

  const initials = (currentUser?.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNavigation = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="ic-shell">

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="ic-sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ic-sidebar ${mobileMenuOpen ? 'ic-sidebar-open' : ''}`}>

        <div className="ic-sidebar-brand">
          <div className="ic-brand-logo">
            <Landmark size={23} />
          </div>

          <div className="ic-brand-text">
            <h2>IntelliCash</h2>
            <span>ATM CASH INTELLIGENCE</span>
          </div>

          <button
            className="ic-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>
        </div>

        <div className="ic-sidebar-label">WORKSPACE</div>

        <nav className="ic-sidebar-nav">
          {NAV_ITEMS.map(item => {
            const isActive = isInitialActive(item.id);

            return (
              <button
                key={item.id}
                className={`ic-nav-item ${isActive ? 'ic-nav-active' : ''}`}
                onClick={() => handleNavigation(item.id)}
              >
                <span className="ic-nav-icon">{item.icon}</span>
                <span className="ic-nav-label">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ic-nav-arrow" />}
              </button>
            );
          })}
        </nav>

        <div className="ic-sidebar-bottom">

          <div className="ic-sidebar-security">
            <div className="ic-security-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Secure Workspace</strong>
              <span>Protected session</span>
            </div>
          </div>

          <button className="ic-logout-button" onClick={onLogout}>
            <LogOut size={19} />
            <span>Sign Out</span>
          </button>

          <div className="ic-sidebar-version">
            IntelliCash · Dashboard
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ic-main-content">

        {/* Top header */}
        <header className="ic-topbar">

          <div className="ic-topbar-left">
            <button
              className="ic-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>

            <div className="ic-page-heading">
              <span className="ic-breadcrumb">WORKSPACE</span>
              <h1>{PAGE_LABELS[currentPage]}</h1>
            </div>
          </div>

          <div className="ic-topbar-right">

            <div className="ic-date-indicator">
              <CalendarDays size={16} />
              <span>
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            <button
              className="ic-user-profile"
              onClick={() => handleNavigation('settings')}
              title="Open account settings"
            >
              <div className="ic-user-avatar">{initials}</div>

              <div className="ic-user-info">
                <strong>{currentUser?.name || 'Admin'}</strong>
                <span>{currentUser?.role || 'Administrator'}</span>
              </div>

              <ChevronRight size={15} className="ic-profile-arrow" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="ic-page-content">
          {children}
        </main>

      </div>
    </div>
  );
};
