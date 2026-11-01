
import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Activity,
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

import { api, setStoredToken } from '../lib/api';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login(username.trim(), password);

      setStoredToken(response.access_token);

      localStorage.setItem(
        'cashflow_iq_user',
        JSON.stringify(response.user)
      );

      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ic-login">

      {/* LEFT BRAND PANEL */}

      <section className="ic-brand-panel">

        <div className="ic-brand-content">

          <div className="ic-brand">
            <div className="ic-brand-icon">
              <BrainCircuit size={28} />
            </div>

            <div>
              <h2>IntelliCash</h2>
              <span>SMART CASH INTELLIGENCE</span>
            </div>
          </div>

          <div className="ic-hero">
            <span className="ic-tag">
              <Activity size={14} />
              INTELLIGENT BANKING ANALYTICS
            </span>

            <h1>
              Make every
              <span> cash decision </span>
              smarter.
            </h1>

            <p>
              Predict ATM cash demand, monitor network performance,
              and make smarter replenishment decisions with
              machine learning.
            </p>
          </div>

          <div className="ic-features">

            <div className="ic-feature">
              <div className="ic-feature-icon blue">
                <TrendingUp size={20} />
              </div>

              <div>
                <h4>Demand Forecasting</h4>
                <p>Predict future ATM cash requirements.</p>
              </div>
            </div>

            <div className="ic-feature">
              <div className="ic-feature-icon purple">
                <Activity size={20} />
              </div>

              <div>
                <h4>Real-time Monitoring</h4>
                <p>Track ATM performance and cash levels.</p>
              </div>
            </div>

            <div className="ic-feature">
              <div className="ic-feature-icon green">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h4>Smarter Replenishment</h4>
                <p>Reduce cash-out risks and optimize refills.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="ic-brand-footer">
          <span>INTELLICASH PLATFORM</span>
          <span>AI-POWERED FINANCIAL INTELLIGENCE</span>
        </div>

      </section>

      {/* RIGHT LOGIN PANEL */}

      <section className="ic-form-panel">

        <div className="ic-login-card">

          <div className="ic-mobile-brand">
            <BrainCircuit size={27} />
            <span>IntelliCash</span>
          </div>

          <div className="ic-welcome">
            <span className="ic-welcome-label">
              ADMINISTRATOR PORTAL
            </span>

            <h2>Welcome back</h2>

            <p>
              Sign in to access your cash intelligence dashboard.
            </p>
          </div>

          {error && (
            <div className="ic-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="ic-field">

              <label htmlFor="username">Username</label>

              <div className="ic-input-wrap">
                <User size={18} />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

            </div>

            <div className="ic-field">

              <label htmlFor="password">Password</label>

              <div className="ic-input-wrap">
                <Lock size={18} />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="ic-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

            </div>

            <button
              type="submit"
              className="ic-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to IntelliCash'}
              {!loading && <ArrowRight size={19} />}
            </button>

          </form>

          <div className="ic-security">
            <ShieldCheck size={17} />
            Secure access for authorized administrators
          </div>

          <div className="ic-login-bottom">
            IntelliCash · AI-Powered ATM Cash Intelligence
          </div>

        </div>

      </section>

    </div>
  );
};
