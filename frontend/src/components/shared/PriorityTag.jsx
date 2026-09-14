import React from 'react';
import { Tag } from '../ui/Tag';
import { AlertCircle, ArrowUpCircle, MinusCircle, ArrowDownCircle } from 'lucide-react';

export const PriorityTag = ({ priority, showSignalNote = true, className }) => {
  const priorityConfig = {
    Critical: {
      color: 'bg-rose-950/70 text-rose-400 border-rose-500/40',
      icon: AlertCircle,
      label: 'Critical'
    },
    High: {
      color: 'bg-amber-950/70 text-amber-400 border-amber-500/40',
      icon: ArrowUpCircle,
      label: 'High'
    },
    Normal: {
      color: 'bg-sky-950/70 text-sky-400 border-sky-500/40',
      icon: MinusCircle,
      label: 'Normal'
    },
    Low: {
      color: 'bg-slate-800 text-slate-300 border-slate-700',
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
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border select-none ${config.color} ${className || ''}`}
      >
        <Icon className="w-3 h-3 shrink-0" />
        <span>{config.label}</span>
        {showSignalNote && (
          <span className="text-[9px] uppercase tracking-wider opacity-75 font-mono ml-0.5">
            [Signal]
          </span>
        )}
      </span>
    </div>
  );
};
