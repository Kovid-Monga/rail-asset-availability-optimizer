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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-warning tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rail-warning" />
            <span>Corridor Conflicts & Capacity Bottlenecks</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
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
          <Card key={req.id} className="border-rail-warning/60 bg-[#FAF7F0]">
            <CardHeader className="bg-[#FAF3E2]">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-rail-text">{req.id}</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 bg-[#EAE2D2] text-rail-text rounded-sm border border-rail-border">
                    {req.department}
                  </span>
                  <span className="text-xs font-semibold text-rail-text">{req.maintenanceType}</span>
                </div>
                <PriorityTag priority={req.declaredPriority} />
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-rail-criticalLight/40 border border-rail-critical/30 rounded-sm text-xs space-y-1">
                <span className="font-bold text-rail-critical flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Corridor Conflict: Preferred Window ({req.preferredWindow})
                </span>
                <p className="text-rail-text leading-relaxed">
                  {req.conflictReason}
                </p>
              </div>

              {/* Proposed Alternatives Status */}
              <div>
                <span className="text-[11px] font-bold text-rail-text uppercase tracking-wider block mb-1.5">
                  Automated Alternatives Generated ({req.alternatives?.length || 0} Slots):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {(req.alternatives || []).map((alt) => (
                    <div key={alt.id} className="p-2.5 bg-rail-surface border border-rail-border rounded-sm">
                      <div className="font-semibold text-rail-text">{alt.timeWindow}</div>
                      <div className="text-[10px] text-rail-muted font-mono">{alt.slotDate}</div>
                      <div className="text-[10px] text-rail-muted mt-1">{alt.impactScore}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-rail-border/60 text-xs">
                <span className="text-[11px] text-rail-muted">
                  Department Action: Awaiting acceptance or human review escalation
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/human-review?id=${req.id}`}>
                    <Button size="sm" variant="outline">
                      Review Appeal
                    </Button>
                  </Link>
                  <Link to={`/admin/manual-override?id=${req.id}`}>
                    <Button size="sm" variant="danger">
                      Resolve via Override
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
