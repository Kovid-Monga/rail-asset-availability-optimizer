import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: 'NOTIF-01',
    title: 'Block Auto-Scheduled',
    message: 'Request ENG-2026-00421 auto-scheduled for 2026-09-08 01:30 - 04:00 (Night Possession). Co-located with S&T Point Machine overhaul.',
    type: 'SCHEDULED',
    department: 'ENG',
    timestamp: '10m ago',
    isRead: false,
    requestId: 'ENG-2026-00421'
  },
  {
    id: 'NOTIF-02',
    title: 'Alternative Slot Suggested',
    message: 'Request ENG-2026-00422 cannot be accommodated in daytime peak (08:00 - 11:00) due to Vande Bharat & suburban commuter traffic. 3 alternative slots proposed.',
    type: 'ALTERNATIVE',
    department: 'ENG',
    timestamp: '25m ago',
    isRead: false,
    requestId: 'ENG-2026-00422'
  },
  {
    id: 'NOTIF-03',
    title: 'Human Review Appeal Forwarded',
    message: 'Urgent appeal for ENG-2026-00419 (Turnout #108A USFD micro-crack) submitted to Central Operations Control.',
    type: 'APPEAL',
    department: 'ENG',
    timestamp: '1h ago',
    isRead: true,
    requestId: 'ENG-2026-00419'
  },
  {
    id: 'NOTIF-04',
    title: 'Rescheduled Due to Higher-Priority Conflict',
    message: 'TRD Section Insulator maintenance rescheduled to align with joint track possession on UP Line.',
    type: 'RESCHEDULED',
    department: 'TRD',
    timestamp: '2h ago',
    isRead: true,
    requestId: 'TRD-2026-00109'
  },
  {
    id: 'NOTIF-05',
    title: 'Block Completed & Fit Certified',
    message: 'Request ENG-2026-00415 (Curve #14 tamping pass) successfully executed; track speed certified for 110 km/h.',
    type: 'COMPLETED',
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
