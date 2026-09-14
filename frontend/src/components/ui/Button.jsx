import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'default', // 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning' | 'emerald' | 'subtle'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'icon'
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F17] focus:ring-rail-primary disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-lg active:scale-[0.98]";
  
  const variants = {
    default: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-orange border border-orange-400/30 font-semibold",
    secondary: "bg-sky-600 hover:bg-sky-500 text-white shadow-glow-cyan border border-sky-400/30",
    outline: "bg-slate-900/80 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 hover:text-white",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent",
    danger: "bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30",
    warning: "bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400/40 font-semibold",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald border border-emerald-400/30 font-semibold",
    subtle: "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1.5 h-7",
    md: "text-xs sm:text-sm px-3.5 py-2 gap-2 h-9",
    lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5 h-11",
    icon: "p-2 h-9 w-9",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

