
import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  Landmark,
  ShieldAlert,
  Activity,
  Wallet,
  TrendingUp,
  Clock,
  Compass,
  CalendarDays,
  Database,
  AlertCircle,
  MapPinned,
  Gauge,
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
} from 'recharts';

import { api } from '../lib/api';
import { ATMDetail, Transaction, Prediction, TrendPoint } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { PageId } from '../components/layout/AppShell';

interface AtmDetailsPageProps {
  atmId: string;
  onNavigate: (page: PageId) => void;
}

type AtmTab = 'trend' | 'transactions' | 'predictions' | 'location';

export const AtmDetailsPage: React.FC<AtmDetailsPageProps> = ({
  atmId,
  onNavigate,
}) => {
  const [atm, setAtm] = useState<ATMDetail | null>(null);
  const [activeTab, setActiveTab] = useState<AtmTab>('trend');
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [atmId]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [atmRes, trendRes, txRes, predRes] = await Promise.all([
        api.getAtmDetails(atmId),
        api.getAtmTrend(atmId, 14),
        api.getAtmTransactions(atmId, 1, 10),
        api.getAtmPredictions(atmId, 1, 10),
      ]);

      setAtm(atmRes);
      setTrendData(trendRes);
      setTransactions(txRes.items);
      setPredictions(predRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load ATM details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDetails();
  };

  const tabs: { id: AtmTab; label: string; icon: React.ReactNode }[] = [
    { id: 'trend', label: 'Demand Trend', icon: <TrendingUp size={16} /> },
    { id: 'transactions', label: 'Transactions', icon: <Activity size={16} /> },
    { id: 'predictions', label: 'Prediction History', icon: <CalendarDays size={16} /> },
    { id: 'location', label: 'Location Info', icon: <MapPin size={16} /> },
  ];

  if (loading) {
    return (
      <div className="ic-atm-details-state">
        <RefreshCw size={30} className="ic-atm-spin" />
        <h3>Loading ATM intelligence...</h3>
        <p>Fetching ATM details, demand trends and transaction records.</p>
      </div>
    );
  }

  if (error || !atm) {
    return (
      <div className="ic-atm-details-error">
        <button
          className="ic-atm-back-button"
          onClick={() => onNavigate('atm-network')}
        >
          <ArrowLeft size={16} />
          Back to ATM Network
        </button>

        <div className="ic-atm-error-card">
          <AlertCircle size={30} />
          <h3>Unable to load ATM details</h3>
          <p>{error || `No details found for ATM ${atmId}.`}</p>
          <button onClick={loadDetails} className="ic-atm-retry-button">
            <RefreshCw size={15} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ic-atm-details">
      {/* Header */}
      <div className="ic-atm-details-header">
        <div>
          <div className="ic-atm-details-eyebrow">
            <Activity size={14} />
            ATM INTELLIGENCE / NETWORK DETAILS
          </div>

          <h1>ATM Details</h1>
          <p>Monitor cash position, demand patterns and operational risk.</p>
        </div>

        <div className="ic-atm-header-actions">
          <button
            className="ic-atm-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? 'ic-atm-spin' : ''}
            />
            Refresh
          </button>

          <button
            className="ic-atm-back-button"
            onClick={() => onNavigate('atm-network')}
          >
            <ArrowLeft size={16} />
            Back to Network
          </button>
        </div>
      </div>

      {/* ATM Identity and Summary */}
      <section className="ic-atm-identity-panel">
        <div className="ic-atm-identity">
          <div className="ic-atm-identity-icon">
            <Landmark size={31} />
            <span>ATM</span>
          </div>

          <div className="ic-atm-identity-info">
            <div className="ic-atm-identity-title">
              <h2>{atm.atm_id}</h2>
              <span
                className={`ic-atm-status ${
                  atm.status === 'Active' ? 'active' : 'inactive'
                }`}
              >
                <span />
                {atm.status}
              </span>
              <RiskBadge risk={atm.risk_level} />
            </div>

            <h3>{atm.atm_name}</h3>

            <p className="ic-atm-address">
              <MapPin size={14} />
              {atm.atm_address || `${atm.atm_name}, ${atm.city}`}
            </p>

            {atm.latitude != null && atm.longitude != null && (
              <p className="ic-atm-coordinates">
                <Compass size={13} />
                {atm.latitude}° N, {atm.longitude}° E
              </p>
            )}
          </div>
        </div>

        <div className="ic-atm-summary-grid">
          <div className="ic-atm-summary-card balance">
            <div className="ic-atm-summary-label">
              <Wallet size={15} />
              Current Balance
            </div>
            <strong>{formatINR(atm.current_balance)}</strong>
            <span>Available cash</span>
          </div>

          <div className="ic-atm-summary-card demand">
            <div className="ic-atm-summary-label">
              <TrendingUp size={15} />
              Predicted Demand
            </div>
            <strong>{formatINR(atm.predicted_demand)}</strong>
            <span>Forecasted requirement</span>
          </div>

          <div className="ic-atm-summary-card refill">
            <div className="ic-atm-summary-label">
              <Wallet size={15} />
              Recommended Refill
            </div>
            <strong>{formatINR(atm.recommended_refill)}</strong>
            <span>Suggested replenishment</span>
          </div>

          <div className="ic-atm-summary-card prediction-time">
            <div className="ic-atm-summary-label">
              <Clock size={15} />
              Last Prediction
            </div>
            <strong className="ic-atm-last-prediction">
              {formatDateTime(atm.last_prediction_time)}
            </strong>
            <span>Latest forecast timestamp</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="ic-atm-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ic-atm-tab ${
              activeTab === tab.id ? 'active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Demand Trend */}
      {activeTab === 'trend' && (
        <div className="ic-atm-trend-grid">
          <section className="ic-atm-panel">
            <div className="ic-atm-panel-heading">
              <div>
                <span className="ic-atm-panel-eyebrow">CASH FORECAST</span>
                <h3>Actual vs Predicted Demand</h3>
                <p>Demand trend for the last 14 days</p>
              </div>
              <div className="ic-atm-panel-icon blue">
                <TrendingUp size={19} />
              </div>
            </div>

            <div className="ic-atm-trend-chart">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 12, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#26364f"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => formatINR(value, true)}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: any) => [
                        formatINR(Number(value)),
                        '',
                      ]}
                      contentStyle={{
                        backgroundColor: '#111f35',
                        border: '1px solid #334155',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '12px',
                        color: '#cbd5e1',
                        paddingTop: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual_demand"
                      name="Actual Demand"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#38bdf8' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted_demand"
                      name="Predicted Demand"
                      stroke="#a78bfa"
                      strokeWidth={2.5}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#a78bfa' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="ic-atm-empty">
                  <Activity size={27} />
                  <p>No demand trend data available for this ATM.</p>
                </div>
              )}
            </div>

            <div className="ic-atm-chart-note">
              <span className="ic-atm-chart-dot blue" />
              Actual demand
              <span className="ic-atm-chart-dot purple" />
              Predicted demand
            </div>
          </section>

          <section className="ic-atm-panel ic-atm-risk-panel">
            <div className="ic-atm-panel-heading">
              <div>
                <span className="ic-atm-panel-eyebrow">RISK INTELLIGENCE</span>
                <h3>ATM Risk Analysis</h3>
                <p>Operational indicators</p>
              </div>
              <div className="ic-atm-panel-icon amber">
                <ShieldAlert size={19} />
              </div>
            </div>

            <div className="ic-atm-risk-main">
              <span>Current Risk Level</span>
              <RiskBadge risk={atm.risk_level} />
            </div>

            <div className="ic-atm-risk-list">
              <div>
                <span>Safety Factor</span>
                <strong>{atm.safety_factor}</strong>
              </div>
              <div>
                <span>Average Daily Withdrawal</span>
                <strong>{formatINR(atm.avg_daily_withdrawal)}</strong>
              </div>
              <div>
                <span>Peak Day</span>
                <strong>{atm.peak_day || '—'}</strong>
              </div>
              <div>
                <span>Volatility</span>
                <strong className={atm.volatility === 'High' ? 'high' : ''}>
                  {atm.volatility || '—'}
                </strong>
              </div>
            </div>

            <div className="ic-atm-suggested-action">
              <div>
                <ShieldAlert size={16} />
                Suggested Action
              </div>
              <p>{atm.suggested_action || 'No suggested action available.'}</p>
            </div>
          </section>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <section className="ic-atm-panel">
          <div className="ic-atm-panel-heading">
            <div>
              <span className="ic-atm-panel-eyebrow">TRANSACTION RECORDS</span>
              <h3>Recent ATM Transactions</h3>
              <p>Latest 10 transaction records for {atm.atm_id}</p>
            </div>
            <div className="ic-atm-panel-icon blue">
              <Activity size={19} />
            </div>
          </div>

          <div className="ic-atm-table-wrap">
            <table className="ic-atm-detail-table">
              <thead>
                <tr>
                  <th>Transaction Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Outcome Count</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{formatDateTime(transaction.transaction_time)}</td>
                    <td>
                      <span className="ic-atm-transaction-type">
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="ic-atm-table-amount">
                      {formatINR(transaction.amount)}
                    </td>
                    <td>{formatINR(transaction.balance_after)}</td>
                    <td>{transaction.outcome_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="ic-atm-empty">
                <Database size={26} />
                <p>No transaction records available for this ATM.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Prediction History */}
      {activeTab === 'predictions' && (
        <section className="ic-atm-panel">
          <div className="ic-atm-panel-heading">
            <div>
              <span className="ic-atm-panel-eyebrow">FORECAST RECORDS</span>
              <h3>Prediction History</h3>
              <p>Historical forecasts generated for {atm.atm_id}</p>
            </div>
            <div className="ic-atm-panel-icon purple">
              <CalendarDays size={19} />
            </div>
          </div>

          <div className="ic-atm-table-wrap">
            <table className="ic-atm-detail-table">
              <thead>
                <tr>
                  <th>Prediction Time</th>
                  <th>Period</th>
                  <th>Predicted Demand</th>
                  <th>Balance Used</th>
                  <th>Risk</th>
                  <th>Recommended Refill</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr key={prediction.prediction_id}>
                    <td>{formatDateTime(prediction.prediction_time)}</td>
                    <td>{prediction.prediction_period}</td>
                    <td className="ic-atm-table-amount">
                      {formatINR(prediction.predicted_demand)}
                    </td>
                    <td>{formatINR(prediction.current_balance)}</td>
                    <td><RiskBadge risk={prediction.risk_level} /></td>
                    <td className="ic-atm-table-refill">
                      {formatINR(prediction.recommended_refill)}
                    </td>
                    <td>
                      <span
                        className={`ic-atm-review-status ${
                          prediction.review_status === 'Reviewed'
                            ? 'reviewed'
                            : 'pending'
                        }`}
                      >
                        {prediction.review_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {predictions.length === 0 && (
              <div className="ic-atm-empty">
                <CalendarDays size={26} />
                <p>No prediction history available for this ATM.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Location */}
      {activeTab === 'location' && (
        <section className="ic-atm-location-grid">
          <div className="ic-atm-panel">
            <div className="ic-atm-panel-heading">
              <div>
                <span className="ic-atm-panel-eyebrow">ATM INFORMATION</span>
                <h3>Location and Hardware Details</h3>
                <p>Registered information for this ATM</p>
              </div>
              <div className="ic-atm-panel-icon blue">
                <MapPinned size={19} />
              </div>
            </div>

            <div className="ic-atm-location-list">
              <div><span>ATM Identifier</span><strong>{atm.atm_id}</strong></div>
              <div><span>Branch / Location</span><strong>{atm.atm_name}</strong></div>
              <div><span>City</span><strong>{atm.city}</strong></div>
              <div><span>Address</span><strong>{atm.atm_address || '—'}</strong></div>
              <div>
                <span>Latitude / Longitude</span>
                <strong>
                  {atm.latitude != null && atm.longitude != null
                    ? `${atm.latitude}, ${atm.longitude}`
                    : 'Not available'}
                </strong>
              </div>
              <div><span>Operating Status</span><strong>{atm.status}</strong></div>
              <div><span>Risk Level</span><strong><RiskBadge risk={atm.risk_level} /></strong></div>
            </div>
          </div>

          <div className="ic-atm-panel ic-atm-location-note">
            <div className="ic-atm-panel-icon green">
              <Gauge size={21} />
            </div>
            <h3>Operational Overview</h3>
            <p>
              This section displays the location and operational information
              returned by the IntelliCash backend for the selected ATM.
            </p>
            <div className="ic-atm-location-status">
              <span className={atm.status === 'Active' ? 'active' : 'inactive'} />
              {atm.status}
            </div>
          </div>
        </section>
      )}

      <div className="ic-atm-details-footer">
        <span>INTELLICASH ATM INTELLIGENCE</span>
        <span>ATM ID: {atm.atm_id}</span>
      </div>
    </div>
  );
};
