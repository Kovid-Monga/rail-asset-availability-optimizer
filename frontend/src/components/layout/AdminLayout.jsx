import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrainTrack, 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  LineChart, 
  FileText, 
  Search, 
  Bell, 
  X, 
  CheckCircle2, 
  Layers, 
  Users, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { AdminLedgerixOverview } from '../../features/admin/AdminLedgerixOverview';
import { AdminAiAnalyticsTab } from '../../features/admin/AdminAiAnalyticsTab';
import { AdminHumanReviewHub } from '../../features/admin/AdminHumanReviewHub';
import { AdminAnalytics } from '../../features/admin/AdminAnalytics';
import { CorridorTimetable } from '../../features/timetable/CorridorTimetable';
import { ReportsView } from '../../features/reports/ReportsView';
import { ThemeToggle } from '../shared/ThemeToggle';

export const AdminLayout = () => {
  const { currentRole, currentUser, setPreviewDept, isAdminPreviewing, availableRoles, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  // Tab routing
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPathTab = pathParts[1] || 'overview';

  const validTabs = ['overview', 'ai-analytics', 'timetable', 'human-review', 'analytics', 'reports'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(currentPathTab) ? currentPathTab : 'overview');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (validTabs.includes(currentPathTab)) {
      setActiveTab(currentPathTab);
    }
  }, [currentPathTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0B111E] text-slate-300 font-sans selection:bg-[#F97316] selection:text-white">
      
      {/* TOP NAVIGATION HEADER (MATCHING LEDGERIX REFERENCE) */}
      <header className="sticky top-0 z-40 h-16 border-b border-[#1E293B] bg-[#0F172A]/95 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-lg shadow-black/30">
        
        {/* Logo */}
        <div className="flex items-center space-x-3 w-52 sm:w-60 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <TrainTrack className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-white tracking-wider">
              Ledgerix <span className="text-[#F97316]">RAIL</span>
            </span>
            <span className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 -mt-1">
              Control Operating Center
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#1E293B]/70 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'overview'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('ai-analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'ai-analytics'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>AI Analytics</span>
          </button>

          <button
            onClick={() => handleTabChange('timetable')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'timetable'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Train Timetable</span>
          </button>

          <button
            onClick={() => handleTabChange('human-review')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition relative ${
              activeTab === 'human-review'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Human Review</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-orange-500 text-white font-bold animate-pulse">
              3
            </span>
          </button>

          <button
            onClick={() => handleTabChange('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'analytics'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => handleTabChange('reports')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'reports'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden lg:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search train, block, slot..."
              className="w-40 xl:w-56 bg-[#1E293B] text-xs text-white placeholder-slate-500 pl-8 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-[#F97316] transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl bg-[#1E293B] text-slate-400 hover:text-white border border-slate-800 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full animate-ping"></span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full"></span>
                </>
              )}
            </button>

            {/* Notification Drawer */}
            {isNotifOpen && (
              <div className="absolute top-12 right-0 w-80 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-xs font-bold text-white flex items-center uppercase tracking-wider">
                    <Bell className="w-4 h-4 text-[#F97316] mr-2" /> System Alerts ({unreadCount})
                  </h4>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-[#F97316] hover:underline"
                      >
                        Mark read
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

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Profile Info & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2.5 cursor-pointer bg-[#1E293B]/40 hover:bg-[#1E293B] p-1 pr-3 rounded-xl border border-slate-800/80 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                RM
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center">
                  {currentUser?.name || 'R. Menzies'}{' '}
                  <span className="ml-1.5 text-[9px] bg-orange-500/20 text-[#F97316] border border-orange-500/30 px-1 py-0.2 rounded font-mono">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  Central Operations Control
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute top-12 right-0 w-64 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-fade-in text-xs space-y-2">
                <div className="pb-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400">Chief Operations Manager (ADMIN)</div>
                </div>

                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider pt-1">
                  Switch User Account:
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
                        currentRole === r.role
                          ? 'bg-[#F97316] text-white font-semibold'
                          : 'hover:bg-[#1E293B] text-slate-300'
                      }`}
                    >
                      <span>{r.role === 'ADMIN' ? 'Central Admin' : r.departmentName.split(' ')[0]} ({r.role})</span>
                      {currentRole === r.role && (
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

      {/* MOBILE TABS BAR */}
      <div className="md:hidden bg-[#0F172A] border-b border-[#1E293B] flex items-center overflow-x-auto px-2 py-1 space-x-1 no-scrollbar text-xs">
        {validTabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium capitalize transition ${
              activeTab === tab ? 'bg-[#F97316] text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {activeTab === 'overview' && (
          <AdminLedgerixOverview onNavigateTab={handleTabChange} />
        )}

        {activeTab === 'ai-analytics' && (
          <AdminAiAnalyticsTab />
        )}

        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="bg-[#0F172A] p-4 rounded-2xl border border-[#1E293B] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#F97316]" />
                  <span>Master Corridor Train Timetable</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Hard non-negotiable passenger services and flexible goods paths along the KLK-SML / NDLS-MTJ corridors.
                </p>
              </div>
            </div>
            <CorridorTimetable />
          </div>
        )}

        {activeTab === 'human-review' && (
          <AdminHumanReviewHub />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}
      </div>

    </div>
  );
};
