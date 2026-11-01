
import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  KeyRound,
  Lock,
  Mail,
  Save,
  Server,
  Database,
  BrainCircuit,
  CalendarClock,
  Settings as SettingsIcon
} from 'lucide-react';

import { api } from '../lib/api';
import { User, SystemStatus } from '../types';

interface SettingsPageProps {
  currentUser: User | null;
  onUserUpdated: (user: User) => void;
}

type SettingsTab = 'profile' | 'security' | 'system' | 'preferences';

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile
  const [name, setName] = useState(currentUser?.name || 'Admin Administrator');
  const [email, setEmail] = useState(currentUser?.email || 'admin@bank.com');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // System
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Preferences: UI selections only; no persistence API exists in the supplied code.
  const [currency, setCurrency] = useState('INR');
  const [forecastHorizon, setForecastHorizon] = useState('next_7_days');

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);

    try {
      const res = await api.getSystemStatus();
      setSystemStatus(res);
    } catch (err: any) {
      setStatusError(err.message || 'Unable to load system status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const updated = await api.updateProfile(name, email);
      onUserUpdated(updated);
      setProfileMsg({
        type: 'success',
        text: 'Profile updated successfully.'
      });
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.message || 'Failed to update profile.'
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: 'error',
        text: 'New password and confirmation do not match.'
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: 'Password must be at least 6 characters.'
      });
      return;
    }

    setPasswordSaving(true);

    try {
      await api.changePassword(currentPassword, newPassword);

      setPasswordMsg({
        type: 'success',
        text: 'Password changed successfully.'
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err.message || 'Failed to change password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs: {
    id: SettingsTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'profile', label: 'Profile', icon: <UserIcon size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'system', label: 'System Status', icon: <Activity size={16} /> },
    { id: 'preferences', label: 'Preferences', icon: <Sliders size={16} /> }
  ];

  const initials = (currentUser?.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  const statusRows = [
    {
      label: 'Database',
      value: systemStatus?.db_type || 'Not reported',
      icon: <Database size={16} />
    },
    {
      label: 'ML Features',
      value: systemStatus
        ? `${systemStatus.features_count ?? systemStatus.feature_names?.length ?? 0} features`
        : 'Not available',
      icon: <BrainCircuit size={16} />
    },
    {
      label: 'Platform Version',
      value: systemStatus?.version
        ? `v${systemStatus.version}`
        : 'Not reported',
      icon: <Server size={16} />
    },
    {
      label: 'Last Model Update',
      value: systemStatus?.last_model_update || 'Not reported',
      icon: <CalendarClock size={16} />
    }
  ];

  return (
    <div className="ic-settings-page">

      {/* Page Header */}
      <div className="ic-settings-header">
        <div>
          <div className="ic-settings-eyebrow">
            <SettingsIcon size={14} />
            ACCOUNT & PLATFORM CONFIGURATION
          </div>
          <h1>Settings</h1>
          <p>
            Manage your account, security and IntelliCash system information.
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="ic-settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`ic-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="ic-settings-layout">

        {/* Left: Tab Content */}
        <div className="ic-settings-main">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="ic-settings-panel">

              <div className="ic-settings-panel-heading">
                <div className="ic-settings-panel-icon blue">
                  <UserIcon size={19} />
                </div>
                <div>
                  <h3>Administrator Profile</h3>
                  <p>Manage your personal account information.</p>
                </div>
              </div>

              {profileMsg && (
                <div className={`ic-settings-message ${profileMsg.type}`}>
                  {profileMsg.type === 'success'
                    ? <CheckCircle2 size={17} />
                    : <AlertCircle size={17} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="ic-settings-profile-card">
                <div className="ic-settings-avatar">
                  {initials || 'A'}
                </div>
                <div>
                  <h4>{currentUser?.name || 'Administrator'}</h4>
                  <p>{currentUser?.role || 'Administrator'}</p>
                  <span className="ic-settings-account-label">
                    IntelliCash Account
                  </span>
                </div>
              </div>

              <form
                className="ic-settings-form"
                onSubmit={handleProfileSubmit}
              >
                <div className="ic-settings-field">
                  <label>Username</label>
                  <div className="ic-settings-input-wrap disabled">
                    <UserIcon size={16} />
                    <input
                      type="text"
                      value={currentUser?.username || 'admin'}
                      disabled
                    />
                    <Lock size={14} className="ic-settings-field-lock" />
                  </div>
                  <span className="ic-settings-hint">
                    Username cannot be changed here.
                  </span>
                </div>

                <div className="ic-settings-field">
                  <label>Full Name</label>
                  <div className="ic-settings-input-wrap">
                    <UserIcon size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="ic-settings-field">
                  <label>Email Address</label>
                  <div className="ic-settings-input-wrap">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="ic-settings-field">
                  <label>Account Role</label>
                  <div className="ic-settings-input-wrap disabled">
                    <Shield size={16} />
                    <input
                      type="text"
                      value={currentUser?.role || 'Administrator'}
                      disabled
                    />
                    <Lock size={14} className="ic-settings-field-lock" />
                  </div>
                </div>

                <div className="ic-settings-form-actions">
                  <button
                    type="submit"
                    className="ic-settings-primary-button"
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? <RefreshCw size={16} className="ic-settings-spin" />
                      : <Save size={16} />}
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="ic-settings-panel">

              <div className="ic-settings-panel-heading">
                <div className="ic-settings-panel-icon purple">
                  <Shield size={19} />
                </div>
                <div>
                  <h3>Account Security</h3>
                  <p>Update your password to protect your account.</p>
                </div>
              </div>

              <div className="ic-settings-security-notice">
                <Lock size={18} />
                <div>
                  <strong>Keep your account secure</strong>
                  <p>
                    Use a password that is difficult to guess and do not
                    share it with anyone.
                  </p>
                </div>
              </div>

              {passwordMsg && (
                <div className={`ic-settings-message ${passwordMsg.type}`}>
                  {passwordMsg.type === 'success'
                    ? <CheckCircle2 size={17} />
                    : <AlertCircle size={17} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form
                className="ic-settings-form"
                onSubmit={handlePasswordSubmit}
              >
                <div className="ic-settings-field">
                  <label>Current Password</label>
                  <div className="ic-settings-input-wrap">
                    <KeyRound size={16} />
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="ic-settings-field">
                  <label>New Password</label>
                  <div className="ic-settings-input-wrap">
                    <Lock size={16} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <span className="ic-settings-hint">
                    Minimum 6 characters.
                  </span>
                </div>

                <div className="ic-settings-field">
                  <label>Confirm New Password</label>
                  <div className="ic-settings-input-wrap">
                    <Shield size={16} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                </div>

                <div className="ic-settings-form-actions">
                  <button
                    type="submit"
                    className="ic-settings-primary-button"
                    disabled={passwordSaving}
                  >
                    {passwordSaving
                      ? <RefreshCw size={16} className="ic-settings-spin" />
                      : <KeyRound size={16} />}
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SYSTEM STATUS */}
          {activeTab === 'system' && (
            <div className="ic-settings-panel">

              <div className="ic-settings-panel-heading">
                <div className="ic-settings-panel-icon cyan">
                  <Activity size={19} />
                </div>
                <div>
                  <h3>System Configuration</h3>
                  <p>Backend-reported ML configuration details.</p>
                </div>
              </div>

              <div className="ic-settings-system-note">
                <Info size={17} />
                <p>
                  The feature list below is retrieved from the backend.
                  The order shown is the order returned by the system.
                </p>
              </div>

              {statusLoading ? (
                <div className="ic-settings-system-state">
                  <RefreshCw size={22} className="ic-settings-spin" />
                  <p>Loading system information...</p>
                </div>
              ) : statusError ? (
                <div className="ic-settings-system-state error">
                  <AlertCircle size={22} />
                  <p>{statusError}</p>
                  <button
                    className="ic-settings-secondary-button"
                    onClick={loadSystemStatus}
                  >
                    Retry
                  </button>
                </div>
              ) : systemStatus ? (
                <>
                  <div className="ic-settings-system-grid">
                    {statusRows.map(row => (
                      <div className="ic-settings-system-item" key={row.label}>
                        <div className="ic-settings-system-item-icon">
                          {row.icon}
                        </div>
                        <div>
                          <span>{row.label}</span>
                          <strong>{row.value}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ic-settings-features">
                    <div className="ic-settings-features-heading">
                      <div>
                        <BrainCircuit size={17} />
                        <h4>Model Feature Configuration</h4>
                      </div>
                      <span>
                        {systemStatus.feature_names?.length ?? 0} listed
                      </span>
                    </div>

                    {systemStatus.feature_names &&
                    systemStatus.feature_names.length > 0 ? (
                      <ol className="ic-settings-feature-list">
                        {systemStatus.feature_names.map((feature, index) => (
                          <li key={`${feature}-${index}`}>
                            <span className="ic-settings-feature-number">
                              {index + 1}
                            </span>
                            <code>{feature}</code>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="ic-settings-no-features">
                        No feature names were returned by the backend.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="ic-settings-system-state">
                  <Info size={22} />
                  <p>System information is not available yet.</p>
                </div>
              )}

              <div className="ic-settings-form-actions">
                <button
                  className="ic-settings-secondary-button"
                  onClick={loadSystemStatus}
                  disabled={statusLoading}
                >
                  <RefreshCw
                    size={15}
                    className={statusLoading ? 'ic-settings-spin' : ''}
                  />
                  Refresh System Information
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="ic-settings-panel">

              <div className="ic-settings-panel-heading">
                <div className="ic-settings-panel-icon green">
                  <Sliders size={19} />
                </div>
                <div>
                  <h3>Application Preferences</h3>
                  <p>Choose display options for this session.</p>
                </div>
              </div>

              <div className="ic-settings-preference-item">
                <div className="ic-settings-preference-info">
                  <div className="ic-settings-preference-icon">
                    <WalletIcon />
                  </div>
                  <div>
                    <h4>Display Currency</h4>
                    <p>Currency used for displaying monetary values.</p>
                  </div>
                </div>

                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="ic-settings-select"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                </select>
              </div>

              <div className="ic-settings-preference-item">
                <div className="ic-settings-preference-info">
                  <div className="ic-settings-preference-icon">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <h4>Default Forecast Horizon</h4>
                    <p>Preferred forecast period selection.</p>
                  </div>
                </div>

                <select
                  value={forecastHorizon}
                  onChange={e => setForecastHorizon(e.target.value)}
                  className="ic-settings-select"
                >
                  <option value="next_7_days">Next 7 Days</option>
                  <option value="next_14_days">Next 14 Days</option>
                </select>
              </div>

              <div className="ic-settings-preference-item">
                <div className="ic-settings-preference-info">
                  <div className="ic-settings-preference-icon">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4>Decision Support Mode</h4>
                    <p>
                      Academic decision-support prototype. It does not
                      trigger live cash dispatch.
                    </p>
                  </div>
                </div>
                <span className="ic-settings-prototype-label">
                  Prototype
                </span>
              </div>

              <div className="ic-settings-preference-note">
                <Info size={16} />
                <span>
                  These preference selections are currently held in the
                  page session. They are not saved to the backend.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Account and System Information */}
        <aside className="ic-settings-sidebar">

          <div className="ic-settings-side-card">
            <div className="ic-settings-side-heading">
              <div className="ic-settings-side-icon">
                <UserIcon size={18} />
              </div>
              <div>
                <h3>Account Overview</h3>
                <p>Your IntelliCash account</p>
              </div>
            </div>

            <div className="ic-settings-side-profile">
              <div className="ic-settings-avatar small">
                {initials || 'A'}
              </div>
              <div>
                <strong>{currentUser?.name || 'Administrator'}</strong>
                <span>{currentUser?.username || 'admin'}</span>
              </div>
            </div>

            <div className="ic-settings-side-divider" />

            <div className="ic-settings-side-row">
              <span>Role</span>
              <strong>{currentUser?.role || 'Administrator'}</strong>
            </div>

            <div className="ic-settings-side-row">
              <span>Email</span>
              <strong>{currentUser?.email || email}</strong>
            </div>

            <div className="ic-settings-side-row">
              <span>Platform</span>
              <strong>IntelliCash</strong>
            </div>
          </div>

          <div className="ic-settings-side-card">
            <div className="ic-settings-side-heading">
              <div className="ic-settings-side-icon cyan">
                <Activity size={18} />
              </div>
              <div>
                <h3>System Information</h3>
                <p>Latest backend status response</p>
              </div>
            </div>

            <div className="ic-settings-side-status">
              <span className={`ic-settings-status-dot ${systemStatus ? 'available' : 'unknown'}`} />
              <span>
                {statusLoading
                  ? 'Checking system...'
                  : systemStatus
                    ? 'System information available'
                    : 'System information unavailable'}
              </span>
            </div>

            <div className="ic-settings-side-row">
              <span>Database</span>
              <strong>{systemStatus?.db_type || '—'}</strong>
            </div>

            <div className="ic-settings-side-row">
              <span>Version</span>
              <strong>
                {systemStatus?.version
                  ? `v${systemStatus.version}`
                  : '—'}
              </strong>
            </div>

            <button
              className="ic-settings-secondary-button full"
              onClick={loadSystemStatus}
              disabled={statusLoading}
            >
              <RefreshCw
                size={14}
                className={statusLoading ? 'ic-settings-spin' : ''}
              />
              Refresh Status
            </button>
          </div>

          <div className="ic-settings-help-card">
            <div className="ic-settings-help-icon">
              <Info size={18} />
            </div>
            <div>
              <h4>About IntelliCash</h4>
              <p>
                AI-powered ATM cash intelligence for demand forecasting
                and replenishment decision support.
              </p>
            </div>
          </div>

        </aside>
      </div>

      <div className="ic-settings-footer">
        <Shield size={14} />
        <span>IntelliCash Account & System Configuration</span>
      </div>

    </div>
  );
};

const WalletIcon: React.FC = () => (
  <span className="ic-settings-wallet-symbol">₹</span>
);
