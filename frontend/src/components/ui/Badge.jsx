import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  className,
  variant = 'default', // 'default' | 'critical' | 'warning' | 'success' | 'secondary' | 'primary' | 'outline' | 'info'
  size = 'md',
  ...props
}) => {
  const base = "inline-flex items-center font-medium rounded-full border px-2.5 py-0.5 tracking-tight select-none";
  
  const variants = {
    default: "bg-slate-800 text-slate-200 border-slate-700",
    critical: "bg-rose-950/70 text-rose-400 border-rose-500/40",
    warning: "bg-amber-950/70 text-amber-400 border-amber-500/40",
    success: "bg-emerald-950/70 text-emerald-400 border-emerald-500/40",
    secondary: "bg-sky-950/70 text-sky-400 border-sky-500/40",
    primary: "bg-orange-950/70 text-orange-400 border-orange-500/40",
    outline: "bg-transparent text-slate-300 border-slate-700",
    info: "bg-purple-950/70 text-purple-400 border-purple-500/40",
  };

  const sizes = {
    sm: "text-[10px] py-0 px-2 leading-4",
    md: "text-[11px] py-0.5 px-2.5 leading-4",
    lg: "text-xs py-1 px-3 font-semibold",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
