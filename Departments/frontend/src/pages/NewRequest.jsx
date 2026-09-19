import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const DEPARTMENT_REASON_CODES = {
  TMS: [
    { code: 'ETMW', label: 'ETMW - Track Machine Working' },
    { code: 'ERRL', label: 'ERRL - Renewal Rail Replacement' },
    { code: 'ETMR', label: 'ETMR - Track Maintenance & Repair' },
    { code: 'OTHR', label: 'OTHR - Others' },
  ],
  TDMS: [
    { code: 'TPWR', label: 'TPWR - Traction Power Supply' },
    { code: 'TOHE', label: 'TOHE - Overhead Equipment (OHE)' },
    { code: 'TREP', label: 'TREP - Traction Repair' },
    { code: 'OTHR', label: 'OTHR - Others' },
  ],
  SMMS: [
    { code: 'SSIG', label: 'SSIG - Signal Maintenance' },
    { code: 'STEL', label: 'STEL - Telecom Equipment' },
    { code: 'SREP', label: 'SREP - Signal & Telecom Repair' },
    { code: 'OTHR', label: 'OTHR - Others' },
  ],
};

export default function NewRequest({ department, onSuccess, onCancel }) {
  const currentReasonCodes = DEPARTMENT_REASON_CODES[department] || DEPARTMENT_REASON_CODES.TMS;

  const [formData, setFormData] = useState({
    block_start: '',
    block_end: '',
    line: '',
    work_location: '',
    reason_code: currentReasonCodes[0].code,
    reason_description: '',
    asset_impact: 'Medium',
    duration_hours: '',
    due_date: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Update reason_code when department changes
  useEffect(() => {
    const codes = DEPARTMENT_REASON_CODES[department] || DEPARTMENT_REASON_CODES.TMS;
    setFormData((prev) => ({
      ...prev,
      reason_code: codes[0].code,
    }));
  }, [department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.block_start.trim()) {
      return 'Block Start is required.';
    }
    if (!formData.block_end.trim()) {
      return 'Block End is required.';
    }
    const durationNum = parseFloat(formData.duration_hours);
    if (!durationNum || durationNum <= 0 || isNaN(durationNum)) {
      return 'Duration must be a positive number greater than 0 hours.';
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
        block_start: formData.block_start.trim(),
        block_end: formData.block_end.trim(),
        line: formData.line.trim() || null,
        work_location: formData.work_location.trim() || null,
        reason_code: formData.reason_code || null,
        reason_description: formData.reason_description.trim() || null,
        asset_impact: formData.asset_impact || null,
        duration_min: Math.round(parseFloat(formData.duration_hours) * 60),
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

            {/* Block Start */}
            <div className="form-group">
              <label className="form-label" htmlFor="block_start">
                Block Start <span className="required">*</span>
              </label>
              <input
                id="block_start"
                name="block_start"
                type="text"
                className="form-input"
                placeholder="e.g. Delhi"
                value={formData.block_start}
                onChange={handleChange}
                required
              />
            </div>

            {/* Block End */}
            <div className="form-group">
              <label className="form-label" htmlFor="block_end">
                Block End <span className="required">*</span>
              </label>
              <input
                id="block_end"
                name="block_end"
                type="text"
                className="form-input"
                placeholder="e.g. Ghaziabad"
                value={formData.block_end}
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

            {/* Reason Code (Department-specific) */}
            <div className="form-group">
              <label className="form-label" htmlFor="reason_code">
                Reason Code ({department}) <span className="required">*</span>
              </label>
              <select
                id="reason_code"
                name="reason_code"
                className="form-select"
                value={formData.reason_code}
                onChange={handleChange}
              >
                {currentReasonCodes.map((rc) => (
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

            {/* Duration (hours) */}
            <div className="form-group">
              <label className="form-label" htmlFor="duration_hours">
                Duration (hours) <span className="required">*</span>
              </label>
              <input
                id="duration_hours"
                name="duration_hours"
                type="number"
                step="any"
                min="0.1"
                className="form-input"
                placeholder="e.g. 2 or 1.5"
                value={formData.duration_hours}
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
