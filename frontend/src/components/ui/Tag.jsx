import React from 'react';
import { cn } from '../../utils/cn';

export const Tag = ({
  children,
  className,
  variant = 'default',
  icon: Icon,
  ...props
}) => {
  const base = "inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded-sm border select-none";
  
  const variants = {
    default: "bg-[#ECE6DA] text-rail-muted border-rail-border",
    code: "bg-[#E6E0D3] text-rail-text border-rail-border font-semibold",
    accent: "bg-rail-primaryLight text-rail-primary border-rail-primary/20",
    alert: "bg-rail-criticalLight text-rail-critical border-rail-critical/20",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};
