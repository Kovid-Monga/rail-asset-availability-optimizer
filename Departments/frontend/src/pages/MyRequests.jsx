import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function MyRequests({ department, onViewDetails, onNavigateNew }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getRequests(department, statusFilter || undefined);
        if (isMounted) {
          setRequests(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch requests.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, [department, statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      let s = String(dateStr);
      if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
        s += 'Z';
      }
      const d = new Date(s);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{department} Maintenance Requests</h2>
          <p className="page-description">Showing all maintenance needs submitted or drafted by {department}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
          <button className="btn btn-primary" onClick={onNavigateNew}>
            + New Request
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="table-card">
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">Loading requests from PostgreSQL...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">No requests found for {department}.</div>
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
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.need_id}>
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
                    <td>{req.duration_min ? `${(req.duration_min / 60) % 1 === 0 ? req.duration_min / 60 : (req.duration_min / 60).toFixed(1)} hrs` : '—'}</td>
                    <td>{req.due_date}</td>
                    <td><StatusBadge status={req.status} /></td>
                    <td>{formatDate(req.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => onViewDetails(req.need_id)}
                      >
                        View Details
                      </button>
                    </td>
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
