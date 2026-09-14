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
        return <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'ALTERNATIVE':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'APPEAL':
        return <FileText className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'RESCHEDULED':
        return <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md text-slate-400 hover:text-slate-100 hover:bg-[#111827] transition-colors border border-transparent hover:border-[#1F2937]"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-slate-950 ring-2 ring-[#0B0F17] animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111827] border border-[#1F2937] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-3 bg-[#1F2937]/50 border-b border-[#1F2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">Operations Control Alerts</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-mono font-bold border border-orange-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#1F2937]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No active notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "p-3.5 text-xs hover:bg-[#0B0F17]/80 cursor-pointer transition-colors flex gap-3 items-start",
                    !n.isRead ? "bg-orange-500/5 font-medium" : "text-slate-400"
                  )}
                >
                  <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={cn("text-xs truncate", !n.isRead ? "text-slate-100 font-bold" : "text-slate-300")}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
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
