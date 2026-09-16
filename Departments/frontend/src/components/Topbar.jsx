import React from 'react';

const DEPT_NAMES = {
  TMS: 'Track Management System',
  TDMS: 'Traction Distribution Management System',
  SMMS: 'Signal & Telecom Management System',
};

export default function Topbar({ department, onDepartmentChange }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="brand-badge">BDMS</div>
        <h1 className="brand-title">Department Portal</h1>
        <span className="brand-subtitle">{DEPT_NAMES[department] || department}</span>
      </div>

      <div className="topbar-actions">
        <div className="department-selector-wrap">
          <label htmlFor="department-select" className="dept-label">
            Department:
          </label>
          <select
            id="department-select"
            className="dept-dropdown"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="TMS">TMS</option>
            <option value="TDMS">TDMS</option>
            <option value="SMMS">SMMS</option>
          </select>
        </div>
      </div>
    </header>
  );
}
