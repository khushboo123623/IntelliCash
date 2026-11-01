
import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  RefreshCw,
  Sparkles,
  Wallet,
  Landmark,
  Activity,
  BrainCircuit,
  ArrowUpRight
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

import { api } from '../lib/api';
import { ATM, Prediction, TrendPoint } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';

export const PredictionsPage: React.FC = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [selectedAtmId, setSelectedAtmId] = useState('');
  const [period, setPeriod] = useState('Next 7 Days');

  const [predictionResult, setPredictionResult] =
    useState<Prediction | null>(null);

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loadingAtms, setLoadingAtms] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAtmList();
  }, []);

  useEffect(() => {
    if (selectedAtmId) {
      loadAtmHistoricalTrend(selectedAtmId);
      setPredictionResult(null);
    }
  }, [selectedAtmId]);

  const loadAtmList = async () => {
    setLoadingAtms(true);

    try {
      const res = await api.getAtms({
        page: 1,
        page_size: 100
      });

      setAtms(res.items);

      if (res.items.length > 0) {
        setSelectedAtmId(res.items[0].atm_id);
      }
    } catch {
      setError('Unable to load ATM list. Please check the backend.');
    } finally {
      setLoadingAtms(false);
    }
  };

  const loadAtmHistoricalTrend = async (atmId: string) => {
    try {
      const res = await api.getAtmTrend(atmId, 14);
      setTrendData(res);
    } catch {
      setTrendData([]);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAtmId) return;

    setPredicting(true);
    setError(null);

    try {
      const periodParam = period.toLowerCase().replace(/\s+/g, '_');

      const res = await api.createPrediction(
        selectedAtmId,
        periodParam
      );

      setPredictionResult(res);
      await loadAtmHistoricalTrend(selectedAtmId);

    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction.');
    } finally {
      setPredicting(false);
    }
  };

  const selectedAtm = atms.find(
    a => a.atm_id === selectedAtmId
  );

  const riskLevel =
    predictionResult?.risk_level || selectedAtm?.risk_level;

  const isHighRisk = riskLevel === 'HIGH';
  const isMediumRisk = riskLevel === 'MEDIUM';

  return (
    <div className="ic-predictions">

      {/* Header */}
      <div className="ic-prediction-header">
        <div>
          <div className="ic-prediction-eyebrow">
            <BrainCircuit size={15} />
            INTELLIGENT CASH FORECASTING
          </div>

          <h1>Cash Demand Predictions</h1>

          <p>
            Generate AI-powered ATM cash forecasts and make
            smarter replenishment decisions.
          </p>
        </div>

        <div className="ic-model-status">
          <span className="ic-status-dot"></span>
          ML ENGINE READY
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="ic-prediction-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="ic-prediction-grid">

        {/* Prediction Form */}
        <div className="ic-prediction-panel">

          <div className="ic-prediction-panel-heading">
            <div className="ic-panel-icon">
              <Landmark size={20} />
            </div>

            <div>
              <h3>Configure Forecast</h3>
              <p>Select ATM and forecast period</p>
            </div>
          </div>

          <form onSubmit={handlePredict}>

            <div className="ic-prediction-field">
              <label>Select ATM</label>

              <select
                value={selectedAtmId}
                onChange={e => setSelectedAtmId(e.target.value)}
                disabled={loadingAtms}
                required
              >
                <option value="">
                  {loadingAtms ? 'Loading ATMs...' : 'Select an ATM'}
                </option>

                {atms.map(atm => (
                  <option
                    key={atm.atm_id}
                    value={atm.atm_id}
                  >
                    {atm.atm_id} - {atm.atm_name} ({atm.city})
                  </option>
                ))}
              </select>
            </div>

            {selectedAtm && (
              <div className="ic-selected-atm">
                <div className="ic-selected-atm-icon">
                  <Wallet size={20} />
                </div>

                <div>
                  <span>Current ATM Balance</span>
                  <strong>
                    {formatINR(selectedAtm.current_balance)}
                  </strong>
                </div>
              </div>
            )}

            <div className="ic-prediction-field">
              <label>Forecast Period</label>

              <select
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                <option value="Next 7 Days">Next 7 Days</option>
                <option value="Next 14 Days">Next 14 Days</option>
                <option value="Next 24 Hours">Next 24 Hours</option>
              </select>
            </div>

            <button
              type="submit"
              className="ic-generate-button"
              disabled={predicting || !selectedAtmId}
            >
              {predicting ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Generating Forecast...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Generate Prediction
                  <ArrowUpRight size={17} />
                </>
              )}
            </button>

          </form>

          <div className="ic-model-info">
            <ShieldCheck size={17} />

            <p>
              AI-powered forecasting using engineered features
              and Random Forest model inference.
            </p>
          </div>

        </div>

        {/* Prediction Result */}
        <div className="ic-prediction-panel ic-result-panel">

          <div className="ic-prediction-panel-heading">
            <div className="ic-panel-icon ic-result-icon">
              <TrendingUp size={20} />
            </div>

            <div>
              <h3>Forecast Overview</h3>
              <p>ATM demand and replenishment insights</p>
            </div>
          </div>

          {predictionResult ? (
            <>
              <div className="ic-result-date">
                <Calendar size={15} />
                Generated: {formatDateTime(predictionResult.prediction_time)}
              </div>

              <div className="ic-result-metrics">

                <div className="ic-result-metric blue">
                  <span>Predicted Demand</span>
                  <strong>
                    {formatINR(predictionResult.predicted_demand)}
                  </strong>
                  <TrendingUp size={18} />
                </div>

                <div className="ic-result-metric neutral">
                  <span>Current Balance</span>
                  <strong>
                    {formatINR(predictionResult.current_balance)}
                  </strong>
                  <Wallet size={18} />
                </div>

                <div className="ic-result-metric amber">
                  <span>Risk Level</span>
                  <strong>{predictionResult.risk_level}</strong>
                  <AlertTriangle size={18} />
                </div>

                <div className="ic-result-metric green">
                  <span>Recommended Refill</span>
                  <strong>
                    {formatINR(predictionResult.recommended_refill)}
                  </strong>
                  <ShieldCheck size={18} />
                </div>

              </div>

              <div className={`ic-risk-message ${
                isHighRisk ? 'high' : isMediumRisk ? 'medium' : 'low'
              }`}>
                {isHighRisk ? (
                  <AlertCircle size={19} />
                ) : isMediumRisk ? (
                  <AlertTriangle size={19} />
                ) : (
                  <ShieldCheck size={19} />
                )}

                <span>
                  {isHighRisk
                    ? 'High cash-out risk. Immediate replenishment is recommended.'
                    : isMediumRisk
                    ? 'Moderate cash-out risk. Monitor ATM cash levels closely.'
                    : 'Cash balance is adequate for the forecasted period.'}
                </span>
              </div>

              <div className="ic-model-version">
                <Activity size={15} />
                Model Version: {predictionResult.model_version}
              </div>
            </>
          ) : (
            <div className="ic-prediction-empty">
              <div className="ic-empty-icon">
                <BrainCircuit size={36} />
              </div>

              <h3>Ready to Forecast</h3>

              <p>
                Select an ATM and generate a prediction to view
                cash demand, risk level and refill recommendations.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Historical Chart */}
      <div className="ic-prediction-panel ic-history-panel">

        <div className="ic-history-heading">
          <div>
            <div className="ic-prediction-eyebrow">
              <Activity size={14} />
              PERFORMANCE ANALYTICS
            </div>

            <h3>Historical Cash Demand</h3>

            <p>
              Actual vs predicted demand for the last 14 days
              {selectedAtm ? ` — ${selectedAtm.atm_id}` : ''}
            </p>
          </div>

          <span className="ic-history-tag">
            LAST 14 DAYS
          </span>
        </div>

        {trendData.length > 0 ? (
          <div className="ic-history-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendData}
                margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#26364b"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={val => formatINR(val, true)}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(val: any) => [
                    formatINR(Number(val)),
                    ''
                  ]}
                  contentStyle={{
                    backgroundColor: '#101D30',
                    border: '1px solid #26364b',
                    borderRadius: '10px',
                    color: '#fff'
                  }}
                />

                <Legend />

                <Bar
                  dataKey="actual_demand"
                  name="Actual Demand"
                  fill="#3B82F6"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="predicted_demand"
                  name="Predicted Demand"
                  fill="#22C55E"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="ic-chart-empty">
            <Activity size={30} />
            <p>
              {selectedAtmId
                ? 'No historical demand data available for this ATM.'
                : 'Select an ATM to view historical demand.'}
            </p>
          </div>
        )}

        <div className="ic-chart-footer">
          <span>
            <span className="ic-legend-blue"></span>
            Actual Withdrawals
          </span>

          <span>
            <span className="ic-legend-green"></span>
            Predicted Demand
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="ic-prediction-footer">
        <ShieldCheck size={16} />
        IntelliCash AI Forecasting System
        <span>Decision-support estimates. Verify refill actions before execution.</span>
      </div>

    </div>
  );
};
