import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { REQUEST_STAGES, DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { CorridorVisualization } from '../timetable/CorridorVisualization';
import { Sparkles, Calendar, Clock, CheckCircle2, SlidersHorizontal, ArrowRight } from 'lucide-react';

export const AdminAiSchedule = () => {
  const [requests, setRequests] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-09-08');

  useEffect(() => {
    async function load() {
      const data = await getAllRequests();
      setRequests(data.filter(r => r.scheduledSlot || r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN));
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rail-primary" />
            <span>AI-Generated Corridor Master Schedule</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Automated multi-department block allocations computed by the combinatorial optimization engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4 text-rail-muted" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#FCFAF5] text-xs px-2.5 py-1 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary font-mono"
            />
          </div>
          <Link to="/admin/manual-override">
            <Button size="sm" variant="danger" icon={SlidersHorizontal}>
              Manual Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Corridor Visual Diagram */}
      <CorridorVisualization activeBlocks={requests} />

      {/* Scheduled Blocks Feed with Cross-Department Co-location Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-rail-text uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rail-success" />
            <span>Scheduled Possessions for {selectedDate} ({requests.length} Allocations)</span>
          </h3>
          <span className="text-xs font-mono text-rail-muted">
            Optimization Confidence: 96.4% • 0 High-Speed Delays
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => {
            const dept = DEPARTMENTS[req.department] || DEPARTMENTS.ENG;
            return (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="bg-[#F2ECE1]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-rail-text">{req.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border font-mono ${dept.badgeColor}`}>
                        {dept.name}
                      </span>
                      <RequestStatusBadge status={req.status} />
                      <span className="text-xs font-bold text-rail-text">{req.maintenanceType}</span>
                      <span className="text-xs text-rail-muted">• {req.assetName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono bg-[#EAE3D5] text-rail-text px-2 py-0.5 rounded-sm border border-rail-border font-semibold">
                        ML Score: {req.score}/100
                      </div>
                      <PriorityTag priority={req.declaredPriority} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#FAF7F0] p-3 rounded-sm border border-rail-border text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rail-muted block">Possession Slot</span>
                      <span className="font-bold text-rail-text mt-0.5 block flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-rail-primary" />
                        {req.scheduledSlot?.timeWindow || req.preferredWindow}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rail-muted block">Corridor Section</span>
                      <span className="font-semibold text-rail-text mt-0.5 block truncate">
                        {req.corridor} ({req.trackLine})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rail-muted block">Location Marker</span>
                      <span className="font-semibold text-rail-text mt-0.5 block truncate">
                        {req.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-rail-muted block">Duration Granted</span>
                      <span className="font-bold text-rail-text mt-0.5 block font-mono">
                        {req.scheduledSlot?.durationMinutes || req.estimatedDurationMinutes} Minutes
                      </span>
                    </div>
                  </div>

                  {/* Bundling and Explanation */}
                  {req.aiExplanation && (
                    <div className="p-3 bg-[#EEF5F1] border border-rail-success/40 rounded-sm text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rail-success flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Co-location & Timetable Compatibility:
                        </span>
                        {req.aiExplanation.bundledDepartments && (
                          <span className="text-[10px] font-mono bg-white text-rail-primary px-2 py-0.2 rounded-sm border border-rail-primary/30 font-semibold">
                            Bundled with: {req.aiExplanation.bundledDepartments.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-rail-text leading-relaxed">
                        {req.aiExplanation.timetableGaps}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[11px] text-rail-muted font-mono">
                      Source Asset ID: {req.assetId} • Source Telemetry: {req.sourceSystem}
                    </span>
                    <Link to={`/admin/manual-override?id=${req.id}`}>
                      <Button size="sm" variant="outline">
                        Exception Override
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
