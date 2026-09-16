import React, { useState } from 'react';
import { api } from '../services/api';

const REASON_CODES = [
  { code: 'ETMW', label: 'ETMW - ENGG – Track Machine Working' },
  { code: 'EOMT', label: 'EOMT - ENGG – Material Train' },
  { code: 'ERRL', label: 'ERRL - ENGG – Renewal Rail Replacement' },
  { code: 'OTHR', label: 'OTHR - Others' },
];

export default function NewRequest({ department, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    block_section: '',
    line: '',
    work_location: '',
    reason_code: 'ETMW',
    reason_description: '',
    asset_impact: 'Medium',
    duration_min: '',
    due_date: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.block_section.trim()) {
      return 'Block Section is required.';
    }
    const durationNum = parseInt(formData.duration_min, 10);
    if (!durationNum || durationNum <= 0 || isNaN(durationNum)) {
      return 'Duration must be a positive number greater than 0.';
    }
    if (!formData.due_date) {
      return 'Due Date is required.';
    }
    if (!['TMS', 'TDMS', 'SMMS'].includes(department)) {
      return 'Invalid department. Must be TMS, TDMS, or SMMS.';
    }
    return null;
  };

  const handleSave = async (statusToSet) => {
    setErrorMessage(null);
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        department: department,
        block_section: formData.block_section.trim(),
        line: formData.line.trim() || null,
        work_location: formData.work_location.trim() || null,
        reason_code: formData.reason_code || null,
        reason_description: formData.reason_description.trim() || null,
        asset_impact: formData.asset_impact || null,
        duration_min: parseInt(formData.duration_min, 10),
        due_date: formData.due_date,
        status: statusToSet,
      };

      const created = await api.createRequest(payload);
      onSuccess(created.need_id, `Request #${created.need_id} successfully saved as ${statusToSet}!`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">New Maintenance Request</h2>
          <p className="page-description">
            Submitting on behalf of <strong>{department}</strong> department
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="form-card">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            {/* Department (read-only, auto-filled) */}
            <div className="form-group">
              <label className="form-label">
                Department <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={department}
                readOnly
                title="Department is automatically assigned based on your active selection"
              />
            </div>

            {/* Block Section */}
            <div className="form-group">
              <label className="form-label" htmlFor="block_section">
                Block Section <span className="required">*</span>
              </label>
              <input
                id="block_section"
                name="block_section"
                type="text"
                className="form-input"
                placeholder="e.g. Delhi - Ghaziabad"
                value={formData.block_section}
                onChange={handleChange}
                required
              />
            </div>

            {/* Line */}
            <div className="form-group">
              <label className="form-label" htmlFor="line">
                Line
              </label>
              <input
                id="line"
                name="line"
                type="text"
                className="form-input"
                placeholder="e.g. UP Main, DN Main, Single"
                value={formData.line}
                onChange={handleChange}
              />
            </div>

            {/* Work Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="work_location">
                Work Location
              </label>
              <input
                id="work_location"
                name="work_location"
                type="text"
                className="form-input"
                placeholder="e.g. KM 14/2 - 16/4 or Mast 22"
                value={formData.work_location}
                onChange={handleChange}
              />
            </div>

            {/* Reason Code */}
            <div className="form-group">
              <label className="form-label" htmlFor="reason_code">
                Reason Code <span className="required">*</span>
              </label>
              <select
                id="reason_code"
                name="reason_code"
                className="form-select"
                value={formData.reason_code}
                onChange={handleChange}
              >
                {REASON_CODES.map((rc) => (
                  <option key={rc.code} value={rc.code}>
                    {rc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Impact */}
            <div className="form-group">
              <label className="form-label" htmlFor="asset_impact">
                Asset Impact <span className="required">*</span>
              </label>
              <select
                id="asset_impact"
                name="asset_impact"
                className="form-select"
                value={formData.asset_impact}
                onChange={handleChange}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Duration (min) */}
            <div className="form-group">
              <label className="form-label" htmlFor="duration_min">
                Duration (minutes) <span className="required">*</span>
              </label>
              <input
                id="duration_min"
                name="duration_min"
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 120"
                value={formData.duration_min}
                onChange={handleChange}
                required
              />
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="due_date">
                Due Date <span className="required">*</span>
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                className="form-input"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Reason Description */}
            <div className="form-group full-width">
              <label className="form-label" htmlFor="reason_description">
                Reason Description
              </label>
              <textarea
                id="reason_description"
                name="reason_description"
                className="form-textarea"
                placeholder="Describe scope of maintenance work..."
                value={formData.reason_description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSave('DRAFT')}
              disabled={submitting}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSave('SUBMITTED')}
              disabled={submitting}
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
