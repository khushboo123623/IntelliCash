
import React, { useEffect, useState } from 'react';
import {
  Search,
  RotateCcw,
  RefreshCw,
  X,
  Calendar,
  Sparkles,
  Landmark,
  Activity,
  Wallet,
  BrainCircuit,
  Eye,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

import { api } from '../lib/api';
import { Prediction } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';

export const PredictionHistoryPage: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('All Risk Levels');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeModalPred, setActiveModalPred] =
    useState<Prediction | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [currentPage, selectedRisk, appliedSearch]);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getPredictionHistory({
        search: appliedSearch || undefined,
        risk_level:
          selectedRisk !== 'All Risk Levels'
            ? selectedRisk
            : undefined,
        page: currentPage,
        page_size: pageSize
      });

      setPredictions(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(search.trim());
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedRisk('All Risk Levels');
    setCurrentPage(1);
  };

  const closeModal = () => setActiveModalPred(null);

  return (
    <div className="ic-history-page">

      {/* Page Header */}
      <div className="ic-history-page-header">
        <div>
          <div className="ic-history-eyebrow">
            <BrainCircuit size={15} />
            INTELLIGENT FORECAST RECORDS
          </div>

          <h1>Prediction History</h1>

          <p>
            Review previous ATM forecasts, risk assessments and
            model execution records.
          </p>
        </div>

        <div className="ic-history-total">
          <Activity size={17} />
          <span>{total} Records</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ic-history-summary">
        <div className="ic-history-stat">
          <div className="ic-history-stat-icon blue">
            <Sparkles size={19} />
          </div>
          <div>
            <span>Total Predictions</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="ic-history-stat">
          <div className="ic-history-stat-icon green">
            <ShieldCheck size={19} />
          </div>
          <div>
            <span>Current Page</span>
            <strong>{currentPage} / {totalPages}</strong>
          </div>
        </div>

        <div className="ic-history-stat">
          <div className="ic-history-stat-icon amber">
            <Landmark size={19} />
          </div>
          <div>
            <span>Records Per Page</span>
            <strong>{pageSize}</strong>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="ic-history-filter-panel">
        <div className="ic-history-filter-heading">
          <div>
            <h3>Find Prediction Records</h3>
            <p>Search and filter your forecasting history</p>
          </div>
        </div>

        <div className="ic-history-filter-controls">
          <form
            onSubmit={handleSearchSubmit}
            className="ic-history-search-form"
          >
            <div className="ic-history-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ATM ID or location..."
              />
            </div>

            <button
              type="submit"
              className="ic-history-search-button"
            >
              Search
            </button>
          </form>

          <div className="ic-history-filter-actions">
            <select
              value={selectedRisk}
              onChange={e => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="ic-history-risk-select"
            >
              <option value="All Risk Levels">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <button
              onClick={handleReset}
              className="ic-history-reset-button"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Prediction Records */}
      <div className="ic-history-table-panel">

        <div className="ic-history-table-heading">
          <div>
            <h3>Forecast Records</h3>
            <p>Historical ATM prediction activity</p>
          </div>

          <div className="ic-history-table-label">
            <Calendar size={14} />
            Prediction Audit Log
          </div>
        </div>

        {loading ? (
          <div className="ic-history-state">
            <RefreshCw size={25} className="animate-spin" />
            <p>Loading prediction records...</p>
          </div>
        ) : error ? (
          <div className="ic-history-state error">
            <AlertTriangle size={26} />
            <p>{error}</p>

            <button
              onClick={loadPredictions}
              className="ic-history-reset-button"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="ic-history-state">
            <div className="ic-history-empty-icon">
              <Search size={27} />
            </div>

            <h3>No prediction records found</h3>
            <p>Try changing your search or risk filters.</p>

            <button
              onClick={handleReset}
              className="ic-history-reset-button"
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="ic-history-table-wrapper">
              <table className="ic-history-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>ATM ID</th>
                    <th>Predicted Demand</th>
                    <th>Current Balance</th>
                    <th>Risk Level</th>
                    <th>Recommended Refill</th>
                    <th>Details</th>
                  </tr>
                </thead>

                <tbody>
                  {predictions.map(p => (
                    <tr key={p.prediction_id}>
                      <td>
                        <div className="ic-history-date">
                          <Calendar size={14} />
                          {formatDateTime(p.prediction_time)}
                        </div>
                      </td>

                      <td>
                        <span className="ic-history-atm-id">
                          <Landmark size={14} />
                          {p.atm_id}
                        </span>
                      </td>

                      <td className="ic-history-demand">
                        {formatINR(p.predicted_demand)}
                      </td>

                      <td className="ic-history-balance">
                        {formatINR(p.current_balance)}
                      </td>

                      <td>
                        <RiskBadge risk={p.risk_level} />
                      </td>

                      <td>
                        <span className={
                          p.recommended_refill > 0
                            ? 'ic-history-refill required'
                            : 'ic-history-refill safe'
                        }>
                          {formatINR(p.recommended_refill)}
                        </span>
                      </td>

                      <td>
                        <button
                          className="ic-history-view-button"
                          onClick={() => setActiveModalPred(p)}
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ic-history-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={total}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                entityName="predictions"
              />
            </div>
          </>
        )}
      </div>

      {/* Prediction Detail Modal */}
      {activeModalPred && (
        <div
          className="ic-history-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="ic-history-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="ic-history-modal-header">
              <div className="ic-history-modal-title">
                <div className="ic-modal-icon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <h3>Prediction Audit Record</h3>
                  <p>{activeModalPred.atm_id}</p>
                </div>
              </div>

              <button
                className="ic-history-modal-close"
                onClick={closeModal}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="ic-history-modal-body">

              {/* Metadata */}
              <div className="ic-history-metadata">
                <div>
                  <span>Prediction ID</span>
                  <strong>{activeModalPred.prediction_id}</strong>
                </div>

                <div>
                  <span>Timestamp</span>
                  <strong>
                    {formatDateTime(activeModalPred.prediction_time)}
                  </strong>
                </div>

                <div>
                  <span>Model Version</span>
                  <strong>{activeModalPred.model_version}</strong>
                </div>

                <div>
                  <span>Forecast Horizon</span>
                  <strong>{activeModalPred.prediction_period}</strong>
                </div>
              </div>

              {/* Prediction Metrics */}
              <h4 className="ic-history-section-title">
                Forecast Summary
              </h4>

              <div className="ic-history-modal-metrics">
                <div className="ic-modal-metric blue">
                  <span>Predicted Demand</span>
                  <strong>
                    {formatINR(activeModalPred.predicted_demand)}
                  </strong>
                </div>

                <div className="ic-modal-metric neutral">
                  <span>Current Balance</span>
                  <strong>
                    {formatINR(activeModalPred.current_balance)}
                  </strong>
                </div>

                <div className="ic-modal-metric amber">
                  <span>Risk Level</span>
                  <strong>{activeModalPred.risk_level}</strong>
                </div>

                <div className="ic-modal-metric green">
                  <span>Recommended Refill</span>
                  <strong>
                    {formatINR(activeModalPred.recommended_refill)}
                  </strong>
                </div>
              </div>

              {/* Feature Snapshot */}
              {activeModalPred.feature_snapshot && (
                <div className="ic-history-feature-section">
                  <div className="ic-history-feature-heading">
                    <BrainCircuit size={17} />
                    <h4>Engineered Feature Snapshot</h4>
                  </div>

                  <p>
                    Feature values recorded during this prediction.
                  </p>

                  <pre>
                    {JSON.stringify(
                      activeModalPred.feature_snapshot,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            <div className="ic-history-modal-footer">
              <span>
                <ShieldCheck size={15} />
                IntelliCash Prediction Audit
              </span>

              <button
                onClick={closeModal}
                className="ic-history-close-button"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
