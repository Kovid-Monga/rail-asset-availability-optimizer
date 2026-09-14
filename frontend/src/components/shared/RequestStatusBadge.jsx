import React from 'react';
import { REQUEST_STAGES } from '../../constants/departments';

export const RequestStatusBadge = ({ status, className }) => {
  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case REQUEST_STAGES.SUBMITTED:
        return 'bg-slate-800/90 text-slate-300 border-slate-700';
      case REQUEST_STAGES.ML_PRIORITIZATION:
        return 'bg-sky-950/80 text-sky-400 border-sky-500/40 animate-pulse';
      case REQUEST_STAGES.OPTIMIZATION:
        return 'bg-purple-950/80 text-purple-400 border-purple-500/40 animate-pulse';
      case REQUEST_STAGES.SCHEDULED:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-semibold shadow-glow-emerald';
      case REQUEST_STAGES.IN_PROGRESS:
        return 'bg-emerald-900/50 text-emerald-300 border-emerald-400/50 font-semibold';
      case REQUEST_STAGES.COMPLETED:
        return 'bg-slate-800/80 text-slate-400 border-slate-700';
      
      // Alternate path
      case REQUEST_STAGES.CANNOT_BE_ACCOMMODATED:
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50 font-semibold';
      case REQUEST_STAGES.ALTERNATIVE_SUGGESTED:
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50 font-semibold';
      case REQUEST_STAGES.ACCEPTED:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-semibold';

      // Human review path
      case REQUEST_STAGES.AI_DECISION:
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case REQUEST_STAGES.HUMAN_REVIEW_REQUESTED:
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50 font-semibold';
      case REQUEST_STAGES.ADMIN_REVIEW:
        return 'bg-orange-900/60 text-orange-300 border-orange-400/50 font-semibold';
      case REQUEST_STAGES.APPROVED_OVERRIDDEN:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-semibold';
      case REQUEST_STAGES.REJECTED:
        return 'bg-rose-950/80 text-rose-400 border-rose-500/50';

      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium tracking-tight whitespace-nowrap select-none ${getBadgeStyle(status)} ${className || ''}`}
    >
      {status || 'Unknown'}
    </span>
  );
};
