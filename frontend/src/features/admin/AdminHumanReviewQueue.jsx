import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllRequests, adminReviewAppeal } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import {
  MessageSquareWarning,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

export const AdminHumanReviewQueue = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [modifiedTimeSlot, setModifiedTimeSlot] = useState('01:00 - 04:30 (Emergency Night Block)');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await getAllRequests();
      // Filter requests that have appeal details or are in human review stage
      const appealQueue = all.filter(r =>
        r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED ||
        r.status === REQUEST_STAGES.ADMIN_REVIEW ||
        r.appealDetails
      );
      setRequests(appealQueue);

      if (preselectedId) {
        const match = appealQueue.find(r => r.id === preselectedId);
        if (match) setSelectedRequest(match);
        else if (appealQueue.length > 0) setSelectedRequest(appealQueue[0]);
      } else if (appealQueue.length > 0) {
        setSelectedRequest(appealQueue[0]);
      }
      setLoading(false);
    }
    load();
  }, [preselectedId]);

  const handleDecision = async (decision) => {
    if (!selectedRequest) return;
    try {
      const remarks = adminRemarks || (decision === 'APPROVE_OVERRIDE'
        ? 'Approved by Chief Operations Manager. Emergency night possession granted in national interest.'
        : 'Appeal declined after corridor capacity review.');

      await adminReviewAppeal(selectedRequest.id, decision, remarks, {
        date: '2026-09-08',
        timeWindow: modifiedTimeSlot,
        section: selectedRequest.corridor,
        trackLine: selectedRequest.trackLine,
        durationMinutes: selectedRequest.estimatedDurationMinutes
      });

      setActionSuccess(`Adjudication confirmed: Request ${selectedRequest.id} marked as ${decision === 'APPROVE_OVERRIDE' ? 'Approved/Overridden' : 'Rejected'}.`);
      setAdminRemarks('');

      // Reload
      const all = await getAllRequests();
      const updatedQueue = all.filter(r =>
        r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED ||
        r.status === REQUEST_STAGES.ADMIN_REVIEW ||
        r.appealDetails
      );
      setRequests(updatedQueue);
      setSelectedRequest(updatedQueue.find(r => r.id === selectedRequest.id) || updatedQueue[0] || null);

      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to process appeal adjudication.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-rail-secondary" />
            <span>Human Review Adjudication Queue</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#FAF2E6] text-rail-secondary rounded-sm border border-rail-secondary/30 font-semibold">
              {requests.length} Pending Cases
            </span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Evaluate department appeals against algorithmic scheduling decisions, inspect submitted evidence, and grant exceptional administrative overrides.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-rail-successLight border border-rail-success/40 text-rail-success rounded-sm text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Appeals List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-rail-muted uppercase tracking-wider block">
            Awaiting Adjudication
          </span>
          <div className="space-y-2">
            {requests.length === 0 ? (
              <div className="p-4 bg-rail-surface border border-rail-border rounded-md text-xs text-rail-muted text-center">
                No active human review appeals in queue.
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                    selectedRequest?.id === req.id
                      ? 'bg-[#FAF4E6] border-rail-secondary shadow-xs'
                      : 'bg-rail-surface border-rail-border hover:bg-[#F9F7F1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-rail-text">{req.id}</span>
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <div className="text-xs font-semibold text-rail-text truncate">
                    {req.maintenanceType}
                  </div>
                  <div className="text-[11px] text-rail-muted mt-0.5">
                    {req.department} • {req.assetName}
                  </div>
                  <div className="mt-2 text-[10px] text-rail-secondary font-medium truncate">
                    Grounds: {req.appealDetails?.reasonCategory || 'Field constraint'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Cols: Adjudication Decision Cockpit */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRequest ? (
            <Card className="border-rail-secondary/60">
              <CardHeader className="bg-[#FAF2E2]">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-rail-text">
                        {selectedRequest.id}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-[#EAE2D2] text-rail-text rounded-sm border border-rail-border">
                        {selectedRequest.department} Department
                      </span>
                      <PriorityTag priority={selectedRequest.declaredPriority} />
                    </div>
                    <p className="text-xs text-rail-muted mt-0.5">
                      {selectedRequest.maintenanceType} — {selectedRequest.assetName}
                    </p>
                  </div>
                  <RequestStatusBadge status={selectedRequest.status} />
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* 1. Department Submitted Appeal & Physical Evidence */}
                <div className="p-4 bg-[#FAF7ED] border border-rail-secondary/40 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rail-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquareWarning className="w-4 h-4" />
                      Department Appeal Submission
                    </span>
                    <span className="text-[10px] font-mono text-rail-muted">
                      Filed: {selectedRequest.appealDetails?.submittedAt || 'Recent'}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-rail-text">Grounds: </span>
                    <span className="font-bold text-rail-critical">
                      {selectedRequest.appealDetails?.reasonCategory || 'Field condition deviation'}
                    </span>
                  </div>
                  <p className="text-xs text-rail-text/90 italic leading-relaxed bg-white p-3 rounded-sm border border-rail-border">
                    "{selectedRequest.appealDetails?.appealText || selectedRequest.description}"
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-rail-muted">
                    <span>Officer: {selectedRequest.appealDetails?.submittedBy || 'Department Officer'}</span>
                    <span className="font-mono flex items-center gap-1 text-rail-primary font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      {selectedRequest.appealDetails?.evidenceAttachment || 'USFD_Inspection_Scan.pdf'}
                    </span>
                  </div>
                </div>

                {/* 2. Original AI Decision & What Drove It */}
                <div className="p-4 bg-[#F2EDE2] border border-rail-border rounded-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rail-text uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-rail-primary" />
                      Original AI Optimization Engine Decision
                    </span>
                    <span className="font-mono text-rail-primary font-bold">
                      Calculated Priority: {selectedRequest.score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-rail-muted">
                    <div>
                      <strong className="text-rail-text block mb-0.5">Algorithm Rationale:</strong>
                      <p>{selectedRequest.conflictReason || 'Optimal slot computed in night shadow window.'}</p>
                    </div>
                    <div>
                      <strong className="text-rail-text block mb-0.5">Corridor Feasibility:</strong>
                      <p>{selectedRequest.aiExplanation?.timetableGaps || 'High passenger train density on UP line.'}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Conflicting Timetable Overlay */}
                <div className="p-3.5 bg-rail-surface border border-rail-border rounded-sm text-xs space-y-2">
                  <span className="font-bold text-rail-text uppercase tracking-wider block">
                    Conflicting Timetable Overlay
                  </span>
                  <div className="text-[11px] text-rail-muted space-y-1">
                    <div className="flex items-center justify-between p-1.5 bg-[#FAF7F0] rounded-sm">
                      <span>#22436 Vande Bharat Express (06:00 - 07:18)</span>
                      <Badge variant="primary" size="sm">Hard Constraint</Badge>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-[#FAF7F0] rounded-sm">
                      <span>#GF-BOXN-902 Freight Rake (01:30 - 04:00)</span>
                      <Badge variant="secondary" size="sm">Soft Constraint (Can Regulate)</Badge>
                    </div>
                  </div>
                </div>

                {/* 4. Admin Action Adjudication Controls */}
                <div className="p-4 bg-[#FAF7F0] border border-rail-border rounded-sm space-y-3">
                  <span className="text-xs font-bold text-rail-text uppercase tracking-wider block">
                    Administrative Adjudication
                  </span>

                  <div>
                    <label className="block text-xs font-semibold text-rail-text mb-1">
                      Designated Overridden Possession Slot
                    </label>
                    <input
                      type="text"
                      value={modifiedTimeSlot}
                      onChange={(e) => setModifiedTimeSlot(e.target.value)}
                      className="w-full bg-white text-xs px-3 py-1.5 rounded-sm border border-rail-border font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-rail-text mb-1">
                      Chief Operations Controller Order & Audit Remarks
                    </label>
                    <textarea
                      rows={2}
                      value={adminRemarks}
                      onChange={(e) => setAdminRemarks(e.target.value)}
                      placeholder="e.g. Approved emergency night slot. High ultrasonic defect risk outweighs 30m freight regulation."
                      className="w-full bg-white text-xs p-2 rounded-sm border border-rail-border"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDecision('REJECT')}
                      icon={XCircle}
                    >
                      Reject Appeal
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDecision('APPROVE_OVERRIDE')}
                      icon={CheckCircle2}
                    >
                      Approve & Grant Override Block
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-rail-muted text-xs bg-rail-surface border border-rail-border rounded-md">
              Select an appeal from the left queue to review case details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
