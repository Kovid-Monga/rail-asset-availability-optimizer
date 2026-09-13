import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, Calendar, RefreshCw, CheckCircle2, FileText } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../utils/cn';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SCHEDULED':
        return <Calendar className="w-4 h-4 text-rail-success shrink-0" />;
      case 'ALTERNATIVE':
        return <AlertTriangle className="w-4 h-4 text-rail-warning shrink-0" />;
      case 'APPEAL':
        return <FileText className="w-4 h-4 text-rail-secondary shrink-0" />;
      case 'RESCHEDULED':
        return <RefreshCw className="w-4 h-4 text-[#4A6B82] shrink-0" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-rail-success shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-rail-muted shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-sm text-rail-muted hover:text-rail-text hover:bg-rail-surfaceHover transition-colors border border-transparent hover:border-rail-border"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rail-critical text-[9px] font-bold text-white ring-1 ring-rail-surface">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-rail-surface border border-rail-border rounded-md shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2.5 bg-[#F2EFE7] border-b border-rail-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rail-text">Operations Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rail-primary text-[#F7F4EC] px-1.5 py-0.2 rounded-sm font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-rail-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-rail-border/60">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-rail-muted">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "p-3 text-xs hover:bg-[#EFEBE1] cursor-pointer transition-colors flex gap-2.5 items-start",
                    !n.isRead && "bg-[#F7F2E6] font-medium"
                  )}
                >
                  <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-semibold text-rail-text text-xs truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-rail-muted shrink-0">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-rail-muted line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    {n.requestId && (
                      <span className="inline-block mt-1 font-mono text-[9px] bg-[#ECE5D8] text-rail-text px-1 rounded-sm border border-rail-border">
                        {n.requestId}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
