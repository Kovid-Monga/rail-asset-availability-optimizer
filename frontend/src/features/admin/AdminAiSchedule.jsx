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
import { Sparkles, Calendar, Clock, CheckCircle2, SlidersHorizontal, ArrowRight, Layers } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span>AI-Generated Corridor Master Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated multi-department block allocations computed by the combinatorial optimization engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#0B0F17] text-xs text-slate-200 px-3 py-1.5 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>
          <Link to="/admin/manual-override">
            <Button size="sm" variant="danger" icon={SlidersHorizontal}>
              Manual Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Corridor Visual Diagram (Interactive with KLK-SML and NDLS-MTJ) */}
      <CorridorVisualization activeBlocks={requests} />

      {/* Scheduled Blocks Feed with Cross-Department Co-location Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Active Scheduled Possession Allocations ({requests.length} Slots)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="border-[#1F2937] bg-[#111827]">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
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
                      <span className="text-sm font-bold text-slate-100">{req.maintenanceType}</span>
                      <RequestStatusBadge status={req.status} />
                    </div>

                    <div className="text-xs text-slate-400">
                      Asset: <strong className="text-slate-200">{req.assetName}</strong> • {req.location}
                    </div>

                    {req.aiExplanation?.bundledDepartments && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Joint Block with {req.aiExplanation.bundledDepartments.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-[#0B0F17] p-3 rounded-lg border border-[#1F2937] shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Possession Window</span>
                      <span className="text-xs font-bold text-slate-200 block font-mono mt-0.5">
                        {req.scheduledSlot?.timeWindow || req.preferredWindow}
                      </span>
                    </div>
                    <div className="border-l border-[#1F2937] pl-4">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Duration</span>
                      <span className="text-xs font-bold text-emerald-400 block font-mono mt-0.5">
                        {req.scheduledSlot?.durationMinutes || req.estimatedDurationMinutes}m
                      </span>
                    </div>
                    <div className="border-l border-[#1F2937] pl-4">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">AI Score</span>
                      <span className="text-xs font-bold text-orange-400 block font-mono mt-0.5">
                        {req.score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
