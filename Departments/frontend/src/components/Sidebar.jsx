import React from 'react';

export default function Sidebar({ currentPage, onNavigate, department }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'requests', label: 'My Requests' },
    { id: 'new', label: 'New Request' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-dept-tag">
        Viewing: <strong>{department}</strong>
      </div>
      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
