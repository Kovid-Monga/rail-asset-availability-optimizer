import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Train, 
  LayoutDashboard, 
  Wrench, 
  ShieldAlert, 
  Search, 
  Bell, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DepartmentOverview } from '../../features/department/DepartmentOverview';
import { DepartmentHumanReviewTab } from '../../features/department/DepartmentHumanReviewTab';
import { CorridorTimetable } from '../../features/timetable/CorridorTimetable';
import { MaintenanceView } from '../../features/maintenance/MaintenanceView';
import { ThemeToggle } from '../shared/ThemeToggle';

export const DepartmentLayout = () => {
  const { currentRole, effectiveRole, currentUser, isAdminPreviewing, setPreviewDept, availableRoles, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path if possible, fallback to local state
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPathTab = pathParts[1] || 'overview';

  const [activeTab, setActiveTab] = useState(
    ['overview', 'trains', 'maintenance', 'human-review'].includes(currentPathTab) 
      ? currentPathTab 
      : 'overview'
  );
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize active tab with URL if user deep links
  useEffect(() => {
    if (['overview', 'trains', 'maintenance', 'human-review'].includes(currentPathTab)) {
      setActiveTab(currentPathTab);
    }
  }, [currentPathTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const deptPrefix = effectiveRole.toLowerCase();
    navigate(`/${deptPrefix}/${tab}`);
  };

  const handleReturnToAdmin = () => {
    setPreviewDept(null);
    navigate('/admin/overview');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0B111E] text-slate-300 font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* ADMIN PREVIEW MODE BANNER */}
      {isAdminPreviewing && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md shrink-0 z-50 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>ADMIN PREVIEW MODE: Viewing live operational portal as {currentUser?.departmentName || effectiveRole}</span>
          </div>
          <button
            onClick={handleReturnToAdmin}
            className="flex items-center space-x-1.5 bg-black/40 hover:bg-black/60 px-3 py-1 rounded-lg text-white font-bold text-xs border border-white/30 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Control Center</span>
          </button>
        </div>
      )}

      {/* TOP NAVIGATION HEADER */}
      <header className="h-16 border-b border-[#1E293B] bg-[#0F172A]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-40 shadow-sm">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 w-56 sm:w-64">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-wide">
              Rail<span className="text-[#F97316]">Sync</span>
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono -mt-1">
              {effectiveRole} Department Portal
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1.5 bg-[#1E293B]/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('trains')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'trains'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Train className="w-4 h-4" />
            <span>Trains</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              12
            </span>
          </button>

          <button
            onClick={() => handleTabChange('maintenance')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'maintenance'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Maintenance</span>
          </button>

          <button
            onClick={() => handleTabChange('human-review')}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeTab === 'human-review'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Human Review</span>
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-orange-500/30 text-orange-300 font-mono border border-orange-500/40">
              Dispute Hub
            </span>
          </button>
        </nav>

        {/* User Controls & Search */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search train, route..."
              className="w-44 lg:w-56 bg-[#1E293B] text-xs text-white placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-[#F97316] transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 rounded-xl bg-[#1E293B] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#F97316] rounded-full animate-ping"></span>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#F97316] rounded-full"></span>
                </>
              )}
            </button>

            {/* Notification Panel Dropdown */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white flex items-center uppercase tracking-wider">
                    <Bell className="w-4 h-4 text-[#F97316] mr-2" /> Notifications ({unreadCount})
                  </h4>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-[#F97316] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 pt-3 max-h-72 overflow-y-auto">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        notif.isRead 
                          ? 'bg-[#1E293B]/40 border-slate-800/60 opacity-80' 
                          : 'bg-[#1E293B]/90 border-orange-500/30 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-[11px] truncate max-w-[180px]">
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-[#F97316] font-mono">{notif.timestamp}</span>
                      </div>
                      <div className="text-slate-400 text-[10px] mt-1 line-clamp-2">
                        {notif.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />

          <div className="h-7 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* User Profile with Role Switcher Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 cursor-pointer group bg-[#1E293B]/40 hover:bg-[#1E293B] p-1 pr-3 rounded-xl border border-slate-800 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 border border-slate-700 group-hover:border-[#F97316] transition flex items-center justify-center text-white font-bold text-xs">
                {currentUser?.role || effectiveRole}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center">
                  {currentUser?.name || 'Ankita'}
                  <span className="ml-1.5 text-[9px] bg-orange-500/20 text-[#F97316] border border-orange-500/30 px-1 py-0.2 rounded font-mono">
                    {effectiveRole}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {currentUser?.designation || 'Operations Manager'}
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-12 right-0 w-64 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-fade-in text-xs space-y-2">
                <div className="pb-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser?.departmentName}</div>
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pt-1">
                  Switch Operational Persona:
                </div>

                <div className="space-y-1">
                  {availableRoles.map(r => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsProfileOpen(false);
                        navigate(`/${r.role.toLowerCase()}/overview`);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                        currentRole === r.role && !isAdminPreviewing
                          ? 'bg-[#F97316] text-white font-semibold'
                          : 'hover:bg-[#1E293B] text-slate-300'
                      }`}
                    >
                      <span>{r.role === 'ADMIN' ? 'Central Admin' : r.departmentName.split(' ')[0]} ({r.role})</span>
                      {currentRole === r.role && !isAdminPreviewing && (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full text-center py-1.5 bg-[#1E293B] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-[11px] transition cursor-pointer"
                  >
                    Switch User / Login Portal
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* MAIN LAYOUT WITH LEFT SIDEBAR */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* LEFT SIDEBAR (Matching reference UI theme & exact specs) */}
        <aside className="dept-sidebar w-80 bg-[#0F172A] border-r border-[#1E293B] flex flex-col justify-between p-4 shrink-0 overflow-y-auto hidden md:flex">
          <div className="space-y-4">
            
            {/* Route Hero Image Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 group shadow-md">
              <img
                src="/hero-train.jpg"
                alt="Train Route"
                className="w-full h-44 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Kalka &rarr; Shimla</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Active
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
                  <span>Scenic Route</span>
                  <span className="text-amber-400 flex items-center text-[11px]">
                    <Clock className="w-3 h-3 mr-1" /> Timely Journeys
                  </span>
                </div>
              </div>
            </div>

            {/* Route Overview Block */}
            <div className="bg-[#1E293B]/40 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white font-medium text-xs">
                  <MapPin className="w-4 h-4 text-[#F97316]" />
                  <span>Route Overview</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-500 font-medium">Distance</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">96 km</div>
                </div>
                <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-500 font-medium">Avg. Duration</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">4 h 30 m</div>
                </div>
                <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-500 font-medium">Total Trains</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">12</div>
                </div>
                <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] text-slate-500 font-medium">Active Stations</div>
                  <div className="text-sm font-bold text-white mt-0.5 font-mono">8</div>
                </div>
              </div>

              {/* Mini Visual Route Path Vector Map (Track Radar Map) */}
              <div className="bg-[#0F172A]/90 rounded-lg p-3 border border-slate-800/80 relative h-28 flex flex-col justify-between overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase flex justify-between">
                  <span>Track Radar Map</span>
                  <span className="text-emerald-400 flex items-center font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                    Normal Signal
                  </span>
                </div>
                
                <div className="relative w-full h-12 flex items-center my-auto">
                  <svg className="w-full h-full absolute inset-0 text-amber-500" viewBox="0 0 200 50" fill="none">
                    <path d="M 15 35 Q 70 5, 120 40 T 185 20" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    <path d="M 15 35 Q 70 5, 120 40 T 185 20" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" fill="none"/>
                    
                    <circle cx="15" cy="35" r="4" className="fill-[#F97316] stroke-slate-900" strokeWidth="2" />
                    <circle cx="90" cy="22" r="3" className="fill-amber-400 stroke-slate-900" strokeWidth="1.5" />
                    <circle cx="185" cy="20" r="4" className="fill-white stroke-slate-900" strokeWidth="2" />
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono z-10">
                  <span className="text-white font-semibold">Kalka (KLK)</span>
                  <span className="text-slate-500">Solan</span>
                  <span className="text-white font-semibold">Shimla (SML)</span>
                </div>
              </div>
            </div>

            {/* Maintenance Quick Link Banner */}
            <div 
              onClick={() => handleTabChange('maintenance')}
              className="bg-[#1E293B]/40 hover:bg-[#1E293B]/80 cursor-pointer rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Maintenance Hub</div>
                  <div className="text-[11px] text-slate-500">Keep the journey on track</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition" />
            </div>

          </div>

          {/* System Info Footer */}
          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
            <span>RailSync v3.4.0</span>
            <span className="text-emerald-400 flex items-center font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span> Live Data
            </span>
          </div>
        </aside>

        {/* MAIN DASHBOARD VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'overview' && (
            <DepartmentOverview onNavigateTab={handleTabChange} />
          )}

          {activeTab === 'trains' && (
            <div className="space-y-4">
              <div className="bg-[#0F172A] p-4 rounded-2xl border border-[#1E293B] flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Train className="w-5 h-5 text-[#F97316]" />
                    <span>Train Timetable & Commercial Windows</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Control Office Application (COA) live feed with hard passenger constraints vs soft freight forecast.
                  </p>
                </div>
              </div>
              <CorridorTimetable />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView />
          )}

          {activeTab === 'human-review' && (
            <DepartmentHumanReviewTab />
          )}
        </main>

      </div>
    </div>
  );
};
