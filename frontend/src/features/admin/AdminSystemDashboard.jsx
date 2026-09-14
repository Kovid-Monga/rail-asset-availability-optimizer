import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { CorridorVisualization } from '../timetable/CorridorVisualization';
import {
  Layers,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  Flame,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  LineChart,
  Activity,
  TrendingUp,
  Zap,
  Leaf,
  Train,
  ShieldCheck,
  Compass
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip
} from 'recharts';

export const AdminSystemDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getAllRequests();
      setRequests(all);
      setLoading(false);
    }
    load();
  }, []);

  // Admin KPIs mapped strictly to prompt requirements:
  const totalActive = requests.filter(r => r.status !== REQUEST_STAGES.COMPLETED).length;
  const criticalCount = requests.filter(r => r.declaredPriority === 'Critical' || r.score >= 90).length;
  const overdueCount = requests.filter(r => r.isOverdue).length;
  const scheduledBlocks = requests.filter(r => r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN).length;
  const conflictCount = requests.filter(r => r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED || r.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED).length;
  const humanReviewCount = requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW).length;
  const completedCount = requests.filter(r => r.status === REQUEST_STAGES.COMPLETED).length;

  // Mini chart data for Performance Overview (Ledgerix style)
  const performanceCurve = [
    { day: '1', eff: 91 },
    { day: '2', eff: 93 },
    { day: '3', eff: 92 },
    { day: '4', eff: 95 },
    { day: '5', eff: 94 },
    { day: '6', eff: 96 },
    { day: '7', eff: 96.4 }
  ];

  const punctualityBars = [
    { day: 'Mon', val: 94 },
    { day: 'Tue', val: 96 },
    { day: 'Wed', val: 93 },
    { day: 'Thu', val: 95 },
    { day: 'Fri', val: 92 },
    { day: 'Sat', val: 97 },
    { day: 'Sun', val: 95 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Operations Manager Header & Alert Bar (Matching Ledgerix reference) */}
      <div className="p-4 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-glow-orange">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-rail-primary shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold">
                Possession Scheduled
              </span>
              <span className="text-xs font-semibold text-white">
                Corridor Section Km 14/2 - 15/8 (NZM-TKD)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Joint Mega Block (ENG Sleeper + TRD OHE + S&T Point Machine) • Tomorrow 01:30 AM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/human-review">
            <Button variant="warning" size="sm" icon={Layers}>
              Appeals Queue ({humanReviewCount})
            </Button>
          </Link>
          <Link to="/admin/manual-override">
            <Button variant="danger" size="sm" icon={SlidersHorizontal}>
              Manual Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Ledgerix Performance & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Performance Overview (Matching Ledgerix top-left card) */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Performance Overview
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white tracking-tight">96.4%</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +4.2%
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Corridor Overall Efficiency</span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
              This Month
            </span>
          </div>

          {/* Glowing curve area chart */}
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceCurve}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="eff" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#perfGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Punctuality</span>
              <span className="text-xs font-bold text-emerald-400">94.7%</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Avg Delay</span>
              <span className="text-xs font-bold text-white">02:45m</span>
            </div>
            <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Trips Run</span>
              <span className="text-xs font-bold text-white">1,247</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Train & Infrastructure Health (Matching Ledgerix Train Health card) */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Infrastructure & Fleet Health
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Normal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Track Geometry</span>
                <span className="font-bold text-emerald-400 font-mono">98%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[98%] h-full bg-emerald-400 rounded-full" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">25kV OHE Catenary</span>
                <span className="font-bold text-emerald-400 font-mono">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-emerald-400 rounded-full" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Electronic Interlocking</span>
                <span className="font-bold text-emerald-400 font-mono">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-emerald-400 rounded-full" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Substation Feeder</span>
                <span className="font-bold text-amber-400 font-mono">97%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[97%] h-full bg-amber-400 rounded-full" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Source Telemetry Feeds: TMS • TDMS • SMMS</span>
            <span className="font-mono text-slate-300">Live Sync</span>
          </div>
        </Card>

        {/* Card 3: Energy & Environmental Efficiency (Matching Ledgerix right-side cards) */}
        <Card className="bg-slate-900/80 border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Optimization Environmental Impact
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">This Month</span>
          </div>

          <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">CO2 Emissions Saved</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">128.4 Tons</div>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> +15.3% vs manual BDMS
              </span>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-glow-emerald shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Block Capacity</span>
                <span className="font-bold text-white">87% Utilized</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Detention Avoided</span>
                <span className="font-bold text-white">275 mins</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin KPI Counters Grid (Strict PRD Compliance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Active Requests */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Total Active Requests
          </span>
          <div className="text-2xl font-black text-white mt-1">{totalActive}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Cross-Department</span>
        </div>

        {/* Critical Requests */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tight block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Critical Requests
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1">{criticalCount}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">High Safety Impact</span>
        </div>

        {/* Overdue Maintenance */}
        <div className="bg-rose-950/30 border border-rose-500/40 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tight block flex items-center gap-1">
            <Flame className="w-3 h-3 shrink-0" />
            Overdue Work
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1">{overdueCount}</div>
          <span className="text-[10px] text-rose-400/80 font-medium mt-0.5 block">TMS/TDMS/SMMS</span>
        </div>

        {/* Blocks Scheduled */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Scheduled Blocks
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{scheduledBlocks}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">This Week</span>
        </div>

        {/* Active Conflicts */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-tight block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Active Conflicts
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">{conflictCount}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Unaccommodated</span>
        </div>

        {/* Human Review Requests */}
        <div className="bg-orange-950/30 border border-orange-500/40 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tight block flex items-center gap-1">
            <Layers className="w-3 h-3 shrink-0" />
            Human Review
          </span>
          <div className="text-2xl font-black text-orange-400 mt-1">{humanReviewCount}</div>
          <span className="text-[10px] text-orange-400 font-medium mt-0.5 block">Awaiting Decision</span>
        </div>

        {/* Completed */}
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl shadow-card-dark">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Completed
          </span>
          <div className="text-2xl font-black text-slate-200 mt-1">{completedCount}</div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Past 7 Days</span>
        </div>
      </div>

      {/* Network Corridor Schematic */}
      <CorridorVisualization activeBlocks={requests} />

      {/* Two Column Section: Human Review Queue Highlights & Cross-Department Active Work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Human Review Appeals */}
        <Card className="border-orange-500/40 bg-slate-900/80">
          <CardHeader className="bg-orange-950/20 border-b border-orange-500/30">
            <CardTitle className="text-orange-400 flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                <span>Human Review Backlog (Appeals Pending Decision)</span>
              </div>
              <Link to="/admin/human-review" className="text-xs text-rail-primary hover:underline font-semibold flex items-center gap-1">
                Open Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/80">
              {requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.appealDetails).map(req => (
                <div key={req.id} className="p-4 hover:bg-slate-800/40 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{req.id}</span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {req.department}
                      </span>
                      <PriorityTag priority={req.declaredPriority} />
                    </div>
                    <span className="text-[10px] font-mono text-orange-400 font-semibold bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">
                      Appeal Active
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{req.maintenanceType} — {req.assetName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Grounds: <strong className="text-slate-200">{req.appealDetails?.reasonCategory}</strong>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 italic line-clamp-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                      "{req.appealDetails?.appealText}"
                    </p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Link to={`/admin/human-review?id=${req.id}`}>
                      <Button size="sm" variant="default" className="shadow-glow-orange">
                        Adjudicate Appeal
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cross-Department Multi-Activity Bundling Status */}
        <Card className="bg-slate-900/80">
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-rail-primary" />
                <span>AI Automated Bundling Operations (Joint Blocks)</span>
              </div>
              <Link to="/admin/weekly-plan" className="text-xs text-rail-primary hover:underline font-semibold flex items-center gap-1">
                Weekly Grid <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Corridor Km 14/2 - 15/8 Unified Mega Block
                </span>
                <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold">
                  Saves 150m Track Possession
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                The AI engine has synchronized 3 distinct department operations into a single 01:30 - 04:00 night window:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold pt-1">
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-sky-400">
                  ENG: Sleeper Renewal
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-amber-400">
                  TRD: OHE Splice
                </div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-purple-400">
                  S&T: Point Machine 41A
                </div>
              </div>
            </div>

            {/* Quick links to core admin functions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/admin/analytics" className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-xs space-y-1 block transition-all hover:bg-slate-950">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-rail-primary" />
                  Optimization Analytics
                </span>
                <p className="text-[11px] text-slate-400">
                  Compare BDMS manual baseline vs AI optimized metrics.
                </p>
              </Link>
              <Link to="/admin/critical-overdue" className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl text-xs space-y-1 block transition-all hover:bg-slate-950">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Critical & Overdue Work
                </span>
                <p className="text-[11px] text-slate-400">
                  Triage high-tonnage track flaws and expired inspections.
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
