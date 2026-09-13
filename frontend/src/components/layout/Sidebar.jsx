import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  CalendarDays,
  Clock,
  MessageSquareWarning,
  SlidersHorizontal,
  CalendarRange,
  AlertOctagon,
  Flame,
  LineChart,
  Layers,
  Sparkles
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const { currentRole, isAdmin, currentDeptConfig } = useAuth();

  // Department Portal links (ENG, TRD, SNT)
  const departmentLinks = [
    { to: `/${currentRole.toLowerCase()}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `/${currentRole.toLowerCase()}/new-request`, label: 'New Maintenance Request', icon: PlusCircle },
    { to: `/${currentRole.toLowerCase()}/requests`, label: 'My Requests', icon: ListOrdered },
    { to: `/${currentRole.toLowerCase()}/timetable`, label: 'Timetable & Corridor', icon: CalendarDays },
    { to: `/${currentRole.toLowerCase()}/scheduled-work`, label: 'Scheduled Work', icon: Clock },
    { to: `/${currentRole.toLowerCase()}/human-review`, label: 'Human Review', icon: MessageSquareWarning }
  ];

  // Admin Portal links (Strictly adhering to spec)
  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Dashboard', icon: LayoutDashboard },
    { to: '/admin/requests', label: 'All Requests', icon: ListOrdered },
    { to: '/admin/ai-schedule', label: 'AI-Generated Schedule', icon: Sparkles },
    { to: '/admin/weekly-plan', label: 'Weekly Plan', icon: CalendarDays },
    { to: '/admin/monthly-plan', label: 'Monthly Plan', icon: CalendarRange },
    { to: '/admin/critical-overdue', label: 'Critical & Overdue Work', icon: Flame },
    { to: '/admin/conflicts-alerts', label: 'Conflicts & Alerts', icon: AlertOctagon },
    { to: '/admin/human-review', label: 'Human Review', icon: MessageSquareWarning },
    { to: '/admin/analytics', label: 'Analytics', icon: LineChart },
    { to: '/admin/manual-override', label: 'Manual Override', icon: SlidersHorizontal, isException: true }
  ];

  const links = isAdmin ? adminLinks : departmentLinks;

  return (
    <aside className="w-64 bg-[#F2ECE1] border-r border-rail-border flex flex-col shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
      {/* Department/Admin Identity banner */}
      <div className="p-4 border-b border-rail-border bg-[#ECE4D8]">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn(
            "text-[11px] font-bold px-2 py-0.5 rounded-sm border uppercase font-mono tracking-wider",
            currentDeptConfig?.badgeColor || "bg-[#EAE4D8] text-rail-text"
          )}>
            {currentDeptConfig?.shortCode || currentRole}
          </span>
          <span className="text-xs font-semibold text-rail-text truncate">
            {currentDeptConfig?.name || 'Department'}
          </span>
        </div>
        <p className="text-[11px] text-rail-muted leading-tight">
          {isAdmin ? 'Network Optimization Hub' : `Connected to ${currentDeptConfig?.sourceSystem} Feed`}
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-mono tracking-wider text-rail-muted px-2 py-1">
          {isAdmin ? 'Central Control Operations' : 'Department Portal'}
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors border select-none",
                  isActive
                    ? "bg-rail-primary text-[#F7F4EC] border-rail-primary shadow-xs font-semibold"
                    : "text-rail-text border-transparent hover:bg-rail-surfaceHover hover:border-rail-border",
                  item.isException && !isActive && "text-rail-critical hover:bg-rail-criticalLight/50"
                )
              }
            >
              <Icon className={cn("w-4 h-4 shrink-0", item.isException && "text-rail-critical")} />
              <span className="truncate">{item.label}</span>
              {item.isException && (
                <span className="ml-auto text-[9px] uppercase font-mono bg-rail-critical/20 text-rail-critical px-1 rounded-sm border border-rail-critical/30">
                  Exception
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System footer status */}
      <div className="p-3 border-t border-rail-border bg-[#ECE4D8] text-[11px] text-rail-muted">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rail-success animate-pulse"></span>
            Optimization Engine
          </span>
          <span className="font-mono text-[10px] text-rail-text">ONLINE</span>
        </div>
        <div className="text-[10px] text-rail-muted leading-tight">
          Prioritization Layer Active • Next Batch in 18m
        </div>
      </div>
    </aside>
  );
};
