import React from 'react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(({
  className,
  label,
  options = [],
  children,
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
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full bg-slate-900/90 text-white text-sm px-3.5 py-2 rounded-lg border border-slate-700/80 transition-all appearance-none",
          "focus:outline-none focus:border-rail-primary focus:ring-2 focus:ring-rail-primary/20",
          "disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed",
          "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_12px_center] bg-no-repeat pr-9",
          error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
          className
        )}
        {...props}
      >
        {children ? children : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-slate-900 text-white">
              {opt.label}
            </option>
          ))
        )}
      </select>
      {helperText && !error && (
        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{helperText}</p>
      )}
      {error && (
        <p className="text-[11px] text-rose-400 mt-1 font-medium leading-snug">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
