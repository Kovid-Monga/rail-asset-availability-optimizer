import React from 'react';
import { Tag } from '../ui/Tag';
import { AlertCircle, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';

export const PriorityTag = ({ priority, showSignalNote = true, className }) => {
  const priorityConfig = {
    Critical: {
      color: 'bg-rail-criticalLight text-rail-critical border-rail-critical/30',
      icon: AlertCircle,
      label: 'Critical'
    },
    High: {
      color: 'bg-rail-warningLight text-rail-warning border-rail-warning/30',
      icon: ArrowUpCircle,
      label: 'High'
    },
    Normal: {
      color: 'bg-[#EBF1F5] text-[#4A6B82] border-[#4A6B82]/30',
      icon: MinusCircle,
      label: 'Normal'
    },
    Low: {
      color: 'bg-[#EBE5DA] text-rail-muted border-rail-border',
      icon: ArrowDownCircle,
      label: 'Low'
    }
  };

  const config = priorityConfig[priority] || priorityConfig['Normal'];
  const Icon = config.icon;

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        title="Department-declared input signal; final scheduling order is decided by the AI/ML optimization engine."
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-sm border select-none ${config.color} ${className || ''}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{config.label}</span>
        {showSignalNote && (
          <span className="text-[9px] uppercase tracking-wider opacity-75 font-mono ml-0.5">
            [Input Signal]
          </span>
        )}
      </span>
    </div>
  );
};
