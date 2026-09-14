import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { AlertOctagon, AlertTriangle, Clock, ArrowRight, Layers, SlidersHorizontal } from 'lucide-react';

export const AdminConflictsAlerts = () => {
  const [conflictRequests, setConflictRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getAllRequests();
      setConflictRequests(all.filter(r =>
        r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED ||
        r.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED ||
        r.conflictReason
      ));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-amber-400 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
            <span>Corridor Conflicts & Capacity Bottlenecks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated conflict telemetry: Requests where preferred work windows collided with passenger trains or shared machinery constraints.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/human-review">
            <Button size="sm" variant="secondary" icon={Layers}>
              Appeals Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Conflicts List */}
      <div className="space-y-4">
        {conflictRequests.map((req) => (
          <Card key={req.id} className="border-amber-500/40 bg-[#111827]">
            <CardHeader className="bg-amber-500/10 border-b border-amber-500/20">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-orange-400">{req.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      req.department === 'ENG'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : req.department === 'TRD'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {req.department}
                  </span>
                  <span className="text-xs font-bold text-slate-100">{req.maintenanceType}</span>
                </div>
                <PriorityTag priority={req.declaredPriority} />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="text-xs text-slate-300">
                Asset: <strong>{req.assetName}</strong> • {req.location}
              </div>

              <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs space-y-1">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Collision / Bottleneck Reason (Requested: {req.preferredWindow}):</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {req.conflictReason || 'Corridor saturated during requested daylight window with high-priority passenger services.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs font-mono text-slate-400">
                  AI Proposed Alternatives: {req.alternatives?.length || 0} Slots Available
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/human-review?id=${req.id}`}>
                    <Button size="sm" variant="outline">
                      Inspect in Appeals Queue
                    </Button>
                  </Link>
                  <Link to={`/admin/manual-override?id=${req.id}`}>
                    <Button size="sm" variant="danger" icon={SlidersHorizontal}>
                      Force Manual Slot
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
