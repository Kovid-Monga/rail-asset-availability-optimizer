import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helperText,
  disabled,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-200 mb-1.5 tracking-tight">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm px-3.5 py-2 rounded-lg border border-slate-700/80 transition-all",
          "focus:outline-none focus:border-rail-primary focus:ring-2 focus:ring-rail-primary/20",
          "disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-rose-400 mt-1 font-medium leading-snug">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  className,
  label,
  error,
  helperText,
  disabled,
  rows = 3,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-200 mb-1.5 tracking-tight">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full bg-slate-900/90 text-white placeholder:text-slate-500 text-sm px-3.5 py-2.5 rounded-lg border border-slate-700/80 transition-all resize-y",
          "focus:outline-none focus:border-rail-primary focus:ring-2 focus:ring-rail-primary/20",
          "disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-rose-400 mt-1 font-medium leading-snug">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
