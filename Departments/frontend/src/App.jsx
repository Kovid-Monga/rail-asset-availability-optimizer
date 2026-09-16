import React, { useState, useEffect } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import NewRequest from './pages/NewRequest';
import RequestDetails from './pages/RequestDetails';

export default function App() {
  // Department state with persistence
  const [department, setDepartment] = useState(() => {
    return localStorage.getItem('bdms_active_dept') || 'TMS';
  });

  // Navigation state: 'dashboard' | 'requests' | 'new' | 'details'
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedNeedId, setSelectedNeedId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('bdms_active_dept', department);
  }, [department]);

  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    // If currently looking at a specific request, return to dashboard to reflect new department
    if (currentPage === 'details') {
      setCurrentPage('dashboard');
      setSelectedNeedId(null);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleViewDetails = (needId) => {
    setSelectedNeedId(needId);
    setCurrentPage('details');
  };

  const handleCreateSuccess = (needId, msg) => {
    showNotification(msg);
    setSelectedNeedId(needId);
    setCurrentPage('details');
  };

  const handleDeleteSuccess = (needId, msg) => {
    showNotification(msg);
    setSelectedNeedId(null);
    setCurrentPage('requests');
  };

  return (
    <div className="app-container">
      <Topbar
        department={department}
        onDepartmentChange={handleDepartmentChange}
      />

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          if (page !== 'details') setSelectedNeedId(null);
        }}
        department={department}
      />

      <main className="main-wrapper">
        {notification && (
          <div className="alert alert-success">
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            department={department}
            onViewDetails={handleViewDetails}
            onNavigateNew={() => setCurrentPage('new')}
          />
        )}

        {currentPage === 'requests' && (
          <MyRequests
            department={department}
            onViewDetails={handleViewDetails}
            onNavigateNew={() => setCurrentPage('new')}
          />
        )}

        {currentPage === 'new' && (
          <NewRequest
            department={department}
            onSuccess={handleCreateSuccess}
            onCancel={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'details' && selectedNeedId && (
          <RequestDetails
            needId={selectedNeedId}
            onBack={() => setCurrentPage('requests')}
            onDeleteSuccess={handleDeleteSuccess}
          />
        )}
      </main>
    </div>
  );
}
