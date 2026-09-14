import React from 'react';
import { REQUEST_STAGES } from '../../constants/departments';
import { CheckCircle2, Circle, Clock, AlertTriangle, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StatusTimeline = ({ request }) => {
  if (!request) return null;

  // Determine which path this request follows strictly matching the PRD specification
  const isAlternatePath = request.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED ||
    request.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED ||
    request.status === REQUEST_STAGES.ACCEPTED;

  const isHumanReviewPath = request.status === REQUEST_STAGES.AI_DECISION ||
    request.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED ||
    request.status === REQUEST_STAGES.ADMIN_REVIEW ||
    request.status === REQUEST_STAGES.APPROVED_OVERRIDDEN ||
    request.status === REQUEST_STAGES.REJECTED;

  // Exact PRD primary sequence
  const primarySequence = [
    REQUEST_STAGES.SUBMITTED,
    REQUEST_STAGES.ML_PRIORITIZATION,
    REQUEST_STAGES.OPTIMIZATION,
    REQUEST_STAGES.SCHEDULED,
    REQUEST_STAGES.IN_PROGRESS,
    REQUEST_STAGES.COMPLETED
  ];

  // Exact PRD alternate slot sequence
  const alternateSequence = [
    REQUEST_STAGES.SUBMITTED,
    REQUEST_STAGES.CANNOT_BE_ACCOMMODATED,
    REQUEST_STAGES.ALTERNATIVE_SUGGESTED,
    REQUEST_STAGES.ACCEPTED
  ];

  // Exact PRD appeal sequence
  const appealSequence = [
    REQUEST_STAGES.SUBMITTED,
    REQUEST_STAGES.AI_DECISION,
    REQUEST_STAGES.HUMAN_REVIEW_REQUESTED,
    REQUEST_STAGES.ADMIN_REVIEW,
    REQUEST_STAGES.APPROVED_OVERRIDDEN
  ];

  const activeSequence = isAlternatePath
    ? alternateSequence
    : isHumanReviewPath
      ? appealSequence
      : primarySequence;

  // Map history records by stage
  const historyMap = {};
  (request.statusHistory || []).forEach(h => {
    historyMap[h.stage] = h;
  });

  const getStageStatus = (stage) => {
    const stageIndex = activeSequence.indexOf(stage);
    const currentIndex = activeSequence.indexOf(request.status);

    if (stage === request.status) return 'CURRENT';
    if (stageIndex !== -1 && currentIndex !== -1 && stageIndex < currentIndex) return 'COMPLETED';
    if (historyMap[stage]) return 'COMPLETED';
    return 'PENDING';
  };

  return (
    <div className="space-y-4">
      {/* Path Header Indicator */}
      <div className="text-xs font-mono text-slate-400 flex items-center justify-between pb-2 border-b border-[#1F2937]">
        <span className="text-orange-400 font-semibold">
          TRACK: {isAlternatePath ? 'SLOT CONFLICT (ALTERNATIVES)' : isHumanReviewPath ? 'HUMAN REVIEW APPEAL' : 'PRIMARY OPTIMIZATION'}
        </span>
        <span className="text-slate-300">ID: {request.id}</span>
      </div>

      {/* Sequential Timeline Nodes */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1F2937]">
        {activeSequence.map((stage) => {
          const statusState = getStageStatus(stage);
          const historyEntry = historyMap[stage];

          let nodeColor = 'bg-[#111827] border-[#1F2937] text-slate-500';
          let textColor = 'text-slate-500';

          if (statusState === 'COMPLETED') {
            nodeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
            textColor = 'text-slate-200';
          } else if (statusState === 'CURRENT') {
            nodeColor = stage === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED
              ? 'bg-red-500 text-white border-red-400 ring-2 ring-red-500/30'
              : stage === REQUEST_STAGES.ALTERNATIVE_SUGGESTED
                ? 'bg-amber-500 text-slate-900 border-amber-400 ring-2 ring-amber-500/30 font-bold'
                : 'bg-orange-500 text-slate-900 border-orange-400 ring-2 ring-orange-500/30 animate-pulse font-bold';
            textColor = 'text-orange-400 font-bold';
          }

          return (
            <div key={stage} className="relative group">
              {/* Icon marker */}
              <div
                className={cn(
                  "absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] z-10 transition-transform",
                  nodeColor
                )}
              >
                {statusState === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : statusState === 'CURRENT' ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <Circle className="w-2.5 h-2.5 opacity-40" />
                )}
              </div>

              {/* Node Content */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className={cn("text-xs font-semibold tracking-tight", textColor)}>
                    {stage}
                  </h4>
                  {historyEntry && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {historyEntry.timestamp}
                    </span>
                  )}
                </div>

                {/* Subtext and metadata (per PRD instruction: source validations, ML notes strictly as subtext) */}
                {historyEntry && (
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed bg-[#0B0F17] p-2.5 rounded border border-[#1F2937]">
                    {historyEntry.note}
                  </p>
                )}

                {/* Specific stage extensions */}
                {stage === REQUEST_STAGES.ML_PRIORITIZATION && request.score && (
                  <div className="mt-1.5 text-[10px] font-mono text-orange-400 flex items-center gap-1.5 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>ML Priority Score: <strong className="text-white">{request.score}/100</strong> (Computed via defect severity, line GMT, and urgency)</span>
                  </div>
                )}

                {stage === REQUEST_STAGES.SCHEDULED && request.scheduledSlot && (
                  <div className="mt-1.5 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[11px] text-slate-200 space-y-1">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Scheduled Block Slot Confirmed:</span>
                    </div>
                    <div className="text-slate-300">Window: {request.scheduledSlot.timeWindow} on {request.scheduledSlot.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Section: {request.scheduledSlot.section} • {request.scheduledSlot.trackLine}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
