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
        <label className="block text-xs font-semibold text-rail-text mb-1 tracking-tight">
          {label}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full bg-[#FCFAF5] text-rail-text placeholder:text-rail-muted/60 text-sm px-3 py-1.5 rounded-sm border border-rail-border transition-colors",
          "focus:outline-none focus:border-rail-primary focus:ring-1 focus:ring-rail-primary",
          "disabled:bg-[#EBE5DA] disabled:text-rail-muted disabled:cursor-not-allowed",
          error && "border-rail-critical focus:border-rail-critical focus:ring-rail-critical",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-rail-muted mt-1 leading-snug">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-rail-critical mt-1 font-medium leading-snug">{error}</p>
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
        <label className="block text-xs font-semibold text-rail-text mb-1 tracking-tight">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        disabled={disabled}
        className={cn(
          "w-full bg-[#FCFAF5] text-rail-text placeholder:text-rail-muted/60 text-sm px-3 py-2 rounded-sm border border-rail-border transition-colors resize-y",
          "focus:outline-none focus:border-rail-primary focus:ring-1 focus:ring-rail-primary",
          "disabled:bg-[#EBE5DA] disabled:text-rail-muted disabled:cursor-not-allowed",
          error && "border-rail-critical focus:border-rail-critical focus:ring-rail-critical",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="text-[11px] text-rail-muted mt-1 leading-snug">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-rail-critical mt-1 font-medium leading-snug">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
