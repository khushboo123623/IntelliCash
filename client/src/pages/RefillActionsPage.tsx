
import React, { useEffect, useState } from 'react';
import {
  Search,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Truck,
  MapPin,
  Wallet,
  Activity,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

import { api } from '../lib/api';
import { RefillRecommendation } from '../types';
import { formatINR } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';
import { PageId } from '../components/layout/AppShell';

interface RefillActionsPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

export const RefillActionsPage: React.FC<RefillActionsPageProps> = ({
  onNavigate,
}) => {
  const [refills, setRefills] = useState<RefillRecommendation[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All Risk Levels');
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCities = async () => {
    try {
      const res = await api.getCities();
      setCities(res);
    } catch (err) {
      console.error('Unable to load cities:', err);
    }
  };

  const loadRefills = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getRefills({
        risk_level:
          selectedRisk !== 'All Risk Levels' ? selectedRisk : undefined,
        review_status: selectedStatus !== 'All' ? selectedStatus : undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        search: appliedSearch.trim() || undefined,
        page: currentPage,
        page_size: pageSize,
      });

      setRefills(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load refill recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadRefills();
  }, [currentPage, selectedRisk, selectedStatus, selectedCity, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(search.trim());
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedRisk('All Risk Levels');
    setSelectedStatus('Pending');
    setSelectedCity('All Cities');
    setCurrentPage(1);
  };

  const handleMarkReviewed = async (predictionId: string) => {
    setUpdatingId(predictionId);

    try {
      await api.updateRefillReview(predictionId, 'Reviewed');
      await loadRefills();
    } catch (err: any) {
      alert(`Failed to update review status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = refills.filter(
    (r) => r.review_status === 'Pending'
  ).length;

  const reviewedCount = refills.filter(
    (r) => r.review_status === 'Reviewed'
  ).length;

  const highRiskCount = refills.filter(
    (r) => r.risk_level === 'HIGH'
  ).length;

  return (
    <div className="ic-refill-page">

      {/* Page Header */}
      <div className="ic-refill-header">
        <div>
          <div className="ic-refill-eyebrow">
            <Activity size={14} />
            CASH OPERATIONS / REFILL MANAGEMENT
          </div>

          <h1>Refill Recommendations</h1>

          <p>
            Monitor ATM cash requirements and manage replenishment priorities.
          </p>
        </div>

        <button
          className="ic-refill-refresh"
          onClick={loadRefills}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'ic-refill-spinning' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="ic-refill-summary">

        <div className="ic-refill-summary-card">
          <div className="ic-refill-summary-icon blue">
            <Truck size={21} />
          </div>
          <div>
            <span>Total Recommendations</span>
            <h2>{total}</h2>
            <small>Available records</small>
          </div>
        </div>

        <div className="ic-refill-summary-card">
          <div className="ic-refill-summary-icon amber">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>Pending Review</span>
            <h2>{pendingCount}</h2>
            <small>On current page</small>
          </div>
        </div>

        <div className="ic-refill-summary-card">
          <div className="ic-refill-summary-icon green">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Reviewed</span>
            <h2>{reviewedCount}</h2>
            <small>On current page</small>
          </div>
        </div>

        <div className="ic-refill-summary-card">
          <div className="ic-refill-summary-icon red">
            <Activity size={21} />
          </div>
          <div>
            <span>High Risk</span>
            <h2>{highRiskCount}</h2>
            <small>On current page</small>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="ic-refill-filter-panel">

        <div className="ic-refill-filter-title">
          <div className="ic-refill-filter-icon">
            <Filter size={17} />
          </div>

          <div>
            <h3>Filter Recommendations</h3>
            <p>Find specific ATMs and review their refill status.</p>
          </div>
        </div>

        <div className="ic-refill-filter-controls">

          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="ic-refill-select"
          >
            <option value="All Risk Levels">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="ic-refill-select"
          >
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="All">All Status</option>
          </select>

          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setCurrentPage(1);
            }}
            className="ic-refill-select"
          >
            <option value="All Cities">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            onClick={handleReset}
            className="ic-refill-reset"
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className="ic-refill-search-form"
          >
            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ATM ID or location..."
            />

            <button type="submit">Search</button>
          </form>

        </div>
      </div>

      {/* Recommendations Table */}
      <div className="ic-refill-table-panel">

        <div className="ic-refill-table-header">
          <div>
            <h2>ATM Replenishment Queue</h2>
            <p>
              AI-generated cash refill recommendations for ATM locations.
            </p>
          </div>

          <div className="ic-refill-record-count">
            {total} Records
          </div>
        </div>

        {loading ? (
          <div className="ic-refill-state">
            <RefreshCw size={26} className="ic-refill-spinning" />
            <p>Loading refill recommendations...</p>
          </div>
        ) : error ? (
          <div className="ic-refill-state error">
            <AlertTriangle size={27} />
            <p>{error}</p>
            <button onClick={loadRefills}>Try Again</button>
          </div>
        ) : refills.length === 0 ? (
          <div className="ic-refill-state">
            <Truck size={32} />
            <h3>No recommendations found</h3>
            <p>Try changing the selected filters or search keyword.</p>
            <button onClick={handleReset}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="ic-refill-table-wrapper">
              <table className="ic-refill-table">
                <thead>
                  <tr>
                    <th>ATM DETAILS</th>
                    <th>CURRENT BALANCE</th>
                    <th>PREDICTED DEMAND</th>
                    <th>RECOMMENDED REFILL</th>
                    <th>PRIORITY</th>
                    <th>REVIEW STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {refills.map((r) => (
                    <tr key={r.prediction_id}>
                      <td>
                        <div className="ic-refill-atm-details">
                          <div className="ic-refill-atm-icon">
                            <MapPin size={17} />
                          </div>

                          <div>
                            <strong>{r.atm_id}</strong>
                            <span>
                              {r.atm_name
                                ? `${r.atm_name}, ${r.city}`
                                : r.atm_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="ic-refill-balance">
                          {formatINR(r.current_balance)}
                        </span>
                      </td>

                      <td>
                        <span className="ic-refill-demand">
                          {formatINR(r.predicted_demand)}
                        </span>
                      </td>

                      <td>
                        <div className="ic-refill-recommended">
                          <Wallet size={15} />
                          {formatINR(r.recommended_refill)}
                        </div>
                      </td>

                      <td>
                        <RiskBadge risk={r.risk_level} />
                      </td>

                      <td>
                        <span
                          className={
                            r.review_status === 'Reviewed'
                              ? 'ic-refill-status reviewed'
                              : 'ic-refill-status pending'
                          }
                        >
                          {r.review_status === 'Reviewed' ? (
                            <CheckCircle size={13} />
                          ) : (
                            <AlertTriangle size={13} />
                          )}

                          {r.review_status}
                        </span>
                      </td>

                      <td>
                        {r.review_status === 'Pending' ? (
                          <button
                            onClick={() => handleMarkReviewed(r.prediction_id)}
                            disabled={updatingId === r.prediction_id}
                            className="ic-refill-review-button"
                          >
                            {updatingId === r.prediction_id ? (
                              <RefreshCw size={14} className="ic-refill-spinning" />
                            ) : (
                              <CheckCircle size={14} />
                            )}

                            {updatingId === r.prediction_id
                              ? 'Saving...'
                              : 'Mark Reviewed'}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onNavigate('atm-details', r.atm_id)
                            }
                            className="ic-refill-view-button"
                          >
                            View Details
                            <ArrowUpRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ic-refill-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={total}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                entityName="recommendations"
              />
            </div>
          </>
        )}
      </div>

      {/* Footer Note */}
      <div className="ic-refill-info">
        <Wallet size={18} />
        <span>
          Review AI-generated refill recommendations before taking operational
          action. Refill amounts are based on the available prediction records.
        </span>
      </div>

    </div>
  );
};
