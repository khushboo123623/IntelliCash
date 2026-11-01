
import React, { useEffect, useState } from 'react';
import {
  Search,
  RotateCcw,
  ExternalLink,
  RefreshCw,
  MapPin,
  Landmark,
  Wallet,
  Activity,
  Building2,
  SlidersHorizontal
} from 'lucide-react';

import { api } from '../lib/api';
import { ATM } from '../types';
import { formatINR } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';
import { AtmNetworkMap } from '../components/ui/AtmNetworkMap';
import { PageId } from '../components/layout/AppShell';

interface AtmNetworkPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

export const AtmNetworkPage: React.FC<AtmNetworkPageProps> = ({
  onNavigate
}) => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');

  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedRisk, setSelectedRisk] = useState<string>('All Risk Levels');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCities = async () => {
    try {
      const res = await api.getCities();
      setCities(res);
    } catch {
      // City filters remain usable with the default option.
    }
  };

  const loadAtms = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getAtms({
        search: appliedSearch.trim() || undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        risk_level:
          selectedRisk !== 'All Risk Levels' ? selectedRisk : undefined,
        status: selectedStatus !== 'All Status' ? selectedStatus : undefined,
        page: currentPage,
        page_size: pageSize
      });

      setAtms(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load ATM network data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadAtms();
  }, [
    currentPage,
    selectedCity,
    selectedRisk,
    selectedStatus,
    appliedSearch
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearch(search);
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedCity('All Cities');
    setSelectedRisk('All Risk Levels');
    setSelectedStatus('All Status');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadAtms();
  };

  const activeFilters = [
    selectedCity !== 'All Cities',
    selectedRisk !== 'All Risk Levels',
    selectedStatus !== 'All Status',
    appliedSearch.trim() !== ''
  ].filter(Boolean).length;

  return (
    <div className="ic-atm-page">

      {/* Header */}
      <div className="ic-atm-page-header">
        <div>
          <div className="ic-atm-eyebrow">
            <Activity size={14} />
            NETWORK MANAGEMENT
          </div>

          <h1>ATM Network</h1>

          <p>
            Monitor your ATM network, track cash availability and
            identify high-risk machines.
          </p>
        </div>

        <button
          className="ic-atm-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'ic-atm-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="ic-atm-stats">

        <div className="ic-atm-stat-card">
          <div className="ic-atm-stat-top">
            <span>Total ATMs</span>
            <div className="ic-atm-stat-icon blue">
              <Landmark size={19} />
            </div>
          </div>
          <h2>{loading ? '—' : total.toLocaleString('en-IN')}</h2>
          <p>Matching network records</p>
        </div>

        <div className="ic-atm-stat-card">
          <div className="ic-atm-stat-top">
            <span>Active Filters</span>
            <div className="ic-atm-stat-icon purple">
              <SlidersHorizontal size={19} />
            </div>
          </div>
          <h2>{activeFilters}</h2>
          <p>Currently applied filters</p>
        </div>

        <div className="ic-atm-stat-card">
          <div className="ic-atm-stat-top">
            <span>Available Cities</span>
            <div className="ic-atm-stat-icon cyan">
              <MapPin size={19} />
            </div>
          </div>
          <h2>{cities.length || '—'}</h2>
          <p>Cities in the available city list</p>
        </div>

        <div className="ic-atm-stat-card">
          <div className="ic-atm-stat-top">
            <span>Current Page</span>
            <div className="ic-atm-stat-icon green">
              <Building2 size={19} />
            </div>
          </div>
          <h2>{currentPage} / {totalPages}</h2>
          <p>Network records pagination</p>
        </div>

      </div>

      {/* Filters */}
      <div className="ic-atm-filter-panel">

        <div className="ic-atm-filter-heading">
          <div>
            <SlidersHorizontal size={17} />
            <h3>Filter ATM Network</h3>
          </div>

          <button
            className="ic-atm-reset"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>
        </div>

        <div className="ic-atm-filter-controls">

          <div className="ic-atm-filter-field">
            <label>City</label>
            <select
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All Cities">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="ic-atm-filter-field">
            <label>Risk Level</label>
            <select
              value={selectedRisk}
              onChange={e => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All Risk Levels">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div className="ic-atm-filter-field">
            <label>ATM Status</label>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <form
            className="ic-atm-search-form"
            onSubmit={handleSearchSubmit}
          >
            <label>Search ATM</label>
            <div className="ic-atm-search-box">
              <Search size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ATM ID or location..."
              />
              <button type="submit" aria-label="Search ATMs">
                <Search size={16} />
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Map */}
      <div className="ic-atm-map-section">
        <div className="ic-atm-section-heading">
          <div>
            <span className="ic-atm-section-icon">
              <MapPin size={18} />
            </span>
            <div>
              <h3>ATM Network Map</h3>
              <p>Explore ATM locations on the interactive map</p>
            </div>
          </div>
          <span className="ic-atm-map-count">
            {atms.length} ATM records on this page
          </span>
        </div>

        <div className="ic-atm-map-content">
          <AtmNetworkMap
            atms={atms}
            onSelectAtm={(id) => onNavigate('atm-details', id)}
          />
        </div>
      </div>

      {/* ATM Table */}
      <div className="ic-atm-table-panel">

        <div className="ic-atm-table-heading">
          <div>
            <h3>ATM Directory</h3>
            <p>Detailed information about your ATM network</p>
          </div>

          <span className="ic-atm-record-count">
            {total.toLocaleString('en-IN')} records
          </span>
        </div>

        {loading ? (
          <div className="ic-atm-state">
            <RefreshCw size={25} className="ic-atm-spin" />
            <p>Loading ATM network data...</p>
          </div>
        ) : error ? (
          <div className="ic-atm-state error">
            <Activity size={25} />
            <p>{error}</p>
            <button onClick={handleRefresh}>Try Again</button>
          </div>
        ) : atms.length === 0 ? (
          <div className="ic-atm-state">
            <Landmark size={30} />
            <h3>No ATMs Found</h3>
            <p>No ATMs match the selected filters.</p>
            <button onClick={handleReset}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="ic-atm-table-wrapper">
              <table className="ic-atm-table">
                <thead>
                  <tr>
                    <th>ATM ID</th>
                    <th>Location</th>
                    <th>City</th>
                    <th>Current Balance</th>
                    <th>Risk Level</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {atms.map(atm => (
                    <tr key={atm.atm_id}>
                      <td>
                        <div className="ic-atm-id">
                          <span className="ic-atm-id-icon">
                            <Landmark size={15} />
                          </span>
                          {atm.atm_id}
                        </div>
                      </td>

                      <td>
                        <div className="ic-atm-location">
                          <MapPin size={14} />
                          {atm.atm_name}
                        </div>
                      </td>

                      <td>{atm.city}</td>

                      <td>
                        <div className="ic-atm-balance">
                          <Wallet size={14} />
                          {formatINR(atm.current_balance)}
                        </div>
                      </td>

                      <td>
                        <RiskBadge risk={atm.risk_level} />
                      </td>

                      <td>
                        <span
                          className={
                            atm.status === 'Active'
                              ? 'ic-atm-status active'
                              : 'ic-atm-status maintenance'
                          }
                        >
                          <span className="ic-atm-status-dot" />
                          {atm.status || 'Active'}
                        </span>
                      </td>

                      <td>
                        <button
                          className="ic-atm-view-button"
                          onClick={() =>
                            onNavigate('atm-details', atm.atm_id)
                          }
                        >
                          View Details
                          <ExternalLink size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ic-atm-pagination">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalRecords={total}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                entityName="ATMs"
              />
            </div>
          </>
        )}

      </div>

      <div className="ic-atm-footer">
        <Activity size={14} />
        <span>
          ATM information is loaded from the IntelliCash backend.
        </span>
      </div>

    </div>
  );
};
