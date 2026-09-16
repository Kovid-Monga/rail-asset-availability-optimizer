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

      {/* KPI Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Requests</div>
          <div className="stat-value primary">{loading ? '...' : stats.total_requests}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Draft Requests</div>
          <div className="stat-value draft">{loading ? '...' : stats.draft_requests}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Submitted Requests</div>
          <div className="stat-value submitted">{loading ? '...' : stats.submitted_requests}</div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="table-card">
        <div className="table-header-bar">
          <h3 className="table-title">Recent Requests</h3>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">Loading maintenance requests...</div>
          ) : recentRequests.length === 0 ? (
            <div className="empty-state">No requests found for {department}. Create a new request to get started.</div>
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
