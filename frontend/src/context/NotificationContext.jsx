import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 'NOTIF-01',
    title: 'Admin Directive: Override Approved',
    message: 'Chief Operations Manager (R. K. Meena) approved emergency night block 01:30 - 04:00 AM for Turnout #108A USFD micro-flaw.',
    type: 'ADMIN_DIRECTIVE',
    source: 'ADMIN',
    department: 'ENG',
    timestamp: '5m ago',
    isRead: false,
    requestId: 'ENG-2026-00419'
  },
  {
    id: 'NOTIF-02',
    title: 'AI Optimization Alert',
    message: 'Shifted Request 52495 check by 15 mins to eliminate 12m commercial delay on Shivalik Express.',
    type: 'AI_OPTIMIZATION',
    source: 'AI_ENGINE',
    department: 'ENG',
    timestamp: '10m ago',
    isRead: false,
    requestId: 'ENG-2026-00421'
  },
  {
    id: 'NOTIF-03',
    title: 'Human Review Dispute Raised',
    message: 'Dispute submitted by Eng. S. Mehta for Barog Station Yard OHE power cut. Awaiting Admin review.',
    type: 'APPEAL',
    source: 'DEPARTMENT',
    department: 'TRD',
    timestamp: '25m ago',
    isRead: false,
    requestId: 'TRD-2026-00109'
  },
  {
    id: 'NOTIF-04',
    title: 'Admin Decision: AI Slot Enforced',
    message: 'Admin review completed for S&T Point Machine overhaul. Night shadow slot 01:30 AM enforced to preserve passenger schedule.',
    type: 'ADMIN_DIRECTIVE',
    source: 'ADMIN',
    department: 'SNT',
    timestamp: '1h ago',
    isRead: true,
    requestId: 'SNT-2026-00305'
  },
  {
    id: 'NOTIF-05',
    title: 'Brake System Check Completed',
    message: 'Train 52489 cleared by Chief Engineer at Solan Depot. Fit certified for 110 km/h.',
    type: 'COMPLETED',
    source: 'FIELD',
    department: 'ENG',
    timestamp: '1d ago',
    isRead: true,
    requestId: 'ENG-2026-00415'
  }
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (notif) => {
    const newEntry = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newEntry, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
