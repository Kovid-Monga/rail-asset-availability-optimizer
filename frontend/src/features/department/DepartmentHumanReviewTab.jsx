import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Send, 
  ArrowRight, 
  ShieldAlert, 
  FileCheck, 
  HelpCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getRequestsByDepartment, submitHumanReviewAppeal } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';

const APPEAL_REASONS = [
  'Defect worse than source data captured (e.g. USFD ultrasonic flaw detected, rail fracture risk)',
  'Deadline more important than represented (e.g. CRS statutory inspection limit)',
  'New physical / ultrasonic track evidence available',
  'Physical or machine clearance constraint not captured in scheduling profile',
  'Safety hazard requiring emergency daytime possession rather than night window'
];

export const DepartmentHumanReviewTab = () => {
  const { effectiveRole, currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [reasonCategory, setReasonCategory] = useState(APPEAL_REASONS[0]);
  const [appealText, setAppealText] = useState('');
  const [fileName, setFileName] = useState('USFD_Ultrasonic_Flaw_Report_Km14.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter state for appeal history
  const [filterStatus, setFilterStatus] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRequestsByDepartment(effectiveRole);
      setRequests(data);
      if (data.length > 0 && !selectedRequestId) {
        setSelectedRequestId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load department requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequestId || !appealText.trim()) return;

    setSubmitting(true);
    try {
      await submitHumanReviewAppeal(selectedRequestId, {
        reasonCategory,
        appealText: appealText.trim(),
        evidenceAttachment: fileName,
        submittedBy: `${currentUser?.name || 'Officer'} (${currentUser?.designation || 'Sr. Engineer'})`
      });

      addNotification({
        title: 'Appeal Escalated to Central Admin',
        message: `Human review dispute lodged for ${selectedRequestId}: ${reasonCategory.split('(')[0]}`,
        type: 'APPEAL',
        source: 'DEPARTMENT',
        department: effectiveRole,
        requestId: selectedRequestId
      });

      setSubmitSuccess(true);
      setAppealText('');
      await loadData();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit appeal', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter appeals history
  const appealsHistory = requests.filter(r => {
    const isAppealed = r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || 
                       r.status === REQUEST_STAGES.ADMIN_REVIEW ||
                       r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN ||
                       r.appealDetails;
    if (!isAppealed) return false;

    if (filterStatus === 'PENDING') {
      return r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW;
    }
    if (filterStatus === 'RESOLVED') {
      return r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN || r.status === REQUEST_STAGES.REJECTED;
    }
    return true;
  });

  const selectedRequest = requests.find(r => r.id === selectedRequestId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-orange-500/10 text-[#F97316] border border-orange-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Department Dispute & Human Review Hub</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-[#F97316] border border-orange-500/30">
                {effectiveRole} Escalation
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispute automated AI slotting decisions, request emergency possession windows, or present newly discovered ultrasonic defect data to Central Control.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400">Total Active Appeals:</span>
          <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs font-mono border border-orange-500/30">
            {appealsHistory.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED).length} Pending Review
          </span>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Appeal successfully dispatched to Central Operations Control. Admin review queued.</span>
          </div>
          <span className="font-mono text-[10px]">Reference: ADM-ESC-2026</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Appeal Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#F97316]" />
                <h2 className="text-base font-bold text-white">File AI Slot Appeal / Ground Dispute</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">PRD Form HR-02</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Request Selector */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Select Track Maintenance Request to Appeal <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => setSelectedRequestId(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#F97316]"
                >
                  {requests.map(req => (
                    <option key={req.id} value={req.id}>
                      {req.id} — {req.maintenanceType} ({req.location?.split('(')[0] || req.corridor}) [{req.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Request Summary Card */}
              {selectedRequest && (
                <div className="bg-[#1E293B]/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Current AI Allocated Slot:</span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      {selectedRequest.scheduledSlot?.timeWindow || selectedRequest.preferredWindow || 'Pending Schedule'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Current Status:</span>
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Asset & Location:</span>
                    <span className="text-white truncate max-w-[280px] font-mono">
                      {selectedRequest.location || selectedRequest.assetName}
                    </span>
                  </div>
                </div>
              )}

              {/* Standard Ground Category */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Standard Ground for Appeal (PRD Specification) <span className="text-red-400">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-[#F97316]"
                >
                  {APPEAL_REASONS.map((r, idx) => (
                    <option key={idx} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Technical Justification */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Technical Justification & Inspector Remarks <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={appealText}
                  onChange={(e) => setAppealText(e.target.value)}
                  placeholder="Provide precise technical reasons why the AI assigned window is insufficient (e.g., USFD flaw echo amplification, temperature rail expansion limits, overhead clearance requirements)..."
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#F97316]"
                  required
                />
              </div>

              {/* Simulated File Attachment */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Supporting Diagnostic File / Flaw Report
                </label>
                <div className="flex items-center space-x-3 p-3 bg-[#1E293B]/60 rounded-xl border border-slate-700">
                  <Upload className="w-5 h-5 text-[#F97316] shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="text-white font-mono text-xs">{fileName}</span>
                    <span className="text-slate-500 text-[10px] block">Verified digital signature attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFileName(`USFD_Flaw_Report_Km${Math.floor(Math.random() * 50) + 10}.pdf`)}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  >
                    Change File
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !selectedRequestId || !appealText.trim()}
                  className="w-full py-3 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Submitting Appeal...' : 'Submit Appeal to Central Operations'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Appeal History & Progression Tracking (5 cols) */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Appeals History & Status</h2>
              </div>
              <div className="flex space-x-1">
                {['ALL', 'PENDING', 'RESOLVED'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterStatus(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      filterStatus === tab 
                        ? 'bg-[#F97316] text-white' 
                        : 'bg-[#1E293B] text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Appeal Cards List */}
            <div className="mt-4 space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {appealsHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#1E293B]/30 rounded-xl border border-dashed border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No disputes filed under this filter.</p>
                  <p className="text-[10px] text-slate-500 mt-1">All AI slots are currently accepted without objection.</p>
                </div>
              ) : (
                appealsHistory.map(req => {
                  const isPending = req.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || req.status === REQUEST_STAGES.ADMIN_REVIEW;
                  const isApproved = req.status === REQUEST_STAGES.APPROVED_OVERRIDDEN;

                  return (
                    <div 
                      key={req.id} 
                      className="p-4 bg-[#1E293B]/60 rounded-xl border border-slate-800 space-y-2.5 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-white text-xs">{req.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          isPending 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse'
                            : isApproved 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Ground: </strong>
                        {req.appealDetails?.reasonCategory || 'Daylight Emergency Request'}
                      </div>

                      {req.appealDetails?.appealText && (
                        <div className="bg-[#0F172A] p-2.5 rounded-lg text-[11px] text-slate-300 italic border border-slate-800/80">
                          "{req.appealDetails.appealText}"
                        </div>
                      )}

                      {/* Status Progression Timeline Mini-Pills */}
                      <div className="pt-2 border-t border-slate-800/60">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                          Resolution Progression
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">AI Slot</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className={`px-1.5 py-0.5 rounded font-medium ${
                            isPending ? 'bg-orange-500/20 text-orange-400 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}>
                            Human Review
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className={`px-1.5 py-0.5 rounded font-medium ${
                            isApproved 
                              ? 'bg-emerald-500/20 text-emerald-400 font-bold' 
                              : req.status === REQUEST_STAGES.REJECTED 
                              ? 'bg-red-500/20 text-red-400 font-bold'
                              : 'bg-slate-800/50 text-slate-600'
                          }`}>
                            {isApproved ? 'Approved Override' : req.status === REQUEST_STAGES.REJECTED ? 'Rejected' : 'Admin Decision'}
                          </span>
                        </div>
                      </div>

                      {req.adminOverrideRemarks && (
                        <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                          <strong>Admin Directive: </strong>{req.adminOverrideRemarks}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Escalations routed to: Central Operations Control (Admin)</span>
            <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};
