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
      <div className="text-xs font-mono text-rail-muted flex items-center justify-between pb-2 border-b border-rail-border">
        <span>LIFECYCLE TRACK: {isAlternatePath ? 'SLOT CONFLICT (ALTERNATIVES)' : isHumanReviewPath ? 'HUMAN REVIEW APPEAL' : 'PRIMARY OPTIMIZATION'}</span>
        <span className="font-semibold text-rail-text">ID: {request.id}</span>
      </div>

      {/* Sequential Timeline Nodes */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-rail-border">
        {activeSequence.map((stage) => {
          const statusState = getStageStatus(stage);
          const historyEntry = historyMap[stage];

          let nodeColor = 'bg-[#ECE5D8] border-rail-border text-rail-muted';
          let textColor = 'text-rail-muted';

          if (statusState === 'COMPLETED') {
            nodeColor = 'bg-rail-primary text-white border-rail-primary';
            textColor = 'text-rail-text';
          } else if (statusState === 'CURRENT') {
            nodeColor = stage === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED
              ? 'bg-rail-critical text-white border-rail-critical ring-2 ring-rail-critical/20'
              : stage === REQUEST_STAGES.ALTERNATIVE_SUGGESTED
                ? 'bg-rail-warning text-rail-text border-rail-warning ring-2 ring-rail-warning/20'
                : 'bg-rail-primary text-white border-rail-primary ring-2 ring-rail-primary/20 animate-pulse';
            textColor = 'text-rail-text font-bold';
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
                    <span className="text-[10px] font-mono text-rail-muted">
                      {historyEntry.timestamp}
                    </span>
                  )}
                </div>

                {/* Subtext and metadata (per PRD instruction: source validations, ML notes strictly as subtext) */}
                {historyEntry && (
                  <p className="text-[11px] text-rail-muted mt-0.5 leading-relaxed bg-[#FAF7F0] p-2 rounded-sm border border-rail-border/60">
                    {historyEntry.note}
                  </p>
                )}

                {/* Specific stage extensions */}
                {stage === REQUEST_STAGES.ML_PRIORITIZATION && request.score && (
                  <div className="mt-1 text-[10px] font-mono text-rail-primary flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>ML Priority Score: <strong>{request.score}/100</strong> (Computed via defect severity, line GMT, and urgency)</span>
                  </div>
                )}

                {stage === REQUEST_STAGES.SCHEDULED && request.scheduledSlot && (
                  <div className="mt-1.5 p-2 bg-[#EEF5F1] border border-[#5C7A5A]/30 rounded-sm text-[11px] text-rail-text space-y-0.5">
                    <div className="font-semibold text-rail-success">Scheduled Block Slot:</div>
                    <div>Window: {request.scheduledSlot.timeWindow} on {request.scheduledSlot.date}</div>
                    <div className="text-[10px] text-rail-muted">Section: {request.scheduledSlot.section} • {request.scheduledSlot.trackLine}</div>
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
