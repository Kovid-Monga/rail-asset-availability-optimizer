import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../shared/NotificationBell';
import { User, Activity, ChevronDown, Train, ShieldCheck } from 'lucide-react';
import { DEPARTMENTS } from '../../constants/departments';

export const Topbar = () => {
  const { currentRole, currentUser, switchRole, availableRoles } = useAuth();
  const currentDept = DEPARTMENTS[currentRole];

  return (
    <header className="h-14 bg-rail-surface border-b border-rail-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left branding */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-rail-primary flex items-center justify-center text-white shrink-0">
          <Train className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-rail-text tracking-tight uppercase">
              AI Block Planner
            </span>
            <span className="text-[10px] bg-[#EAE3D5] text-rail-muted px-1.5 py-0.5 rounded-sm font-mono border border-rail-border">
              BDMS-v2
            </span>
          </div>
          <span className="text-[11px] text-rail-muted truncate hidden sm:inline">
            Northern Railway • Delhi-Mathura Trunk Corridor (NDLS-MTJ)
          </span>
        </div>
      </div>

      {/* Right controls: Role switcher, System source indicator, Notification */}
      <div className="flex items-center gap-3">
        {/* Source System Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#ECE5D8] rounded-sm border border-rail-border text-xs">
          <Activity className="w-3.5 h-3.5 text-rail-primary" />
          <span className="text-rail-muted text-[11px]">Source Feed:</span>
          <span className="font-semibold font-mono text-[11px] text-rail-text">
            {currentDept?.sourceSystem || 'COA/TMS'}
          </span>
        </div>

        {/* Quick Role Switcher */}
        <div className="relative flex items-center bg-[#EFEBE1] rounded-sm border border-rail-border px-2 py-1">
          <User className="w-3.5 h-3.5 text-rail-muted mr-1.5 shrink-0" />
          <div className="flex flex-col text-left mr-2">
            <span className="text-[10px] uppercase tracking-wider text-rail-muted font-mono leading-none">
              Active Portal
            </span>
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-rail-text focus:outline-none cursor-pointer pr-4 appearance-none"
              title="Switch role to view department or central admin portal"
            >
              {availableRoles.map((r) => (
                <option key={r.role} value={r.role} className="bg-rail-surface text-rail-text">
                  {r.role === 'ADMIN' ? '🛡️ Central Admin' : `${r.role} — ${r.departmentName.replace(' Department', '')}`}
                </option>
              ))}
            </select>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-rail-muted pointer-events-none -ml-3" />
        </div>

        {/* Notification Bell */}
        <NotificationBell />
      </div>
    </header>
  );
};
