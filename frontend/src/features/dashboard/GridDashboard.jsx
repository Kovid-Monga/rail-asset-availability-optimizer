import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllRequests } from '../../services/requests';
import { fetchPassengerTimetable, fetchGoodsForecast } from '../../services/coa';
import { STATIONS, REQUEST_STAGES } from '../../constants/departments';
import { Modal } from '../../components/ui/Modal';
import { StatusTimeline } from '../requests/StatusTimeline';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Sparkles,
  Zap,
  Radio,
  Train,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Leaf,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

export const GridDashboard = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const deptKey = currentRole.toLowerCase();

  const [requests, setRequests] = useState([]);
  const [passengerTrains, setPassengerTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [allReqs, trains] = await Promise.all([
        getAllRequests(),
        fetchPassengerTimetable()
      ]);
      setRequests(allReqs);
      setPassengerTrains(trains);
      setLoading(false);
    }
    load();
  }, []);

  // Compute 9 exact PRD KPI values
  const totalCount = requests.length;
  const underMLCount = requests.filter(r => r.status === REQUEST_STAGES.ML_PRIORITIZATION).length;
  const underOptCount = requests.filter(r => r.status === REQUEST_STAGES.OPTIMIZATION).length;
  const scheduledCount = requests.filter(r => r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN).length;
  const unaccommodatedCount = requests.filter(r => r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED || r.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED).length;
  const humanReviewCount = requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW).length;
  const completedCount = requests.filter(r => r.status === REQUEST_STAGES.COMPLETED).length;
  const overdueCount = requests.filter(r => r.isOverdue).length;

  // Sparkline data for Performance card
  const sparklineData = [
    { v: 88 }, { v: 91 }, { v: 89 }, { v: 94 }, { v: 93 }, { v: 96.4 }
  ];

  // Punctuality 7-day data for Bar Chart
  const punctualityData = [
    { day: 'Mon', value: 92 },
    { day: 'Tue', value: 95 },
    { day: 'Wed', value: 93 },
    { day: 'Thu', value: 96 },
    { day: 'Fri', value: 94 },
    { day: 'Sat', value: 97 },
    { day: 'Sun', value: 95 }
  ];

  const urgentBlock = requests.find(r => r.status === REQUEST_STAGES.SCHEDULED) || requests[0];

  return (
    <div className="space-y-4 max-w-[1740px] mx-auto">
      {/* Sleek Top PRD Counter Pill Ticker */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <span className="text-[10px] uppercase font-mono text-rail-muted">Total Requests:</span>
          <span className="font-bold text-white font-mono">{totalCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <Sparkles className="w-3 h-3 text-[#38BDF8]" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">ML Prioritization:</span>
          <span className="font-bold text-[#38BDF8] font-mono">{underMLCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <Activity className="w-3 h-3 text-[#06B6D4]" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">Optimization:</span>
          <span className="font-bold text-[#06B6D4] font-mono">{underOptCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">Auto-Scheduled:</span>
          <span className="font-bold text-[#10B981] font-mono">{scheduledCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">Unaccommodated / Alt:</span>
          <span className="font-bold text-[#F59E0B] font-mono">{unaccommodatedCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <Layers className="w-3 h-3 text-[#A855F7]" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">Human Review:</span>
          <span className="font-bold text-[#A855F7] font-mono">{humanReviewCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1E2633] shrink-0">
          <CheckCircle2 className="w-3 h-3 text-rail-muted" />
          <span className="text-[10px] uppercase font-mono text-rail-muted">Completed:</span>
          <span className="font-bold text-white font-mono">{completedCount}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#450A0A] border border-[#EF4444]/40 shrink-0">
          <Flame className="w-3 h-3 text-[#EF4444]" />
          <span className="text-[10px] uppercase font-mono text-[#EF4444]">Overdue Work:</span>
          <span className="font-bold text-[#EF4444] font-mono">{overdueCount}</span>
        </div>
      </div>

      {/* TOP ROW: 3 Columns Grid (Left Widgets, Center Hero Train, Right Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (3 Cols): Performance Overview & Train Health */}
        <div className="lg:col-span-3 space-y-4 flex flex-col justify-between">
          {/* Card 1: Performance Overview */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white tracking-tight">Performance Overview</span>
              <div className="flex items-center gap-1 text-[11px] text-rail-muted bg-[#161F2E] px-2 py-0.5 rounded-md border border-[#1E2633]">
                <span>This Month</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="mt-1">
              <span className="text-[10px] text-rail-muted uppercase font-mono">Overall Efficiency</span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-3xl font-bold text-white tracking-tight font-sans">96.4%</span>
                <span className="text-xs font-semibold text-[#F97316] flex items-center font-mono">
                  ↑ 4.2%
                </span>
              </div>
            </div>

            {/* Sparkline Wave Chart */}
            <div className="h-14 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line
                    type="natural"
                    dataKey="v"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 3 Metric counters underneath */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E2633] text-center">
              <div>
                <span className="text-[9px] uppercase font-mono text-rail-muted block truncate">On-Time Perf</span>
                <span className="text-xs font-bold text-white block mt-0.5 font-mono">94.7%</span>
                <span className="text-[9px] text-[#10B981] font-mono">↑ 3.1%</span>
              </div>
              <div className="border-x border-[#1E2633] px-1">
                <span className="text-[9px] uppercase font-mono text-rail-muted block truncate">Avg. Delay</span>
                <span className="text-xs font-bold text-white block mt-0.5 font-mono">02:45m</span>
                <span className="text-[9px] text-[#F97316] font-mono">↑ 1.2%</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono text-rail-muted block truncate">Completed</span>
                <span className="text-xs font-bold text-white block mt-0.5 font-mono">1,247</span>
                <span className="text-[9px] text-[#10B981] font-mono">↑ 6.4%</span>
              </div>
            </div>
          </div>

          {/* Card 2: Train & Track Asset Health */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white tracking-tight">Train & Track Health</span>
              <span className="text-[10px] text-[#10B981] font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                All Systems Normal
              </span>
            </div>

            {/* Futuristic wireframe train with node indicators */}
            <div className="relative h-28 bg-[#0D131D] rounded-xl border border-[#1E2633] p-2 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
              
              {/* SVG Train Wireframe with Connected Glowing Diagnostic Nodes */}
              <svg viewBox="0 0 280 90" className="w-full h-full z-10">
                {/* Train silhouette outline */}
                <path
                  d="M 20 60 L 40 30 L 100 25 L 240 25 C 260 25 270 45 270 65 L 25 65 Z"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                {/* Windows */}
                <path d="M 50 35 L 85 32 L 85 45 L 50 45 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.8" />
                <path d="M 95 32 L 140 32 L 140 45 L 95 45 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.8" />
                <path d="M 150 32 L 200 32 L 200 45 L 150 45 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.8" />
                <path d="M 210 32 L 250 35 L 250 48 L 210 48 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="0.8" />
                
                {/* Connecting telemetry circuit lines */}
                <line x1="45" y1="52" x2="90" y2="40" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="90" y1="40" x2="160" y2="48" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="160" y1="48" x2="225" y2="42" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* Glowing Nodes */}
                <circle cx="45" cy="52" r="3.5" fill="#10B981" className="animate-pulse" />
                <circle cx="90" cy="40" r="3.5" fill="#10B981" />
                <circle cx="160" cy="48" r="3.5" fill="#38BDF8" />
                <circle cx="225" cy="42" r="3.5" fill="#10B981" />

                {/* Wheels */}
                <circle cx="65" cy="65" r="7" fill="#0E131A" stroke="#475569" strokeWidth="1.5" />
                <circle cx="105" cy="65" r="7" fill="#0E131A" stroke="#475569" strokeWidth="1.5" />
                <circle cx="185" cy="65" r="7" fill="#0E131A" stroke="#475569" strokeWidth="1.5" />
                <circle cx="225" cy="65" r="7" fill="#0E131A" stroke="#475569" strokeWidth="1.5" />
              </svg>
            </div>

            {/* 4 Sensor Gauges */}
            <div className="grid grid-cols-4 gap-2 pt-3 text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-mono text-rail-muted">Track</span>
                <span className="text-xs font-bold text-[#10B981] font-mono mt-0.5">100%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-mono text-rail-muted">OHE</span>
                <span className="text-xs font-bold text-[#10B981] font-mono mt-0.5">98%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-mono text-rail-muted">Signals</span>
                <span className="text-xs font-bold text-[#10B981] font-mono mt-0.5">100%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] uppercase font-mono text-rail-muted">Switch</span>
                <span className="text-xs font-bold text-[#38BDF8] font-mono mt-0.5">97%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (5 Cols): Large Hero Train Section with Live Alert Pill */}
        <div className="lg:col-span-5 relative">
          <div className="h-full min-h-[380px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#1E2633] relative group shadow-card-dark bg-[#0D131D]">
            {/* The Generated High-Resolution Train Image */}
            <img
              src="/hero-train.jpg"
              alt="High-Speed Train Corridor"
              className="w-full h-full object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
            />

            {/* Subtle dark gradient overlay to ensure UI elements pop */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>

            {/* FLOATING ALERT PILL OVERLAY (Matches reference design) */}
            <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6">
              <div className="p-2 sm:p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-between gap-3 shadow-2xl">
                <div className="flex items-center gap-2.5 min-w-0 pl-1">
                  <div className="w-6 h-6 rounded-full bg-[#F97316] flex items-center justify-center text-white shrink-0 shadow-glow-orange">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      Track maintenance scheduled
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono truncate">
                      Section Km 14/2 (UP Line) • Tomorrow 01:30 AM
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDetailRequest(urgentBlock)}
                  className="px-3.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs whitespace-nowrap transition-colors shrink-0"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Bottom Floating Train Status Pill */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <div className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white">
                  <Train className="w-3 h-3" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[11px] leading-none">TRN 205</span>
                  <span className="text-[9px] text-gray-300 font-mono leading-none mt-0.5">Vande Bharat • NDLS - MTJ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 Cols): Live Train Status & Energy/Corridor Efficiency */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Card 1: Live Train Status (COA Timetable) */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white tracking-tight">Live Train Status</span>
              <Link to={`/${deptKey}/fleet`} className="text-[11px] text-rail-muted hover:text-white flex items-center gap-0.5">
                View All
              </Link>
            </div>

            {/* Train List matching reference layout */}
            <div className="space-y-2.5">
              {passengerTrains.slice(0, 4).map((train, idx) => {
                const isDelayed = idx === 1; // deliberate visual simulation matching ref
                return (
                  <div
                    key={train.trainNumber}
                    className="p-2.5 rounded-xl bg-[#0F1622] border border-[#1E2633] flex items-center justify-between text-xs hover:border-[#334155] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-white">TRN {train.trainNumber.substring(0, 3)}</span>
                        <span className={`text-[10px] ${isDelayed ? 'text-[#F97316]' : 'text-[#10B981]'}`}>
                          {isDelayed ? 'Delayed • 8 min' : `On Time • ${train.departure}`}
                        </span>
                      </div>
                      <div className="text-[10px] text-rail-muted mt-0.5 font-sans">
                        To: {train.destination === 'MMCT' ? 'Mumbai Central' : train.destination === 'BSB' ? 'Varanasi' : 'Mathura Junction'}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-semibold text-white">
                      {isDelayed ? '102 km/h' : `${115 + idx * 4} km/h`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Energy & Corridor Efficiency Gauge */}
          <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white tracking-tight">Corridor & Energy Efficiency</span>
              <div className="flex items-center gap-1 text-[11px] text-rail-muted bg-[#161F2E] px-2 py-0.5 rounded-md border border-[#1E2633]">
                <span>This Month</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Circular Gauge Ring */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#1E293B]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#F97316]"
                    strokeDasharray="87, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-bold text-white font-sans leading-none">87%</span>
                  <span className="text-[8px] uppercase font-mono text-rail-muted mt-0.5">Efficiency</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 flex-1 text-xs">
                <div>
                  <span className="text-[10px] text-rail-muted uppercase font-mono block">Track Hours Saved</span>
                  <span className="text-sm font-bold text-white font-mono">1,284 hrs</span>
                  <span className="text-[10px] text-[#10B981] font-mono ml-1.5">↑ 6.3%</span>
                </div>
                <div>
                  <span className="text-[10px] text-rail-muted uppercase font-mono block">Multi-Dept Bundling</span>
                  <span className="text-sm font-bold text-white font-mono">312 blocks</span>
                  <span className="text-[10px] text-[#10B981] font-mono ml-1.5">↑ 12.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: 4 Widgets Grid (Maintenance, Network Map, Punctuality Bar Chart, Environmental Impact) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* WIDGET 1: Maintenance Upcoming List (lg:col-span-3) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white tracking-tight">Maintenance</span>
              <div className="flex items-center gap-1 text-[11px] text-rail-muted bg-[#161F2E] px-2 py-0.5 rounded-md border border-[#1E2633]">
                <span>Upcoming</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* List of upcoming tasks with date badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-8 h-9 rounded-lg bg-[#1E293B] border border-[#334155] text-white">
                    <span className="text-xs font-bold leading-none">18</span>
                    <span className="text-[8px] uppercase font-mono text-rail-muted">MAY</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white block truncate max-w-[140px]">
                      Turnout #108A Flaw
                    </span>
                    <span className="text-[10px] text-rail-muted font-mono">TRN 205 Section</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#450A0A] text-[#EF4444] border border-[#EF4444]/30 font-semibold">
                  Critical
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-8 h-9 rounded-lg bg-[#1E293B] border border-[#334155] text-white">
                    <span className="text-xs font-bold leading-none">20</span>
                    <span className="text-[8px] uppercase font-mono text-rail-muted">MAY</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white block truncate max-w-[140px]">
                      Km 14 Sleeper Renewal
                    </span>
                    <span className="text-[10px] text-rail-muted font-mono">TRN 309 Track</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#451A03] text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
                  Scheduled
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-8 h-9 rounded-lg bg-[#1E293B] border border-[#334155] text-white">
                    <span className="text-xs font-bold leading-none">22</span>
                    <span className="text-[8px] uppercase font-mono text-rail-muted">MAY</span>
                  </div>
                  <div>
                    <span className="font-semibold text-white block truncate max-w-[140px]">
                      Point Machine 41A
                    </span>
                    <span className="text-[10px] text-rail-muted font-mono">TRN 412 Yard</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#064E3B] text-[#10B981] border border-[#10B981]/30 font-semibold">
                  Normal
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2633] mt-3 flex items-center gap-2">
            <Link to={`/${deptKey}/maintenance`} className="flex-1">
              <button className="w-full py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-white text-xs font-medium border border-[#1E2633] transition-colors">
                View All Maintenance
              </button>
            </Link>
            <Link to={`/${deptKey}/new-request`}>
              <button className="p-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-glow-orange transition-all" title="New Maintenance Requirement">
                <Plus className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* WIDGET 2: Network Map / Live Spatial Track View (lg:col-span-4) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-white tracking-tight block">
                Network Map
              </span>
              <span className="text-[10px] text-rail-muted">
                Kalka–Shimla & Delhi–Mathura Corridor
              </span>
            </div>
            {/* Legend pills */}
            <div className="flex items-center gap-2 text-[9px] font-mono text-rail-muted">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> On Time
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Delayed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span> Block
              </span>
            </div>
          </div>

          {/* Interactive Topological Map Graphic */}
          <div className="h-44 bg-[#0A0E14] rounded-xl border border-[#1E2633] p-3 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
            
            {/* SVG Track Network Geometry */}
            <svg viewBox="0 0 320 120" className="w-full h-full z-10">
              {/* Primary Trunk Line (Cyan) */}
              <path
                d="M 20 80 Q 90 20 160 60 T 300 40"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="2.5"
                className="opacity-70"
              />
              {/* Branch / Loop Line (Orange) */}
              <path
                d="M 60 95 L 140 70 L 220 90 L 290 60"
                fill="none"
                stroke="#F97316"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="opacity-80"
              />
              {/* Interconnection Lines */}
              <line x1="140" y1="70" x2="160" y2="60" stroke="#64748B" strokeWidth="1.5" />
              <line x1="220" y1="90" x2="230" y2="48" stroke="#64748B" strokeWidth="1.5" />

              {/* Station Nodes with Live Indicators */}
              <g className="cursor-pointer" onClick={() => setSelectedStation('NDLS')}>
                <circle cx="20" cy="80" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="12" y="95" fill="#94A3B8" fontSize="8" fontFamily="monospace">NDLS</text>
              </g>
              <g className="cursor-pointer" onClick={() => setSelectedStation('NZM')}>
                <circle cx="90" cy="45" r="4.5" fill="#10B981" />
                <text x="82" y="35" fill="#94A3B8" fontSize="8" fontFamily="monospace">NZM</text>
              </g>
              <g className="cursor-pointer" onClick={() => setSelectedStation('TKD (Possession)')}>
                <circle cx="160" cy="60" r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" className="animate-pulse" />
                <text x="150" y="75" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="monospace">TKD [Block]</text>
              </g>
              <g className="cursor-pointer" onClick={() => setSelectedStation('FDB')}>
                <circle cx="220" cy="90" r="4.5" fill="#F59E0B" />
                <text x="212" y="105" fill="#F59E0B" fontSize="8" fontFamily="monospace">FDB</text>
              </g>
              <g className="cursor-pointer" onClick={() => setSelectedStation('MTJ')}>
                <circle cx="300" cy="40" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="290" y="30" fill="#94A3B8" fontSize="8" fontFamily="monospace">MTJ</text>
              </g>
            </svg>

            {/* Map zoom controls */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1 z-20">
              <button className="w-5 h-5 rounded bg-[#161F2E] text-rail-muted hover:text-white border border-[#1E2633] flex items-center justify-center text-xs">
                +
              </button>
              <button className="w-5 h-5 rounded bg-[#161F2E] text-rail-muted hover:text-white border border-[#1E2633] flex items-center justify-center text-xs">
                -
              </button>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Punctuality Bar Chart (lg:col-span-2) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white tracking-tight">Punctuality</span>
              <div className="text-[10px] text-rail-muted bg-[#161F2E] px-1.5 py-0.5 rounded border border-[#1E2633]">
                This Month
              </div>
            </div>

            <div className="mt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-sans">94.7%</span>
                <span className="text-[10px] font-semibold text-[#10B981] font-mono">↑ 3.1%</span>
              </div>
              <span className="text-[9px] uppercase font-mono text-rail-muted">On-Time Performance</span>
            </div>
          </div>

          {/* Bar Chart matching reference visual */}
          <div className="h-28 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={punctualityData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" fill="#334155" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WIDGET 4: Environmental & Optimization Impact (lg:col-span-3) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-[#111827] border border-[#1E2633] shadow-card-dark flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white tracking-tight">Environmental Impact</span>
              <div className="flex items-center gap-1 text-[11px] text-rail-muted bg-[#161F2E] px-2 py-0.5 rounded-md border border-[#1E2633]">
                <span>This Month</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="text-[10px] uppercase font-mono text-rail-muted">CO₂ Saved</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-bold text-white tracking-tight font-sans">128.4</span>
                  <span className="text-xs text-rail-muted">Tons</span>
                </div>
                <span className="text-[10px] text-[#10B981] font-mono font-semibold">↑ 15.3%</span>
              </div>

              {/* Circular Green Leaf Gauge */}
              <div className="w-14 h-14 rounded-full border-2 border-[#10B981] bg-[#064E3B]/30 flex items-center justify-center text-[#10B981] shadow-glow-emerald">
                <Leaf className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E2633] mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Train className="w-3.5 h-3.5 text-rail-muted" />
              <div>
                <span className="text-[10px] text-rail-muted uppercase font-mono block">Trucks Off Road</span>
                <span className="font-bold text-white font-mono">62</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
              <div>
                <span className="text-[10px] text-rail-muted uppercase font-mono block">Trees Planted</span>
                <span className="font-bold text-white font-mono">1,240</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Drawer for Scheduled Block Details (from hero alert pill) */}
      {selectedDetailRequest && (
        <Modal
          isOpen={!!selectedDetailRequest}
          onClose={() => setSelectedDetailRequest(null)}
          title={`Scheduled Track Possession: ${selectedDetailRequest.id}`}
          description={`${selectedDetailRequest.maintenanceType} • ${selectedDetailRequest.assetName}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono text-rail-muted">
                Source: {selectedDetailRequest.sourceSystem} • Department: {selectedDetailRequest.department}
              </span>
              <button
                onClick={() => setSelectedDetailRequest(null)}
                className="px-4 py-1.5 rounded-md bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C]"
              >
                Close Details
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#161F2E] border border-[#1E2633] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Possession Slot Time & Section
                </span>
                <span className="text-xs font-mono text-[#10B981] font-bold">
                  {selectedDetailRequest.scheduledSlot?.timeWindow || '01:30 - 04:00 (Night Shadow)'}
                </span>
              </div>
              <div className="text-xs text-rail-muted">
                Location: {selectedDetailRequest.location} ({selectedDetailRequest.trackLine})
              </div>
              <div className="text-xs text-rail-muted">
                Duration: {selectedDetailRequest.estimatedDurationMinutes} minutes
              </div>
            </div>

            {/* AI Optimization Rationale */}
            {selectedDetailRequest.aiExplanation && (
              <div className="p-4 rounded-xl bg-[#161F2E] border border-[#1E2633] space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[#F97316] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Decision & Capacity Explanation</span>
                </div>
                <p className="text-rail-muted leading-relaxed">
                  {selectedDetailRequest.aiExplanation.timetableGaps}
                </p>
                {selectedDetailRequest.aiExplanation.bundledDepartments && (
                  <div className="mt-2 p-2 rounded bg-[#064E3B]/20 border border-[#10B981]/30 text-[#10B981] text-[11px]">
                    <strong>Cross-Department Co-Location: </strong>
                    Bundled with {selectedDetailRequest.aiExplanation.bundledDepartments.join(', ')} to save duplicate track blocks.
                  </div>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div className="p-4 rounded-xl bg-[#0D131D] border border-[#1E2633]">
              <StatusTimeline request={selectedDetailRequest} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
