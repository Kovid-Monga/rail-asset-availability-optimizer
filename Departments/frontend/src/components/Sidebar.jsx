import React from 'react';

export default function Sidebar({ currentPage, onNavigate, department }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: 'requests',
      label: 'My Requests',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
        </svg>
      ),
    },
    {
      id: 'new',
      label: 'New Request',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Spoked Wheel & Tracks Watermark */}
      <div className="sidebar-watermark" aria-hidden="true">
        <svg width="150" height="180" viewBox="0 0 150 180" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wheel outer rings */}
          <circle cx="75" cy="65" r="48" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" />
          <circle cx="75" cy="65" r="42" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="75" cy="65" r="14" stroke="currentColor" strokeWidth="2" />
          <circle cx="75" cy="65" r="5" fill="currentColor" />
          {/* 16 Wheel spokes */}
          <g stroke="currentColor" strokeWidth="1.2">
            <line x1="75" y1="23" x2="75" y2="107" />
            <line x1="33" y1="65" x2="117" y2="65" />
            <line x1="45" y1="35" x2="105" y2="95" />
            <line x1="45" y1="95" x2="105" y2="35" />
            <line x1="37" y1="49" x2="113" y2="81" />
            <line x1="37" y1="81" x2="113" y2="49" />
            <line x1="59" y1="27" x2="91" y2="103" />
            <line x1="91" y1="27" x2="59" y2="103" />
          </g>
          {/* Railway Tracks perspective extending down */}
          <path d="M45 105 L20 175" stroke="currentColor" strokeWidth="2" />
          <path d="M105 105 L130 175" stroke="currentColor" strokeWidth="2" />
          {/* Railway Sleepers */}
          <line x1="43" y1="115" x2="107" y2="115" stroke="currentColor" strokeWidth="2.5" />
          <line x1="38" y1="128" x2="112" y2="128" stroke="currentColor" strokeWidth="3" />
          <line x1="32" y1="143" x2="118" y2="143" stroke="currentColor" strokeWidth="3.5" />
          <line x1="26" y1="160" x2="124" y2="160" stroke="currentColor" strokeWidth="4" />
          <line x1="20" y1="175" x2="130" y2="175" stroke="currentColor" strokeWidth="4.5" />
        </svg>
      </div>

      {/* Footer Tagline & Tricolor */}
      <div className="sidebar-footer">
        <div className="sidebar-tagline">
          <div>Safe Railways</div>
          <div>Better Tomorrow</div>
        </div>
        <div className="sidebar-tricolor-strip" aria-hidden="true" />
      </div>
    </aside>
  );
}
