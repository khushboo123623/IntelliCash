
import React, { useEffect, useState } from 'react';
import {
  Search,
  RotateCcw,
  Database,
  Table,
  RefreshCw,
  FileText,
  Activity,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
} from 'lucide-react';

import { api } from '../lib/api';
import { Transaction, FeatureRecord, ATM } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { Pagination } from '../components/ui/Pagination';

export const DataExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'features'>('transactions');

  const [atms, setAtms] = useState<ATM[]>([]);
  const [selectedAtm, setSelectedAtm] = useState<string>('All ATMs');

  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');

  // Transaction data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState<number>(0);
  const [txTotalPages, setTxTotalPages] = useState<number>(1);
  const [txPage, setTxPage] = useState<number>(1);

  // Engineered feature data
  const [features, setFeatures] = useState<FeatureRecord[]>([]);
  const [featTotal, setFeatTotal] = useState<number>(0);
  const [featTotalPages, setFeatTotalPages] = useState<number>(1);
  const [featPage, setFeatPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAtms = async () => {
    try {
      const res = await api.getAtms({ page: 1, page_size: 100 });
      setAtms(res.items);
    } catch (err) {
      console.error('Unable to load ATMs:', err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getTransactions({
        search: appliedSearch.trim() || undefined,
        atm_id: selectedAtm !== 'All ATMs' ? selectedAtm : undefined,
        page: txPage,
        page_size: 5,
      });

      setTransactions(res.items);
      setTxTotal(res.total);
      setTxTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.getEngineeredFeatures({
        atm_id: selectedAtm !== 'All ATMs' ? selectedAtm : undefined,
        page: featPage,
        page_size: 5,
      });

      setFeatures(res.items);
      setFeatTotal(res.total);
      setFeatTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load engineered features.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAtms();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else {
      loadFeatures();
    }
  }, [activeTab, txPage, featPage, selectedAtm, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTxPage(1);
    setAppliedSearch(search.trim());
  };

  const handleReset = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedAtm('All ATMs');
    setTxPage(1);
    setFeatPage(1);
  };

  const handleTabChange = (tab: 'transactions' | 'features') => {
    setActiveTab(tab);
  };

  const currentTotal =
    activeTab === 'transactions' ? txTotal : featTotal;

  const currentRecords =
    activeTab === 'transactions' ? transactions.length : features.length;

  return (
    <div className="ic-data-page">

      {/* Header */}
      <div className="ic-data-header">
        <div>
          <div className="ic-data-eyebrow">
            <Database size={14} />
            DATA MANAGEMENT / EXPLORATION
          </div>

          <h1>Data Explorer</h1>

          <p>
            Explore ATM transaction records and machine learning features
            powering cash demand predictions.
          </p>
        </div>

        <button
          className="ic-data-refresh"
          onClick={() => {
            if (activeTab === 'transactions') {
              loadTransactions();
            } else {
              loadFeatures();
            }
          }}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'ic-data-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* Overview cards */}
      <div className="ic-data-stats">

        <div className="ic-data-stat-card">
          <div className="ic-data-stat-icon blue">
            <Database size={21} />
          </div>
          <div>
            <span>Available ATMs</span>
            <h2>{atms.length}</h2>
            <small>Loaded ATM records</small>
          </div>
        </div>

        <div className="ic-data-stat-card">
          <div className="ic-data-stat-icon purple">
            <Table size={21} />
          </div>
          <div>
            <span>Transaction Records</span>
            <h2>{activeTab === 'transactions' ? txTotal : '—'}</h2>
            <small>Backend record count</small>
          </div>
        </div>

        <div className="ic-data-stat-card">
          <div className="ic-data-stat-icon green">
            <Layers size={21} />
          </div>
          <div>
            <span>Engineered Features</span>
            <h2>{activeTab === 'features' ? featTotal : '—'}</h2>
            <small>Backend record count</small>
          </div>
        </div>

        <div className="ic-data-stat-card">
          <div className="ic-data-stat-icon amber">
            <Activity size={21} />
          </div>
          <div>
            <span>Displayed Records</span>
            <h2>{currentRecords}</h2>
            <small>Records on current page</small>
          </div>
        </div>

      </div>

      {/* Data tabs */}
      <div className="ic-data-tabs">

        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => handleTabChange('transactions')}
        >
          <Table size={17} />
          Transactions Data
          <span className="ic-data-tab-count">{txTotal}</span>
        </button>

        <button
          className={activeTab === 'features' ? 'active' : ''}
          onClick={() => handleTabChange('features')}
        >
          <Database size={17} />
          Engineered Features
          <span className="ic-data-tab-count">{featTotal}</span>
        </button>

      </div>

      {/* Filters */}
      <div className="ic-data-filter-panel">

        <div className="ic-data-filter-heading">
          <div className="ic-data-filter-icon">
            <Search size={17} />
          </div>

          <div>
            <h3>Explore Records</h3>
            <p>Filter data by ATM and search transaction records.</p>
          </div>
        </div>

        <div className="ic-data-filter-controls">

          <select
            value={selectedAtm}
            onChange={(e) => {
              setSelectedAtm(e.target.value);
              setTxPage(1);
              setFeatPage(1);
            }}
            className="ic-data-select"
          >
            <option value="All ATMs">All ATMs</option>

            {atms.map((atm) => (
              <option key={atm.atm_id} value={atm.atm_id}>
                {atm.atm_id} - {atm.atm_name}
              </option>
            ))}
          </select>

          {activeTab === 'transactions' && (
            <form
              onSubmit={handleSearchSubmit}
              className="ic-data-search-form"
            >
              <Search size={16} />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
              />

              <button type="submit">Search</button>
            </form>
          )}

          <button
            onClick={handleReset}
            className="ic-data-reset"
          >
            <RotateCcw size={14} />
            Reset Filters
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="ic-data-table-panel">

        <div className="ic-data-table-header">
          <div>
            <div className="ic-data-table-title">
              {activeTab === 'transactions' ? (
                <ArrowDownToLine size={19} />
              ) : (
                <Layers size={19} />
              )}

              <h2>
                {activeTab === 'transactions'
                  ? 'Transaction Records'
                  : 'Engineered Feature Records'}
              </h2>
            </div>

            <p>
              {activeTab === 'transactions'
                ? 'Detailed ATM withdrawal and deposit transaction history.'
                : 'Historical and engineered variables used by the forecasting model.'}
            </p>
          </div>

          <div className="ic-data-record-badge">
            {currentTotal} Total Records
          </div>
        </div>

        {loading ? (
          <div className="ic-data-state">
            <RefreshCw size={27} className="ic-data-spin" />
            <p>Loading data records...</p>
          </div>
        ) : error ? (
          <div className="ic-data-state error">
            <FileText size={28} />
            <p>{error}</p>
            <button
              onClick={() => {
                if (activeTab === 'transactions') {
                  loadTransactions();
                } else {
                  loadFeatures();
                }
              }}
            >
              Try Again
            </button>
          </div>
        ) : activeTab === 'transactions' ? (
          <>
            {transactions.length === 0 ? (
              <div className="ic-data-state">
                <Database size={30} />
                <h3>No transaction records found</h3>
                <p>Try another ATM or search keyword.</p>
              </div>
            ) : (
              <div className="ic-data-table-wrapper">
                <table className="ic-data-table">
                  <thead>
                    <tr>
                      <th>TRANSACTION DATE</th>
                      <th>ATM ID</th>
                      <th>TRANSACTION TYPE</th>
                      <th>AMOUNT</th>
                      <th>BALANCE AFTER</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.transaction_id}>
                        <td>
                          <div className="ic-data-date">
                            {formatDateTime(t.transaction_time)}
                          </div>
                        </td>

                        <td>
                          <strong className="ic-data-atm-id">
                            {t.atm_id}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              t.transaction_type === 'Withdrawal'
                                ? 'ic-data-type withdrawal'
                                : 'ic-data-type deposit'
                            }
                          >
                            {t.transaction_type === 'Withdrawal' ? (
                              <ArrowUpFromLine size={13} />
                            ) : (
                              <ArrowDownToLine size={13} />
                            )}
                            {t.transaction_type}
                          </span>
                        </td>

                        <td>
                          <strong className="ic-data-amount">
                            {formatINR(t.amount)}
                          </strong>
                        </td>

                        <td>
                          <span className="ic-data-balance">
                            {formatINR(t.balance_after)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="ic-data-pagination">
              <Pagination
                currentPage={txPage}
                totalPages={txTotalPages}
                totalRecords={txTotal}
                pageSize={5}
                onPageChange={setTxPage}
                entityName="records"
              />
            </div>
          </>
        ) : (
          <>
            {features.length === 0 ? (
              <div className="ic-data-state">
                <Layers size={30} />
                <h3>No engineered features found</h3>
                <p>There are no feature records for this selection.</p>
              </div>
            ) : (
              <div className="ic-data-table-wrapper">
                <table className="ic-data-table ic-feature-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ATM</th>
                      <th>HOUR</th>
                      <th>DAY OF WEEK</th>
                      <th>WEEKEND</th>
                      <th>HOLIDAY</th>
                      <th>TOTAL BALANCE</th>
                      <th>OUTCOMES</th>
                      <th>TOTAL TX</th>
                      <th>PREVIOUS DEMAND</th>
                      <th>PREVIOUS TX COUNT</th>
                      <th>ROLLING MEAN 3</th>
                      <th>TARGET DEMAND</th>
                    </tr>
                  </thead>

                  <tbody>
                    {features.map((f) => (
                      <tr key={f.id}>
                        <td>{f.id}</td>

                        <td>
                          <strong className="ic-data-atm-id">
                            {f.atm_id}
                          </strong>
                        </td>

                        <td>{f.hour}</td>
                        <td>{f.day_of_week}</td>
                        <td>{f.is_weekend}</td>
                        <td>{f.is_holiday}</td>

                        <td>{formatINR(f.totalBalance)}</td>
                        <td>{f.numberOutcomeTransaction}</td>
                        <td>{f.totalNumberTransaction}</td>
                        <td>{formatINR(f.previous_demand)}</td>
                        <td>{f.previous_transaction_count}</td>
                        <td>{formatINR(f.rolling_mean_3)}</td>

                        <td>
                          <strong className="ic-data-target">
                            {formatINR(f.target_demand)}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="ic-data-pagination">
              <Pagination
                currentPage={featPage}
                totalPages={featTotalPages}
                totalRecords={featTotal}
                pageSize={5}
                onPageChange={setFeatPage}
                entityName="engineered features"
              />
            </div>
          </>
        )}

      </div>

      {/* Information footer */}
      <div className="ic-data-info">
        <Database size={18} />
        <span>
          Data Explorer displays records retrieved from the IntelliCash
          backend. Engineered features provide historical inputs for
          machine learning forecasts.
        </span>
      </div>

    </div>
  );
};
