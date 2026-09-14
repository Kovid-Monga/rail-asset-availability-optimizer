import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../shared/NotificationBell';
import { User, Activity, ChevronDown, Train, ShieldCheck, Wifi, CloudSun, Clock } from 'lucide-react';
import { DEPARTMENTS } from '../../constants/departments';

export const Topbar = () => {
  const { currentRole, currentUser, switchRole, availableRoles } = useAuth();
  const currentDept = DEPARTMENTS[currentRole];
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-[#0F172A]/90 backdrop-blur-md border-b border-rail-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rail-primaryHover to-rail-primary flex items-center justify-center text-white shadow-glow-orange shrink-0">
          <Train className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>RailNet</span>
              <span className="text-rail-primary font-normal">•</span>
              <span className="text-xs font-semibold text-slate-300 normal-case">Automatic Block Planner</span>
            </span>
            <span className="text-[10px] bg-rail-primary/10 text-rail-primary border border-rail-primary/30 px-1.5 py-0.5 rounded font-mono font-semibold">
              SIH-v2
            </span>
          </div>
          <span className="text-[11px] text-rail-muted truncate hidden sm:inline">
            Intelligent Multi-Department Maintenance & Corridor Scheduling Hub
          </span>
        </div>
      </div>

      {/* Center live telemetry indicators (Matching Ledgerix reference) */}
      <div className="hidden xl:flex items-center gap-5 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Network Operational</span>
        </div>

        <div className="h-3.5 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-rail-primary" />
          <span className="font-mono text-[11px]">{timeStr || '15:24:00'}</span>
        </div>

        <div className="h-3.5 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5 text-slate-300">
          <CloudSun className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">18°C Clear</span>
        </div>

        <div className="h-3.5 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5 text-slate-300">
          <Train className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[11px] font-mono">Active: 124/150</span>
        </div>
      </div>

      {/* Right controls: Source feed, Role switcher, Notifications */}
      <div className="flex items-center gap-3">
        {/* Source System Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 rounded-md border border-slate-800 text-xs shadow-inner">
          <Activity className="w-3.5 h-3.5 text-rail-primary animate-pulse" />
          <span className="text-slate-400 text-[11px]">Feed:</span>
          <span className="font-semibold font-mono text-[11px] text-white">
            {currentDept?.sourceSystem || 'COA/TMS'}
          </span>
        </div>

        {/* Quick Role Switcher */}
        <div className="relative flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors rounded-md px-2.5 py-1 shadow-sm">
          <User className="w-3.5 h-3.5 text-rail-primary mr-2 shrink-0" />
          <div className="flex flex-col text-left mr-3">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono leading-none">
              Portal Mode
            </span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
              title="Switch role to view department or central admin portal"
            >
              {availableRoles.map((r) => (
                <option key={r.role} value={r.role} className="bg-slate-900 text-white">
                  {r.role === 'ADMIN' ? '🛡️ Central Admin' : `${r.role} — ${r.departmentName.replace(' Department', '')}`}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none -ml-3" />
        </div>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};
