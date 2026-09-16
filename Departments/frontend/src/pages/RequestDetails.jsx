import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { DEPARTMENT_REASON_CODES } from './NewRequest';

export default function RequestDetails({ needId, onBack, onDeleteSuccess }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields state
  const [formData, setFormData] = useState({
    block_start: '',
    block_end: '',
    line: '',
    work_location: '',
    reason_code: '',
    reason_description: '',
    asset_impact: 'Medium',
    duration_min: '',
    due_date: '',
  });

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRequestById(needId);
      setRequest(data);
      const codes = DEPARTMENT_REASON_CODES[data.department] || DEPARTMENT_REASON_CODES.TMS;
      setFormData({
        block_start: data.block_start || '',
        block_end: data.block_end || '',
        line: data.line || '',
        work_location: data.work_location || '',
        reason_code: data.reason_code || codes[0].code,
        reason_description: data.reason_description || '',
        asset_impact: data.asset_impact || 'Medium',
        duration_min: data.duration_min || '',
        due_date: data.due_date || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [needId]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    try {
      let s = String(dateStr);
      if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
        s += 'Z';
      }
      const d = new Date(s);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!formData.block_start.trim()) {
      setError('Block Start is required.');
      return;
    }
    if (!formData.block_end.trim()) {
      setError('Block End is required.');
      return;
    }
    const durationNum = parseInt(formData.duration_min, 10);
    if (!durationNum || durationNum <= 0) {
      setError('Duration must be a positive number.');
      return;
    }
    if (!formData.due_date) {
      setError('Due date is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        block_start: formData.block_start.trim(),
        block_end: formData.block_end.trim(),
        line: formData.line.trim() || null,
        work_location: formData.work_location.trim() || null,
        reason_code: formData.reason_code || null,
        reason_description: formData.reason_description.trim() || null,
        asset_impact: formData.asset_impact || null,
        duration_min: durationNum,
        due_date: formData.due_date,
      };

      const updated = await api.updateRequest(needId, payload);
      setRequest(updated);
      setIsEditing(false);
      setSuccessMsg('Request updated successfully in PostgreSQL.');
    } catch (err) {
      setError(err.message || 'Failed to update request.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDraft = async () => {
    if (!window.confirm('Submit this maintenance request now?')) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await api.submitRequest(needId);
      setRequest(updated);
      setSuccessMsg('Request successfully submitted!');
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!window.confirm(`Are you sure you want to delete draft request #${needId}? This action cannot be undone.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.deleteRequest(needId);
      if (onDeleteSuccess) {
        onDeleteSuccess(needId, `Draft request #${needId} deleted successfully.`);
      } else {
        onBack();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete draft request.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading request details from PostgreSQL...</div>;
  }

  if (error && !request) {
    return (
      <div>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  const deptCodes = (request && DEPARTMENT_REASON_CODES[request.department]) || DEPARTMENT_REASON_CODES.TMS;

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary"
            style={{ marginBottom: '12px', padding: '4px 10px', fontSize: '13px' }}
            onClick={onBack}
          >
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="page-title">Maintenance Need #{request.need_id}</h2>
            <StatusBadge status={request.status} />
          </div>
          <p className="page-description">Department: <strong>{request.department}</strong></p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {request.status === 'DRAFT' && !isEditing && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setIsEditing(true);
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Edit Request
            </button>
          )}

          {request.status === 'DRAFT' && !isEditing && (
            <button
              className="btn btn-danger"
              onClick={handleDeleteDraft}
              disabled={saving}
            >
              Delete Draft
            </button>
          )}

          {request.status === 'DRAFT' && !isEditing && (
            <button
              className="btn btn-primary"
              onClick={handleSubmitDraft}
              disabled={saving}
            >
              Submit Request
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
        </div>
      )}

      {isEditing ? (
        /* Edit Mode Form */
        <div className="form-card">
          <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
            Edit Request #{request.need_id}
          </h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" className="form-input" value={request.department} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Block Start <span className="required">*</span>
                </label>
                <input
                  name="block_start"
                  type="text"
                  className="form-input"
                  value={formData.block_start}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Block End <span className="required">*</span>
                </label>
                <input
                  name="block_end"
                  type="text"
                  className="form-input"
                  value={formData.block_end}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Line</label>
                <input
                  name="line"
                  type="text"
                  className="form-input"
                  value={formData.line}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Location</label>
                <input
                  name="work_location"
                  type="text"
                  className="form-input"
                  value={formData.work_location}
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason Code ({request.department})</label>
                <select
                  name="reason_code"
                  className="form-select"
                  value={formData.reason_code}
                  onChange={handleEditChange}
                >
                  {deptCodes.map((rc) => (
                    <option key={rc.code} value={rc.code}>
                      {rc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Asset Impact</label>
                <select
                  name="asset_impact"
                  className="form-select"
                  value={formData.asset_impact}
                  onChange={handleEditChange}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duration (minutes) <span className="required">*</span>
                </label>
                <input
                  name="duration_min"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.duration_min}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Due Date <span className="required">*</span>
                </label>
                <input
                  name="due_date"
                  type="date"
                  className="form-input"
                  value={formData.due_date}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Reason Description</label>
                <textarea
                  name="reason_description"
                  className="form-textarea"
                  value={formData.reason_description}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="form-actions" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteDraft}
                disabled={saving}
              >
                Delete Draft
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Read Details View */
        <div className="details-card">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Need ID</span>
              <span className="detail-value">#{request.need_id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Department</span>
              <span className="detail-value">{request.department}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Block Start</span>
              <span className="detail-value">{request.block_start || '—'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Block End</span>
              <span className="detail-value">{request.block_end || '—'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Line</span>
              <span className="detail-value">{request.line || '—'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Work Location</span>
              <span className="detail-value">{request.work_location || '—'}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Reason Code</span>
              <span className="detail-value">
                <code>{request.reason_code || '—'}</code>
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Asset Impact</span>
              <span className="detail-value">
                {request.asset_impact ? (
                  <span className={`impact-badge impact-${request.asset_impact}`}>
                    {request.asset_impact}
                  </span>
                ) : '—'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Duration</span>
              <span className="detail-value">{request.duration_min} minutes</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Due Date</span>
              <span className="detail-value">{request.due_date}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                <StatusBadge status={request.status} />
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">
                {formatDateTime(request.created_at)}
              </span>
            </div>

            <div className="detail-item full-width">
              <span className="detail-label">Reason Description</span>
              <p className="detail-value" style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                {request.reason_description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
