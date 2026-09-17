import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ department, onViewDetails, onNavigateNew }) {
  const [stats, setStats] = useState({ total_requests: 0, draft_requests: 0, submitted_requests: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [statsData, requestsData] = await Promise.all([
          api.getDepartmentStats(department),
          api.getRequests(department),
        ]);
        if (isMounted) {
          setStats(statsData);
          setRecentRequests(requestsData.slice(0, 5)); // Show up to 5 recent requests
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch dashboard data from server.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [department]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{department} Dashboard</h2>
          <p className="page-description">Overview of maintenance requests for {department}</p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateNew}>
          + New Request
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Hero Banner Card */}
      <div className="hero-card">
        <div className="hero-card-scrim">
          <div className="hero-content">
            <h3 className="hero-title">Indian Railways</h3>
            <p className="hero-subtitle">Connecting People, Powering Progress</p>
            <div className="hero-tricolor-accent" aria-hidden="true" />
          </div>
        </div>
        <div className="hero-tricolor-bottom" aria-hidden="true" />
      </div>

      {/* KPI Stats Cards - Horizontal layout with 48px circular badges */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-badge stat-icon-blue" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="13" y2="16" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-title">Total Requests</div>
            <div className="stat-value primary">{loading ? '...' : stats.total_requests}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge stat-icon-purple" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-title">Draft Requests</div>
            <div className="stat-value draft">{loading ? '...' : stats.draft_requests}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-badge stat-icon-green" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="stat-body">
            <div className="stat-title">Submitted Requests</div>
            <div className="stat-value submitted">{loading ? '...' : stats.submitted_requests}</div>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <div className="table-title-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gov-navy)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h3 className="table-title">Recent Requests</h3>
          </div>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">Loading maintenance requests...</div>
          ) : recentRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#A0AEC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="3" width="16" height="15" rx="3" />
                  <path d="M4 11h16" />
                  <circle cx="8" cy="15" r="1" />
                  <circle cx="16" cy="15" r="1" />
                  <path d="M2 19l3-1" />
                  <path d="M22 19l-3-1" />
                </svg>
              </div>
              <p>No requests found for {department}. Create a new request to get started.</p>
            </div>
          ) : (
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Need ID</th>
                  <th>Block Start</th>
                  <th>Block End</th>
                  <th>Line</th>
                  <th>Reason Code</th>
                  <th>Asset Impact</th>
                  <th>Duration</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr
                    key={req.need_id}
                    className="clickable-row"
                    onClick={() => onViewDetails(req.need_id)}
                  >
                    <td><strong>#{req.need_id}</strong></td>
                    <td>{req.block_start || '—'}</td>
                    <td>{req.block_end || '—'}</td>
                    <td>{req.line || '—'}</td>
                    <td><code>{req.reason_code || '—'}</code></td>
                    <td>
                      {req.asset_impact ? (
                        <span className={`impact-badge impact-${req.asset_impact}`}>
                          {req.asset_impact}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{req.duration_min} mins</td>
                    <td>{req.due_date}</td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
