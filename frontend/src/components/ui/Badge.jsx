import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  className,
  variant = 'default', // 'default' | 'critical' | 'warning' | 'success' | 'secondary' | 'outline' | 'info'
  size = 'md',
  ...props
}) => {
  const base = "inline-flex items-center font-medium rounded-sm border px-2 py-0.5 tracking-tight select-none";
  
  const variants = {
    default: "bg-[#EAE4D8] text-rail-text border-rail-border",
    critical: "bg-rail-criticalLight text-rail-critical border-rail-critical/30",
    warning: "bg-rail-warningLight text-rail-warning border-rail-warning/30",
    success: "bg-rail-successLight text-rail-success border-rail-success/30",
    secondary: "bg-rail-secondaryLight text-rail-secondary border-rail-secondary/30",
    primary: "bg-rail-primaryLight text-rail-primary border-rail-primary/30",
    outline: "bg-transparent text-rail-text border-rail-border",
    info: "bg-[#EBF1F5] text-[#4A6B82] border-[#4A6B82]/30",
  };

  const sizes = {
    sm: "text-[11px] py-0 px-1.5 leading-4",
    md: "text-xs py-0.5 px-2 leading-4",
    lg: "text-xs py-1 px-2.5 font-semibold",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
