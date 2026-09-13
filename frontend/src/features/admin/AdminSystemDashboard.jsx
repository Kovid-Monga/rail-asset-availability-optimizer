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
  LineChart
} from 'lucide-react';

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
  // total active requests, critical requests, overdue maintenance, blocks scheduled today/this week, conflicts, human-review requests, completed
  const totalActive = requests.filter(r => r.status !== REQUEST_STAGES.COMPLETED).length;
  const criticalCount = requests.filter(r => r.declaredPriority === 'Critical' || r.score >= 90).length;
  const overdueCount = requests.filter(r => r.isOverdue).length;
  const scheduledBlocks = requests.filter(r => r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN).length;
  const conflictCount = requests.filter(r => r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED || r.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED).length;
  const humanReviewCount = requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW).length;
  const completedCount = requests.filter(r => r.status === REQUEST_STAGES.COMPLETED).length;

  return (
    <div className="space-y-6">
      {/* Central Admin Control Center Banner */}
      <div className="bg-[#2B2621] text-[#F7F4EC] p-5 rounded-md border border-rail-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight uppercase">
              Central Operations Control • Network Block Management Console
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#3E5C55] text-white rounded-sm font-semibold">
              Admin Authority
            </span>
          </div>
          <p className="text-xs text-[#D8D0C2] mt-1 max-w-3xl leading-relaxed">
            Autonomous AI Optimization Engine manages corridor capacity, bundles cross-department possessions, and enforces safety bounds. Central Admin intervenes for human review adjudications, high-level strategic planning, and exceptional safety overrides.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/admin/human-review">
            <Button variant="warning" size="sm" icon={Layers}>
              Review Queue ({humanReviewCount})
            </Button>
          </Link>
          <Link to="/admin/manual-override">
            <Button variant="danger" size="sm" icon={SlidersHorizontal}>
              Manual Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin KPI Counters Grid (Strict PRD Compliance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Active Requests */}
        <div className="bg-rail-surface border border-rail-border p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Total Active Requests
          </span>
          <div className="text-2xl font-bold text-rail-text mt-1">{totalActive}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Cross-Department</span>
        </div>

        {/* Critical Requests */}
        <div className="bg-rail-surface border border-rail-border p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-critical uppercase tracking-tight block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 shrink-0" />
            Critical Requests
          </span>
          <div className="text-2xl font-bold text-rail-critical mt-1">{criticalCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">High Safety Impact</span>
        </div>

        {/* Overdue Maintenance */}
        <div className="bg-rail-criticalLight/60 border border-rail-critical/40 p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-critical uppercase tracking-tight block flex items-center gap-1">
            <Flame className="w-3 h-3 shrink-0" />
            Overdue Work
          </span>
          <div className="text-2xl font-bold text-rail-critical mt-1">{overdueCount}</div>
          <span className="text-[10px] text-rail-critical font-medium mt-0.5 block">TMS / TDMS / SMMS</span>
        </div>

        {/* Blocks Scheduled */}
        <div className="bg-rail-surface border border-rail-border p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-success uppercase tracking-tight block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Scheduled Blocks
          </span>
          <div className="text-2xl font-bold text-rail-success mt-1">{scheduledBlocks}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">This Week</span>
        </div>

        {/* Active Conflicts */}
        <div className="bg-rail-surface border border-rail-border p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-warning uppercase tracking-tight block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Active Conflicts
          </span>
          <div className="text-2xl font-bold text-rail-warning mt-1">{conflictCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Unaccommodated</span>
        </div>

        {/* Human Review Requests */}
        <div className="bg-rail-secondaryLight border border-rail-secondary/40 p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-secondary uppercase tracking-tight block flex items-center gap-1">
            <Layers className="w-3 h-3 shrink-0" />
            Human Review
          </span>
          <div className="text-2xl font-bold text-rail-secondary mt-1">{humanReviewCount}</div>
          <span className="text-[10px] text-rail-secondary font-medium mt-0.5 block">Awaiting Adjudication</span>
        </div>

        {/* Completed */}
        <div className="bg-rail-surface border border-rail-border p-3.5 rounded-md">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Completed
          </span>
          <div className="text-2xl font-bold text-rail-text mt-1">{completedCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Past 7 Days</span>
        </div>
      </div>

      {/* Network Corridor Schematic */}
      <CorridorVisualization activeBlocks={requests} />

      {/* Two Column Section: Human Review Queue Highlights & Cross-Department Active Work */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Human Review Appeals */}
        <Card className="border-rail-secondary/50">
          <CardHeader className="bg-[#FAF4E6]">
            <CardTitle className="text-rail-secondary flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-rail-secondary" />
                <span>Human Review Backlog (Appeals Pending Decision)</span>
              </div>
              <Link to="/admin/human-review" className="text-xs text-rail-secondary hover:underline font-semibold flex items-center gap-1">
                Open Queue <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-rail-border/60">
              {requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.appealDetails).map(req => (
                <div key={req.id} className="p-4 hover:bg-[#FAF7ED] transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rail-text">{req.id}</span>
                      <span className="text-xs font-bold text-rail-text bg-[#ECE5D8] px-1.5 py-0.2 rounded-sm border border-rail-border">
                        {req.department}
                      </span>
                      <PriorityTag priority={req.declaredPriority} />
                    </div>
                    <span className="text-[10px] font-mono text-rail-secondary font-semibold">
                      Appeal Filed
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-rail-text">{req.maintenanceType} — {req.assetName}</h4>
                    <p className="text-[11px] text-rail-muted mt-0.5">
                      Grounds: <strong className="text-rail-text">{req.appealDetails?.reasonCategory}</strong>
                    </p>
                    <p className="text-[11px] text-rail-text/80 mt-1 italic line-clamp-2 bg-[#F5EFE3] p-2 rounded-sm border border-rail-border/50">
                      "{req.appealDetails?.appealText}"
                    </p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Link to={`/admin/human-review?id=${req.id}`}>
                      <Button size="sm" variant="secondary">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rail-primary" />
                <span>AI Automated Bundling Operations (Joint Blocks)</span>
              </div>
              <Link to="/admin/weekly-plan" className="text-xs text-rail-primary hover:underline font-semibold flex items-center gap-1">
                Weekly Grid <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="p-3.5 bg-[#EEF5F1] border border-rail-success/40 rounded-sm text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rail-success flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Corridor Km 14/2 - 15/8 Unified Mega Block
                </span>
                <span className="font-mono text-[10px] bg-white text-rail-success px-2 py-0.5 rounded-sm border border-rail-success/30 font-semibold">
                  Saves 150m Track Possession
                </span>
              </div>
              <p className="text-rail-text text-[11px] leading-relaxed">
                The AI engine has synchronized 3 distinct department operations into a single 01:30 - 04:00 night window:
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold pt-1">
                <div className="p-2 bg-white rounded-sm border border-rail-border text-[#3E5C55]">
                  ENG: Sleeper Renewal
                </div>
                <div className="p-2 bg-white rounded-sm border border-rail-border text-[#B5762E]">
                  TRD: OHE Splice
                </div>
                <div className="p-2 bg-white rounded-sm border border-rail-border text-[#4A6B82]">
                  S&T: Point Machine 41A
                </div>
              </div>
            </div>

            {/* Quick links to core admin functions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/admin/analytics" className="p-3 bg-[#FAF7F0] border border-rail-border hover:border-rail-borderDark rounded-sm text-xs space-y-1 block transition-colors">
                <span className="font-bold text-rail-text flex items-center gap-1.5">
                  <LineChart className="w-4 h-4 text-rail-primary" />
                  Optimization Analytics
                </span>
                <p className="text-[11px] text-rail-muted">
                  Compare BDMS manual baseline vs AI optimized metrics.
                </p>
              </Link>
              <Link to="/admin/critical-overdue" className="p-3 bg-[#FAF7F0] border border-rail-border hover:border-rail-borderDark rounded-sm text-xs space-y-1 block transition-colors">
                <span className="font-bold text-rail-critical flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Critical & Overdue Work
                </span>
                <p className="text-[11px] text-rail-muted">
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
