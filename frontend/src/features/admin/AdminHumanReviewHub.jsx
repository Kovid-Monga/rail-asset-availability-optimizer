import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight, 
  RotateCcw, 
  Send, 
  ShieldCheck, 
  Sliders,
  TrendingDown,
  Navigation
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getAllRequests, adminReviewAppeal } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';

export const AdminHumanReviewHub = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [activeDisputeId, setActiveDisputeId] = useState(null);

  // Form adjustments state for active dispute
  const [slotDate, setSlotDate] = useState('2026-09-08');
  const [startTime, setStartTime] = useState('01:30');
  const [endTime, setEndTime] = useState('04:00');
  const [trackLine, setTrackLine] = useState('UP Line');
  const [controllerRemarks, setControllerRemarks] = useState('');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllRequests();
      setRequests(data);

      // Find disputes or requests flagged for review
      const disputes = data.filter(r => 
        r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || 
        r.status === REQUEST_STAGES.ADMIN_REVIEW ||
        r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED ||
        r.appealDetails
      );

      if (disputes.length > 0 && !activeDisputeId) {
        setActiveDisputeId(disputes[0].id);
      }
    } catch (err) {
      console.error('Failed to load dispute requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDispute = requests.find(r => r.id === activeDisputeId) || requests[0];

  // Dynamic live delay calculation based on start time
  const calculateDelayImpact = () => {
    const hour = parseInt(startTime.split(':')[0], 10) || 1;
    if (hour >= 6 && hour <= 10) {
      return { passengerDelay: '+18 mins', freightDelay: '+45 mins', risk: 'High Congestion', score: '78.2%' };
    }
    if (hour >= 11 && hour <= 16) {
      return { passengerDelay: '+4 mins', freightDelay: '+25 mins', risk: 'Moderate', score: '88.4%' };
    }
    return { passengerDelay: '0 mins', freightDelay: '35m TKD Yard Loop', risk: 'Negligible (Night Window)', score: '97.6%' };
  };

  const delayImpact = calculateDelayImpact();

  const handleDecision = async (decisionType) => {
    if (!activeDispute) return;
    setIsProcessing(true);

    try {
      const timeWindow = `${startTime} - ${endTime} (Admin Adjudicated Window)`;
      const remarks = controllerRemarks.trim() || 
        (decisionType === 'APPROVE_OVERRIDE' 
          ? `Chief Controller override granted for ${activeDispute.department}. Priority work accommodated with freight regulation.`
          : decisionType === 'REJECT'
          ? 'Appeal rejected: Passenger commercial timetable non-negotiable during peak morning hours.'
          : 'AI slot enforced with alternative loop siding for goods train.');

      await adminReviewAppeal(activeDispute.id, decisionType, remarks, {
        date: slotDate,
        timeWindow,
        section: activeDispute.corridor,
        trackLine,
        durationMinutes: activeDispute.estimatedDurationMinutes || 150
      });

      addNotification({
        title: `Admin Adjudication: ${decisionType === 'APPROVE_OVERRIDE' ? 'Override Granted' : 'Decision Rendered'}`,
        message: `${activeDispute.id} (${activeDispute.department}) reviewed by Chief Operations Controller. Result: ${decisionType}`,
        type: 'ADMIN_DIRECTIVE',
        source: 'ADMIN',
        department: activeDispute.department,
        requestId: activeDispute.id
      });

      setActionSuccess(`Decision [${decisionType}] recorded successfully for ${activeDispute.id}.`);
      setControllerRemarks('');
      await loadData();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to adjudicate appeal', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter dispute items
  const disputeItems = requests.filter(r => {
    const isDispute = r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || 
                      r.status === REQUEST_STAGES.ADMIN_REVIEW ||
                      r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED ||
                      r.appealDetails ||
                      r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN;
    if (!isDispute) return false;

    if (selectedDeptFilter === 'ALL') return true;
    return r.department === selectedDeptFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center tracking-wide">
            <UserCheck className="w-6 h-6 text-orange-400 mr-2.5" /> Conflict Resolution Control Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Admin escalation queue for resolving department engineers' dispute objections to AI maintenance slotting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Filter Disputes:</span>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="bg-[#1E293B] text-xs text-white border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-[#F97316]"
          >
            <option value="ALL">All Departments ({disputeItems.length})</option>
            <option value="ENG">Engineering (TMS)</option>
            <option value="TRD">Traction Distribution (TDMS)</option>
            <option value="SNT">Signal & Telecom (S&MS)</option>
          </select>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <span className="font-mono text-[10px]">Audit Log Updated</span>
        </div>
      )}

      {/* 2-Column Dispute Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Dispute Queue Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Escalations ({disputeItems.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Select to resolve</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {disputeItems.map(req => {
              const isSelected = activeDispute?.id === req.id;
              const isPending = req.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || req.status === REQUEST_STAGES.ADMIN_REVIEW;

              return (
                <div
                  key={req.id}
                  onClick={() => setActiveDisputeId(req.id)}
                  className={`p-4 rounded-2xl border transition duration-200 cursor-pointer space-y-2.5 relative ${
                    isSelected 
                      ? 'bg-[#1E293B] border-orange-500/60 shadow-lg shadow-orange-500/10' 
                      : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white text-xs">{req.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        req.department === 'ENG' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : req.department === 'TRD' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {req.department}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isPending 
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse'
                        : req.status === REQUEST_STAGES.APPROVED_OVERRIDDEN
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {req.maintenanceType}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2">
                    {req.appealDetails?.reasonCategory || req.conflictReason || 'Objection to AI assigned night possession.'}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Priority: {req.declaredPriority || 'High'}</span>
                    <span className="text-orange-400 flex items-center">
                      Review <ArrowRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT MAIN PANEL: Interactive Conflict Resolution Cockpit (8 cols) */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {activeDispute ? (
            <>
              {/* Active Dispute Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg font-bold text-white font-mono">{activeDispute.id}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                      {activeDispute.department} Dispute
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{activeDispute.maintenanceType}</p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-500">Asset & Track:</span>
                  <div className="font-mono text-white text-xs">{activeDispute.location || activeDispute.corridor}</div>
                </div>
              </div>

              {/* Department Objection Context Card */}
              <div className="bg-[#1E293B]/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-400 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5" /> Department Appeal Ground
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    By: {activeDispute.appealDetails?.submittedBy || 'Senior Section Engineer'}
                  </span>
                </div>

                <div className="text-white font-medium">
                  {activeDispute.appealDetails?.reasonCategory || 'Daylight Emergency Request (Defect worse than source data)'}
                </div>

                {activeDispute.appealDetails?.appealText && (
                  <p className="text-slate-300 text-[11px] italic bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                    "{activeDispute.appealDetails.appealText}"
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-slate-400">
                  <div>
                    <span>AI Scheduled Slot: </span>
                    <strong className="text-emerald-400 font-mono">
                      {activeDispute.scheduledSlot?.timeWindow || activeDispute.preferredWindow}
                    </strong>
                  </div>
                  <div>
                    <span>Requested Override Window: </span>
                    <strong className="text-amber-400 font-mono">
                      {activeDispute.preferredWindow || 'Emergency Daytime Window'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Interactive Controller Adjustment Controls */}
              <div className="space-y-4 pt-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                  <Sliders className="w-4 h-4 text-[#F97316] mr-2" />
                  Interactive Slot Adjustment & Simulation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Target Date</label>
                    <input
                      type="date"
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Start Time (24h)</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">End Time (24h)</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">Track Line Possession</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {['UP Line', 'DN Line', 'Both Main Lines', 'Barog Yard Siding'].map(line => (
                      <button
                        key={line}
                        type="button"
                        onClick={() => setTrackLine(line)}
                        className={`p-2 rounded-xl text-center font-medium border transition cursor-pointer ${
                          trackLine === line 
                            ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm' 
                            : 'bg-[#1E293B] text-slate-300 border-slate-800 hover:text-white'
                        }`}
                      >
                        {line}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Delay & Traffic Impact Calculation Gauge */}
                <div className="bg-gradient-to-r from-slate-900 to-[#1E293B] p-4 rounded-xl border border-orange-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center">
                      <TrendingDown className="w-4 h-4 text-emerald-400 mr-1.5" />
                      Live AI Delay Recalculation Telemetry
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">
                      Slot Efficiency: {delayImpact.score}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Passenger Delay</div>
                      <div className={`font-mono font-bold text-sm mt-0.5 ${
                        delayImpact.passengerDelay === '0 mins' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {delayImpact.passengerDelay}
                      </div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Freight Regulation</div>
                      <div className="font-mono font-bold text-sm text-white mt-0.5">
                        {delayImpact.freightDelay}
                      </div>
                    </div>

                    <div className="bg-[#0F172A] p-2.5 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">Congestion Severity</div>
                      <div className="font-mono font-bold text-sm text-slate-300 mt-0.5">
                        {delayImpact.risk}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controller Directive Remarks */}
                <div>
                  <label className="block text-slate-300 text-xs font-medium mb-1">
                    Chief Operations Controller Directive & Audit Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={controllerRemarks}
                    onChange={(e) => setControllerRemarks(e.target.value)}
                    placeholder="Enter formal justification for override or reasoning for enforcing AI slot..."
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl p-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                {/* Action Directives Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecision('APPROVE_OVERRIDE')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grant Override Slot</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecision('ENFORCE_AI')}
                    className="py-2.5 px-3 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-orange-500/20 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Enforce AI Slot</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecision('REJECT')}
                    className="py-2.5 px-3 bg-[#1E293B] hover:bg-red-900/60 text-slate-300 hover:text-red-300 disabled:opacity-50 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Appeal</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select an active dispute from the left queue to begin adjudication.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
