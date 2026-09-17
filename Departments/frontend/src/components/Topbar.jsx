import React from 'react';

const DEPT_NAMES = {
  TMS: 'Track Management System',
  TDMS: 'Traction Distribution Management System',
  SMMS: 'Signal & Telecom Management System',
};

export default function Topbar({ department, onDepartmentChange }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">
          {/* Generic railway mark for BDMS */}
          <div className="brand-badge-wrapper">
            <div className="brand-badge" title="BDMS Portal">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2" />
                <path d="M16 2V7 M16 25V30 M2 16H7 M25 16H30 M6 6L9.5 9.5 M22.5 22.5L26 26 M6 26L9.5 22.5 M22.5 9.5L26 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M11 16L16 11L21 16L16 21Z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
            <span className="brand-badge-label">BDMS</span>
          </div>

          <div className="topbar-divider" aria-hidden="true" />

          {/* National Ashoka Emblem */}
          <div className="topbar-emblem-wrap">
            <img
              src="/emblem.png"
              alt="State Emblem of India"
              className="topbar-emblem"
            />
          </div>

          {/* Two-line bilingual lockup */}
          <div className="brand-lockup">
            <span className="lockup-hindi">भारतीय रेल</span>
            <span className="lockup-eng">INDIAN RAILWAYS</span>
          </div>

          <div className="topbar-divider" aria-hidden="true" />

          {/* Portal Title & Subtitle */}
          <div className="topbar-title-group">
            <h1 className="brand-title">Block Division Management System</h1>
            <span className="brand-subtitle">{DEPT_NAMES[department] || department}</span>
          </div>
        </div>

        {/* Photo area bleeding to right */}
        <div className="topbar-photo" aria-hidden="true" />

        {/* Right side floating department selector */}
        <div className="topbar-actions">
          <div className="department-selector-wrap">
            <label htmlFor="department-select" className="dept-label">
              Division:
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

      {/* Fixed 3px Tricolor strip right below topbar */}
      <div className="gov-tricolor-strip" aria-hidden="true" />
    </>
  );
}
