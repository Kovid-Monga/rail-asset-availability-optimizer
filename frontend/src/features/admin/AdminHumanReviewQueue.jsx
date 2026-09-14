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
  Layers,
  FileText
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Human Review Adjudication Queue</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/30 font-semibold">
              {requests.length} Pending Cases
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate departmental appeals against automated scheduling decisions, inspect submitted evidence, and grant administrative overrides.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-md text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Appeals List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Awaiting Adjudication
          </span>
          <div className="space-y-2">
            {requests.length === 0 ? (
              <div className="p-4 bg-[#111827] border border-[#1F2937] rounded-lg text-xs text-slate-500 text-center">
                No active human review appeals in queue.
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#111827] border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-[#111827] border-[#1F2937] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-orange-400">{req.id}</span>
                      <RequestStatusBadge status={req.status} />
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {req.maintenanceType}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {req.department} • {req.assetName}
                    </div>
                    <div className="mt-2 text-[10px] text-amber-400 font-medium truncate">
                      Grounds: {req.appealDetails?.reasonCategory || 'Field constraint'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Appeal Detail & Adjudication Controls */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="border-[#1F2937] bg-[#111827]">
              <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-orange-400">{selectedRequest.id}</span>
                    <RequestStatusBadge status={selectedRequest.status} />
                    <span className="text-xs font-semibold text-slate-200">{selectedRequest.department} Department</span>
                  </div>
                  <PriorityTag priority={selectedRequest.declaredPriority} />
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Basic Requirement Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-3 rounded-lg border border-[#1F2937] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Asset</span>
                    <span className="font-semibold text-slate-200 truncate block mt-0.5">{selectedRequest.assetName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Location</span>
                    <span className="font-semibold text-slate-200 truncate block mt-0.5">{selectedRequest.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Duration</span>
                    <span className="font-semibold text-slate-200 font-mono block mt-0.5">{selectedRequest.estimatedDurationMinutes}m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Preferred Window</span>
                    <span className="font-semibold text-slate-200 truncate block mt-0.5">{selectedRequest.preferredWindow}</span>
                  </div>
                </div>

                {/* Appeal Grounds Box */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <MessageSquareWarning className="w-4 h-4" />
                      Department Officer Appeal Statement
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Filed: {selectedRequest.appealDetails?.appealDate || '2026-09-07'}
                    </span>
                  </div>
                  <div className="text-slate-200 font-semibold">
                    Category: {selectedRequest.appealDetails?.reasonCategory || 'Defect worse than source data captured'}
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-[#0B0F17] p-3 rounded border border-[#1F2937]">
                    "{selectedRequest.appealDetails?.appealText || selectedRequest.conflictReason || 'Field ultrasonic inspection reveals 14mm rail flaw requiring urgent replacement before scheduled weekend slot.'}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">
                      Submitted by: <strong className="text-slate-200">{selectedRequest.appealDetails?.submittedBy || 'Senior Section Engineer'}</strong>
                    </span>
                    <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {selectedRequest.appealDetails?.evidenceAttachment || 'USFD_Flaw_Report.pdf'}
                    </span>
                  </div>
                </div>

                {/* Algorithmic Decision Context */}
                <div className="p-4 bg-[#0B0F17] border border-[#1F2937] rounded-lg text-xs space-y-2">
                  <span className="font-bold text-orange-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    AI Optimization Assessment
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
                    <div>
                      <strong className="text-slate-300">Timetable Feasibility: </strong>
                      {selectedRequest.aiExplanation?.timetableGaps || 'Dense morning passenger corridor (12004 Shatabdi & 22436 Vande Bharat).'}
                    </div>
                    <div>
                      <strong className="text-slate-300">Goods Freight Impact: </strong>
                      {selectedRequest.aiExplanation?.goodsImpact || '3 container rakes held if daylight block is granted.'}
                    </div>
                  </div>
                </div>

                {/* Adjudication Controls */}
                <div className="space-y-3 pt-2 border-t border-[#1F2937]">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Central Operations Adjudication
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Override Schedule Slot (If Approved)
                      </label>
                      <input
                        type="text"
                        value={modifiedTimeSlot}
                        onChange={(e) => setModifiedTimeSlot(e.target.value)}
                        className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Controller Adjudication Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Approved under emergency track safety powers..."
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDecision('REJECT')}
                      icon={XCircle}
                    >
                      Decline Appeal (Uphold AI Schedule)
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => handleDecision('APPROVE_OVERRIDE')}
                      icon={CheckCircle2}
                    >
                      Approve & Grant Override Window
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 bg-[#111827] border border-[#1F2937] rounded-lg text-center text-slate-500 text-xs">
              Select an appeal from the queue to view full evidence and adjudicate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
