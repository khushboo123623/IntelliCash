
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Award,
  Target,
  RefreshCw,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { AnalyticsData } from '../types';
import { formatINR } from '../lib/formatters';

const RISK_COLORS = {
  high: '#f87171',
  medium: '#fbbf24',
  low: '#34d399'
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getAnalytics();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="ic-analytics-state">
        <RefreshCw className="ic-analytics-spin" size={28} />
        <p>Loading analytics and model performance...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ic-analytics-state ic-analytics-error">
        <AlertCircle size={30} />
        <h3>Unable to load analytics</h3>
        <p>{error || 'No analytics data is available.'}</p>
        <button onClick={loadAnalytics} className="ic-analytics-retry">
          <RefreshCw size={15} /> Try Again
        </button>
      </div>
    );
  }

  const {
    metrics,
    trend,
    risk_over_time,
    top_atms,
    risk_distribution
  } = data;

  const donutData = [
    { name: 'High Risk', value: risk_distribution.high_risk, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: risk_distribution.medium_risk, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: risk_distribution.low_risk, color: RISK_COLORS.low }
  ];

  const totalRisk = risk_distribution.total;

  const getPercentage = (value: number) =>
    totalRisk > 0 ? ((value / totalRisk) * 100).toFixed(1) : '0.0';

  const maxDemand = Math.max(...top_atms.map(atm => atm.demand), 0);

  return (
    <div className="ic-analytics-page">

      {/* Header */}
      <div className="ic-analytics-header">
        <div>
          <div className="ic-analytics-eyebrow">
            <BarChart3 size={14} /> INTELLIGENCE & REPORTING
          </div>
          <h2>Analytics & Insights</h2>
          <p>
            Understand forecasting performance, ATM demand patterns and network risk.
          </p>
        </div>

        <button
          className="ic-analytics-refresh"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>

      {/* Model metrics */}
      <div className="ic-analytics-section-title">
        <div>
          <h3>Model Performance</h3>
          <p>Evaluation metrics reported by the forecasting model</p>
        </div>
        <span className="ic-analytics-live-label">
          <span /> Backend Data
        </span>
      </div>

      <div className="ic-analytics-metrics">

        <div className="ic-analytics-metric-card">
          <div className="ic-analytics-metric-top">
            <span>Mean Absolute Error</span>
            <div className="ic-analytics-metric-icon blue">
              <Target size={19} />
            </div>
          </div>
          <h2>{formatINR(metrics.mae)}</h2>
          <p>MAE</p>
        </div>

        <div className="ic-analytics-metric-card">
          <div className="ic-analytics-metric-top">
            <span>Root Mean Squared Error</span>
            <div className="ic-analytics-metric-icon purple">
              <Activity size={19} />
            </div>
          </div>
          <h2>{formatINR(metrics.rmse)}</h2>
          <p>RMSE</p>
        </div>

        <div className="ic-analytics-metric-card">
          <div className="ic-analytics-metric-top">
            <span>Variance Explained</span>
            <div className="ic-analytics-metric-icon green">
              <Award size={19} />
            </div>
          </div>
          <h2>{metrics.r2_score.toFixed(2)}</h2>
          <p>R² Score</p>
        </div>

        <div className="ic-analytics-metric-card">
          <div className="ic-analytics-metric-top">
            <span>Prediction Accuracy</span>
            <div className="ic-analytics-metric-icon amber">
              <TrendingUp size={19} />
            </div>
          </div>
          <h2>{metrics.accuracy_pct}%</h2>
          <p>Evaluation date: {metrics.evaluation_date}</p>
        </div>

      </div>

      {/* Charts */}
      <div className="ic-analytics-section-title">
        <div>
          <h3>Demand & Risk Analysis</h3>
          <p>Historical trends from the analytics service</p>
        </div>
      </div>

      <div className="ic-analytics-chart-grid">

        {/* Demand chart */}
        <section className="ic-analytics-panel">
          <div className="ic-analytics-panel-heading">
            <div className="ic-analytics-panel-icon blue">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3>Actual vs Predicted Demand</h3>
              <p>Cash demand comparison over time</p>
            </div>
          </div>

          <div className="ic-analytics-chart">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 12, left: 8, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263750" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => formatINR(value, true)}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), '']}
                    contentStyle={{
                      background: '#142238',
                      border: '1px solid #334155',
                      borderRadius: '9px',
                      color: '#f1f5f9',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                  <Line
                    type="monotone"
                    dataKey="actual_demand"
                    name="Actual"
                    stroke="#60a5fa"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted_demand"
                    name="Predicted"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    strokeDasharray="5 4"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="ic-analytics-empty">No demand trend data available.</div>
            )}
          </div>
        </section>

        {/* Risk over time */}
        <section className="ic-analytics-panel">
          <div className="ic-analytics-panel-heading">
            <div className="ic-analytics-panel-icon amber">
              <Activity size={18} />
            </div>
            <div>
              <h3>Risk Distribution Over Time</h3>
              <p>High, medium and low risk ATM counts</p>
            </div>
          </div>

          <div className="ic-analytics-chart">
            {risk_over_time.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={risk_over_time} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263750" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#142238',
                      border: '1px solid #334155',
                      borderRadius: '9px',
                      color: '#f1f5f9',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="high" name="High" stackId="risk" fill={RISK_COLORS.high} />
                  <Bar dataKey="medium" name="Medium" stackId="risk" fill={RISK_COLORS.medium} />
                  <Bar dataKey="low" name="Low" stackId="risk" fill={RISK_COLORS.low} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="ic-analytics-empty">No risk history available.</div>
            )}
          </div>
        </section>
      </div>

      {/* Bottom section */}
      <div className="ic-analytics-bottom-grid">

        {/* Top ATMs */}
        <section className="ic-analytics-panel">
          <div className="ic-analytics-panel-heading">
            <div className="ic-analytics-panel-icon blue">
              <Award size={18} />
            </div>
            <div>
              <h3>Top High-Demand ATMs</h3>
              <p>ATMs ranked by reported demand</p>
            </div>
          </div>

          <div className="ic-analytics-top-atms">
            {top_atms.length > 0 ? top_atms.map((atm, index) => {
              const percentage = maxDemand > 0
                ? (atm.demand / maxDemand) * 100
                : 0;

              return (
                <div className="ic-analytics-atm-row" key={atm.atm_id}>
                  <div className="ic-analytics-atm-rank">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="ic-analytics-atm-info">
                    <div className="ic-analytics-atm-name">{atm.name}</div>
                    <div className="ic-analytics-progress-track">
                      <div
                        className="ic-analytics-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="ic-analytics-atm-value">
                    {formatINR(atm.demand, true)}
                  </div>
                </div>
              );
            }) : (
              <div className="ic-analytics-empty">No ATM demand data available.</div>
            )}
          </div>
        </section>

        {/* Risk donut */}
        <section className="ic-analytics-panel">
          <div className="ic-analytics-panel-heading">
            <div className="ic-analytics-panel-icon purple">
              <PieIcon size={18} />
            </div>
            <div>
              <h3>Network Risk Distribution</h3>
              <p>Current reported risk breakdown</p>
            </div>
          </div>

          <div className="ic-analytics-donut-area">
            <div className="ic-analytics-donut">
              {totalRisk > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={53}
                        outerRadius={76}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {donutData.map(entry => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value} ATMs`, '']}
                        contentStyle={{
                          background: '#142238',
                          border: '1px solid #334155',
                          borderRadius: '9px',
                          color: '#f1f5f9',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="ic-analytics-donut-center">
                    <strong>{totalRisk}</strong>
                    <span>Total ATMs</span>
                  </div>
                </>
              ) : (
                <div className="ic-analytics-empty">No risk data available.</div>
              )}
            </div>

            <div className="ic-analytics-risk-legend">
              {donutData.map(item => (
                <div className="ic-analytics-risk-row" key={item.name}>
                  <div className="ic-analytics-risk-name">
                    <span style={{ background: item.color }} />
                    {item.name}
                  </div>
                  <div className="ic-analytics-risk-value">
                    <strong>{item.value}</strong>
                    <span>{getPercentage(item.value)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="ic-analytics-footer">
        <Activity size={15} />
        Analytics are displayed using data returned by the IntelliCash backend.
      </div>

    </div>
  );
};
