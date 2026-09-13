import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequestsByDepartment } from '../../services/requests';
import { fetchTmsAssets } from '../../services/tms';
import { fetchTdmsAssets } from '../../services/tdms';
import { fetchSmmsAssets } from '../../services/smms';
import { REQUEST_STAGES, DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { CorridorVisualization } from '../timetable/CorridorVisualization';
import { useNotifications } from '../../context/NotificationContext';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert,
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';

export const SharedDepartmentDashboard = () => {
  const { currentRole } = useAuth();
  const deptKey = currentRole === 'ADMIN' ? 'ENG' : currentRole;
  const deptConfig = DEPARTMENTS[deptKey] || DEPARTMENTS.ENG;

  const [requests, setRequests] = useState([]);
  const [sourceAssets, setSourceAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let assetsPromise;
        if (deptKey === 'ENG') assetsPromise = fetchTmsAssets();
        else if (deptKey === 'TRD') assetsPromise = fetchTdmsAssets();
        else if (deptKey === 'SNT') assetsPromise = fetchSmmsAssets();

        const [reqs, assets] = await Promise.all([
          getRequestsByDepartment(deptKey),
          assetsPromise
        ]);
        setRequests(reqs);
        setSourceAssets(assets || []);
      } catch (err) {
        console.error("Failed to load department dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [deptKey]);

  // Compute exact PRD KPI Counters
  const totalCount = requests.length;
  const underMLCount = requests.filter(r => r.status === REQUEST_STAGES.ML_PRIORITIZATION).length;
  const underOptCount = requests.filter(r => r.status === REQUEST_STAGES.OPTIMIZATION).length;
  const scheduledCount = requests.filter(r => r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN).length;
  const cannotAccommodateCount = requests.filter(r => r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED || r.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED).length;
  const humanReviewCount = requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW).length;
  const completedCount = requests.filter(r => r.status === REQUEST_STAGES.COMPLETED).length;
  // Overdue flagged from source system
  const overdueCount = requests.filter(r => r.isOverdue).length + (sourceAssets.filter(a => a.isOverdue).length || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Department Identity */}
      <div className="bg-[#EAE4D7] border border-rail-border p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-rail-text">
              {deptConfig.name} • Operational Planning Console
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border font-semibold ${deptConfig.badgeColor}`}>
              {deptConfig.sourceSystem} Live Feed
            </span>
          </div>
          <p className="text-xs text-rail-muted mt-1 max-w-3xl">
            <strong className="text-rail-text font-semibold">Core Principle:</strong> {deptConfig.shortCode} declares physical site requirements, track possession windows, and equipment constraints. The AI Prioritization Layer and Optimization Engine automatically determine optimal block allocation and cross-department bundling.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to={`/${deptKey.toLowerCase()}/new-request`}>
            <Button variant="default" icon={PlusCircle}>
              New Maintenance Request
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Counters Grid - Exact PRD Metric Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-muted uppercase tracking-tight block truncate">
            Total Requests
          </span>
          <div className="text-xl font-bold text-rail-text mt-1">{totalCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">{deptConfig.sourceSystem} Ingested</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-primary uppercase tracking-tight block truncate flex items-center gap-1">
            <Cpu className="w-3 h-3 shrink-0" />
            ML Prioritization
          </span>
          <div className="text-xl font-bold text-rail-primary mt-1">{underMLCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Algorithmic scoring</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-[#2E6B65] uppercase tracking-tight block truncate flex items-center gap-1">
            <Sparkles className="w-3 h-3 shrink-0" />
            Optimization
          </span>
          <div className="text-xl font-bold text-[#2E6B65] mt-1">{underOptCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Timetable batch</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-success uppercase tracking-tight block truncate flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Auto-Scheduled
          </span>
          <div className="text-xl font-bold text-rail-success mt-1">{scheduledCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Conflict-free</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-warning uppercase tracking-tight block truncate flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Unaccommodated
          </span>
          <div className="text-xl font-bold text-rail-warning mt-1">{cannotAccommodateCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Alt slots available</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-secondary uppercase tracking-tight block truncate flex items-center gap-1">
            <Layers className="w-3 h-3 shrink-0" />
            Human Review
          </span>
          <div className="text-xl font-bold text-rail-secondary mt-1">{humanReviewCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Under appeal</span>
        </div>

        <div className="bg-rail-surface border border-rail-border p-3 rounded-md">
          <span className="text-[10px] font-semibold text-rail-muted uppercase tracking-tight block truncate flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Completed
          </span>
          <div className="text-xl font-bold text-rail-text mt-1">{completedCount}</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">Fit certified</span>
        </div>

        <div className="bg-rail-criticalLight/50 border border-rail-critical/40 p-3 rounded-md">
          <span className="text-[10px] font-bold text-rail-critical uppercase tracking-tight block truncate flex items-center gap-1">
            <Flame className="w-3 h-3 shrink-0" />
            Overdue Work
          </span>
          <div className="text-xl font-bold text-rail-critical mt-1">{overdueCount}</div>
          <span className="text-[10px] text-rail-critical font-medium mt-0.5 block">{deptConfig.sourceSystem} flag</span>
        </div>
      </div>

      {/* Corridor Spatial Map */}
      <CorridorVisualization activeBlocks={requests} />

      {/* Main Grid: Active Requirements & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <span>Active {deptConfig.name} Requirements</span>
                <span className="text-xs font-normal text-rail-muted">({requests.length} records)</span>
              </CardTitle>
              <Link to={`/${deptKey.toLowerCase()}/requests`} className="text-xs text-rail-primary hover:underline font-semibold flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-rail-border/60">
                {requests.map((req) => (
                  <div key={req.id} className="p-4 hover:bg-[#F9F6EE] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-rail-text">
                          {req.id}
                        </span>
                        <RequestStatusBadge status={req.status} />
                        <PriorityTag priority={req.declaredPriority} />
                        {req.isOverdue && (
                          <Badge variant="critical" size="sm">
                            {deptConfig.sourceSystem} OVERDUE ({req.overdueDate})
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-rail-text">
                        {req.maintenanceType} — {req.assetName}
                      </h4>
                      <p className="text-xs text-rail-muted line-clamp-1">
                        {req.location} • Preferred: {req.preferredWindow} • Duration: {req.estimatedDurationMinutes}m
                      </p>
                      {req.aiExplanation?.bundledDepartments && (
                        <div className="text-[11px] text-rail-primary font-medium flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Co-located block: {req.aiExplanation.bundledDepartments.join(', ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED ? (
                        <Link to={`/${deptKey.toLowerCase()}/scheduled-work`}>
                          <Button size="sm" variant="warning">
                            Review Alternatives
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/${deptKey.toLowerCase()}/requests?id=${req.id}`}>
                          <Button size="sm" variant="outline">
                            Timeline & Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Source System Overdue Alerts */}
          <Card className="border-rail-warning/50">
            <CardHeader className="bg-[#FAF4E6]">
              <CardTitle className="text-rail-warning flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rail-critical" />
                <span>{deptConfig.sourceSystem} Source System Alerts: Overdue Maintenance Cycles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {sourceAssets.filter(a => a.isOverdue || a.healthStatus === 'Critical' || a.healthStatus === 'Worn Wire' || a.healthStatus === 'High Friction').map(asset => (
                <div key={asset.id} className="p-3 bg-[#FAF7ED] border border-rail-border rounded-sm flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rail-text">{asset.id}</span>
                      <Badge variant="critical">
                        {asset.healthStatus}
                      </Badge>
                      <span className="text-xs font-semibold text-rail-text">{asset.name}</span>
                    </div>
                    <p className="text-xs text-rail-muted mt-1 leading-relaxed">
                      {asset.defectDescription}
                    </p>
                    <span className="text-[10px] font-mono text-rail-critical font-semibold mt-1 inline-block">
                      Flagged overdue since {asset.overdueDate || 'Current cycle'}
                    </span>
                  </div>
                  <Link to={`/${deptKey.toLowerCase()}/new-request?assetId=${asset.id}`}>
                    <Button size="sm" variant="subtle" className="shrink-0">
                      Submit Block Requirement
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Operations Notifications Feed */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-rail-primary" />
                <span>{deptConfig.shortCode} Operations Feed</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-rail-border/60 max-h-[500px] overflow-y-auto">
                {notifications.filter(n => n.department === deptKey || n.department === 'GLOBAL').map(notif => (
                  <div key={notif.id} className="p-3.5 hover:bg-[#F9F7F1] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-rail-text">{notif.title}</span>
                      <span className="text-[10px] font-mono text-rail-muted">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-rail-muted mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.requestId && (
                      <span className="inline-block mt-1 font-mono text-[10px] bg-[#ECE5D8] px-1.5 py-0.5 rounded-sm border border-rail-border text-rail-text">
                        Ref: {notif.requestId}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Decision Rules Transparency Box */}
          <div className="p-4 bg-[#F2EDE2] border border-rail-border rounded-md text-xs space-y-2">
            <h4 className="font-bold text-rail-text flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-rail-primary" />
              Optimization Transparency
            </h4>
            <p className="text-rail-muted leading-relaxed">
              Track block scheduling uses mathematical optimization to protect non-negotiable passenger services while maximizing asset availability.
            </p>
            <ul className="text-[11px] text-rail-muted space-y-1 list-disc list-inside">
              <li>High-speed passenger paths (Vande Bharat / Rajdhani) are hard constraints.</li>
              <li>Freight trains are held or re-routed via 3rd lines.</li>
              <li>Co-located work across ENG, TRD, and S&T is automatically bundled to save corridor possessions.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
