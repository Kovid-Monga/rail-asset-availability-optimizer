import React from 'react';
import { REQUEST_STAGES } from '../../constants/departments';

export const RequestStatusBadge = ({ status, className }) => {
  const getBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case REQUEST_STAGES.SUBMITTED:
        return 'bg-[#EAE4D8] text-rail-text border-rail-border';
      case REQUEST_STAGES.ML_PRIORITIZATION:
        return 'bg-rail-primaryLight text-rail-primary border-rail-primary/30 animate-pulse';
      case REQUEST_STAGES.OPTIMIZATION:
        return 'bg-[#E6EFF0] text-[#2E6B65] border-[#2E6B65]/30 animate-pulse';
      case REQUEST_STAGES.SCHEDULED:
        return 'bg-rail-successLight text-rail-success border-rail-success/40 font-semibold';
      case REQUEST_STAGES.IN_PROGRESS:
        return 'bg-[#E3EFE4] text-[#366334] border-[#366334]/40 font-semibold';
      case REQUEST_STAGES.COMPLETED:
        return 'bg-[#E7ECE7] text-[#486347] border-[#486347]/30';
      
      // Alternate path
      case REQUEST_STAGES.CANNOT_BE_ACCOMMODATED:
        return 'bg-rail-criticalLight text-rail-critical border-rail-critical/40 font-semibold';
      case REQUEST_STAGES.ALTERNATIVE_SUGGESTED:
        return 'bg-rail-warningLight text-rail-warning border-rail-warning/40 font-semibold';
      case REQUEST_STAGES.ACCEPTED:
        return 'bg-rail-successLight text-rail-success border-rail-success/40 font-semibold';

      // Human review path
      case REQUEST_STAGES.AI_DECISION:
        return 'bg-[#EBF1F5] text-[#4A6B82] border-[#4A6B82]/30';
      case REQUEST_STAGES.HUMAN_REVIEW_REQUESTED:
        return 'bg-rail-secondaryLight text-rail-secondary border-rail-secondary/40 font-semibold';
      case REQUEST_STAGES.ADMIN_REVIEW:
        return 'bg-[#F2ECE1] text-[#915B1E] border-[#915B1E]/40 font-semibold';
      case REQUEST_STAGES.APPROVED_OVERRIDDEN:
        return 'bg-rail-successLight text-rail-success border-rail-success/40 font-semibold';
      case REQUEST_STAGES.REJECTED:
        return 'bg-rail-criticalLight text-rail-critical border-rail-critical/40';

      default:
        return 'bg-[#EAE4D8] text-rail-text border-rail-border';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-xs font-medium tracking-tight whitespace-nowrap select-none ${getBadgeStyle(status)} ${className || ''}`}
    >
      {status || 'Unknown'}
    </span>
  );
};
