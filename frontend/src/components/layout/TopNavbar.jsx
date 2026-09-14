import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../shared/NotificationBell';
import {
  LayoutGrid,
  Activity,
  Train,
  Wrench,
  LineChart,
  FileText,
  Search,
  ChevronDown,
  User,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const TopNavbar = ({ onOpenSearch }) => {
  const { currentRole, currentUser, switchRole, availableRoles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const deptKey = currentRole.toLowerCase();

  const navItems = [
    { to: `/${deptKey}/overview`, label: 'Overview', icon: LayoutGrid },
    { to: `/${deptKey}/operations`, label: 'Operations', icon: Activity },
    { to: `/${deptKey}/fleet`, label: 'Fleet', icon: Train },
    { to: `/${deptKey}/maintenance`, label: 'Maintenance', icon: Wrench },
    { to: `/${deptKey}/analytics`, label: 'Analytics', icon: LineChart },
    { to: `/${deptKey}/reports`, label: 'Reports', icon: FileText },
  ];

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    navigate(`/${newRole.toLowerCase()}/overview`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ENG': return <Wrench className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'TRD': return <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'SNT': return <Radio className="w-3.5 h-3.5 text-[#A855F7]" />;
      case 'ADMIN': return <ShieldCheck className="w-3.5 h-3.5 text-[#F97316]" />;
      default: return <Train className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="h-16 bg-[#0E131A] border-b border-[#1E2633] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-6">
        <NavLink to={`/${deptKey}/overview`} className="flex items-center gap-2.5 select-none">
          {/* Ledgerix style orange 4-squares icon */}
          <div className="w-7 h-7 rounded-md bg-[#F97316] flex items-center justify-center p-1.5 shadow-glow-orange">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-white rounded-xs"></div>
              <div className="bg-white/80 rounded-xs"></div>
              <div className="bg-white/80 rounded-xs"></div>
              <div className="bg-white rounded-xs"></div>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-white tracking-tight">Ledgerix</span>
            <span className="text-[10px] font-mono uppercase text-rail-muted tracking-wider hidden md:inline">
              Rail
            </span>
          </div>
        </NavLink>

        {/* Center: Top Navigation Pills */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.to) ||
              (item.to.endsWith('/overview') && (location.pathname === `/${deptKey}` || location.pathname === `/${deptKey}/dashboard`));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all select-none",
                  isActive
                    ? "bg-[#1E293B] text-white border border-[#334155] shadow-xs"
                    : "text-rail-muted hover:text-white hover:bg-[#161F2E]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-[#F97316]" : "text-rail-muted")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile Nav Scrollable (small screens) */}
      <nav className="flex lg:hidden items-center gap-1 overflow-x-auto max-w-[280px] sm:max-w-md py-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap",
                isActive ? "bg-[#1E293B] text-white border border-[#334155]" : "text-rail-muted"
              )}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Right Controls: Search, Notification Bell, User Avatar & Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="w-8 h-8 rounded-full bg-[#161D27] border border-[#1E2633] flex items-center justify-center text-rail-muted hover:text-white hover:border-[#334155] transition-colors"
          title="Search assets or blocks"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Profile & Portal Mode Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-[#161D27] border border-[#1E2633] hover:border-[#334155] transition-all text-left"
            title="Switch Portal Mode / Department"
          >
            {/* User Avatar */}
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#243047] border border-[#38BDF8]/40 flex items-center justify-center shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <User className="w-4 h-4 text-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left leading-none mr-1">
              <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                {currentUser?.name?.split(' ')?.[0] || 'Stewart'} Menzies
              </span>
              <span className="text-[10px] text-rail-muted mt-0.5 truncate max-w-[110px]">
                {currentRole === 'ADMIN' ? 'Operations Manager' : `${currentRole} Engineer`}
              </span>
            </div>

            {/* Role Badge */}
            <span className={cn(
              "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm border uppercase",
              currentRole === 'ENG' && "bg-[#082F49] text-[#38BDF8] border-[#38BDF8]/30",
              currentRole === 'TRD' && "bg-[#451A03] text-[#F59E0B] border-[#F59E0B]/30",
              currentRole === 'SNT' && "bg-[#3B0764] text-[#A855F7] border-[#A855F7]/30",
              currentRole === 'ADMIN' && "bg-[#431407] text-[#F97316] border-[#F97316]/30",
            )}>
              {currentRole}
            </span>

            <ChevronDown className="w-3 h-3 text-rail-muted" />
          </button>

          {/* Role Dropdown */}
          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#111827] border border-[#1E2633] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#1E2633] mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-rail-muted block">
                  Select Portal Persona
                </span>
                <span className="text-xs font-semibold text-white">
                  Active: {currentUser?.departmentName}
                </span>
              </div>
              <div className="space-y-1">
                {availableRoles.map((roleObj) => {
                  const isSelected = currentRole === roleObj.role;
                  return (
                    <button
                      key={roleObj.role}
                      onClick={() => handleRoleChange(roleObj.role)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-[#1E293B] text-white font-semibold border border-[#334155]"
                          : "text-rail-muted hover:text-white hover:bg-[#161F2E]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {getRoleIcon(roleObj.role)}
                        <div>
                          <div className="font-medium text-white">{roleObj.departmentName.replace(' Department', '')}</div>
                          <div className="text-[10px] text-rail-muted">{roleObj.sourceSystem}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#0B0F17] border border-[#1E2633]">
                        {roleObj.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
