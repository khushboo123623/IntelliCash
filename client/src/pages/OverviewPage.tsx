
import React, { useEffect, useState } from 'react';
import {
  Landmark,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Wallet,
  Activity,
  ArrowUpRight,
  BrainCircuit
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { api } from '../lib/api';
import { OverviewData } from '../types';
import { formatINR } from '../lib/formatters';
import { KpiCard } from '../components/ui/KpiCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { PageId } from '../components/layout/AppShell';

interface OverviewPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

const RISK_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981'
};

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ic-overview-loading">
        <RefreshCw className="animate-spin" size={30} />
        <p>Preparing your cash intelligence dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ic-overview-error">
        <AlertCircle size={32} />
        <h2>Dashboard unavailable</h2>
        <p>{error || 'No dashboard data found.'}</p>
        <button onClick={loadData}>Try Again</button>
      </div>
    );
  }

  const { kpis, trend, risk_distribution, attention_list } = data;

  const donutData = [
    { name: 'High Risk', value: risk_distribution.high_risk, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: risk_distribution.medium_risk, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: risk_distribution.low_risk, color: RISK_COLORS.low }
  ];

  return (
    <div className="ic-overview">

      {/* Welcome Header */}
      <section className="ic-dashboard-banner">
        <div>
          <div className="ic-dashboard-eyebrow">
            <BrainCircuit size={16} />
            INTELLIGENT CASH MANAGEMENT
          </div>

          <h1>Cash Intelligence Overview</h1>

          <p>
            Monitor ATM liquidity, identify cash shortages and plan smarter
            replenishment decisions.
          </p>
        </div>

        <button className="ic-refresh-button" onClick={loadData}>
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </section>

      {/* KPI Section */}
      <section className="ic-section">
        <div className="ic-section-heading">
          <div>
            <span className="ic-section-label">NETWORK PERFORMANCE</span>
            <h2>Network at a glance</h2>
          </div>
          <Activity size={22} />
        </div>

        <div className="ic-kpi-grid">
          <KpiCard
            title="Total ATMs"
            value={kpis.total_atms}
            subtitle="ATM network coverage"
            subtitleType="success"
            icon={<Landmark size={21} color="#2563EB" />}
            iconBg="#DBEAFE"
          />

          <KpiCard
            title="High Risk"
            value={kpis.high_risk}
            subtitle={`${kpis.high_risk_pct}% of network`}
            subtitleType="danger"
            icon={<AlertCircle size={21} color="#DC2626" />}
            iconBg="#FEE2E2"
          />

          <KpiCard
            title="Medium Risk"
            value={kpis.medium_risk}
            subtitle={`${kpis.medium_risk_pct}% of network`}
            subtitleType="warning"
            icon={<AlertTriangle size={21} color="#D97706" />}
            iconBg="#FEF3C7"
          />

          <KpiCard
            title="Low Risk"
            value={kpis.low_risk}
            subtitle={`${kpis.low_risk_pct}% of network`}
            subtitleType="success"
            icon={<ShieldCheck size={21} color="#059669" />}
            iconBg="#D1FAE5"
          />
        </div>
      </section>

      {/* Analytics Section */}
      <section className="ic-analytics-grid">

        <div className="ic-panel ic-trend-panel">
          <div className="ic-panel-header">
            <div>
              <span className="ic-section-label">FORECAST ANALYTICS</span>
              <h2>Cash demand analysis</h2>
              <p>Actual versus predicted cash demand</p>
            </div>

            <div className="ic-panel-icon">
              <TrendingUp size={21} />
            </div>
          </div>

          <div className="ic-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend}
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#E8EDF5"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={(val) => formatINR(val, true)}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />

                <Line
                  type="monotone"
                  dataKey="actual_demand"
                  name="Actual Demand"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="predicted_demand"
                  name="Predicted Demand"
                  stroke="#06B6D4"
                  strokeWidth={3}
                  strokeDasharray="6 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ic-panel ic-risk-panel">
          <div className="ic-panel-header">
            <div>
              <span className="ic-section-label">RISK MONITORING</span>
              <h2>ATM risk profile</h2>
              <p>Network-wide risk distribution</p>
            </div>
            <ShieldCheck size={22} color="#2563EB" />
          </div>

          <div className="ic-donut-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: any) => [`${value} ATMs`, '']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="ic-donut-center">
              <strong>{risk_distribution.total}</strong>
              <span>Total ATMs</span>
            </div>
          </div>

          <div className="ic-risk-legend">
            {donutData.map((item, index) => {
              const percentage = [
                kpis.high_risk_pct,
                kpis.medium_risk_pct,
                kpis.low_risk_pct
              ][index];

              return (
                <div className="ic-risk-item" key={item.name}>
                  <span className="ic-risk-name">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <strong>{item.value} ({percentage}%)</strong>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATM Attention Table */}
      <section className="ic-panel ic-atm-panel">
        <div className="ic-panel-header ic-atm-header">
          <div>
            <span className="ic-section-label">ACTION REQUIRED</span>
            <h2>ATMs needing attention</h2>
            <p>Prioritize ATMs based on predicted cash requirements.</p>
          </div>

          <button
            className="ic-view-refills"
            onClick={() => onNavigate('refill-actions')}
          >
            View Refill Actions
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="ic-table-wrapper">
          <table className="ic-atm-table">
            <thead>
              <tr>
                <th>ATM ID</th>
                <th>Location</th>
                <th>Current Balance</th>
                <th>Predicted Demand</th>
                <th>Risk Level</th>
                <th>Suggested Refill</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {attention_list.map((item) => (
                <tr key={item.atm_id}>
                  <td>
                    <strong className="ic-atm-id">{item.atm_id}</strong>
                  </td>

                  <td>{item.location}</td>

                  <td>{formatINR(item.current_balance)}</td>

                  <td className="ic-demand-value">
                    {formatINR(item.predicted_demand)}
                  </td>

                  <td>
                    <RiskBadge risk={item.risk} />
                  </td>

                  <td className="ic-refill-value">
                    {formatINR(item.recommended_refill)}
                  </td>

                  <td>
                    <button
                      className="ic-view-button"
                      onClick={() => onNavigate('atm-details', item.atm_id)}
                    >
                      Details
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              ))}

              {attention_list.length === 0 && (
                <tr>
                  <td colSpan={7} className="ic-empty-table">
                    No ATMs currently require attention.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <div className="ic-dashboard-footer">
        <div>
          <Wallet size={16} />
          IntelliCash Cash Intelligence
        </div>
        <span>AI-powered ATM monitoring and forecasting</span>
      </div>

    </div>
  );
};
