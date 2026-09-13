import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'default', // 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning'
  size = 'md',        // 'sm' | 'md' | 'lg'
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-rail-primary disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-sm";
  
  const variants = {
    default: "bg-rail-primary text-[#F7F4EC] hover:bg-rail-primaryHover active:bg-[#2A3F3A] border border-transparent",
    secondary: "bg-rail-secondary text-[#F7F4EC] hover:bg-rail-secondaryHover border border-transparent",
    outline: "bg-rail-surface text-rail-text border border-rail-border hover:bg-rail-surfaceHover hover:border-rail-borderDark",
    ghost: "bg-transparent text-rail-text hover:bg-rail-surfaceHover border border-transparent",
    danger: "bg-rail-critical text-[#F7F4EC] hover:bg-[#833D2F] border border-transparent",
    warning: "bg-rail-warning text-[#2B2621] hover:bg-[#A87724] border border-transparent font-semibold",
    subtle: "bg-rail-primaryLight text-rail-primary border border-rail-primary/20 hover:bg-rail-primaryLight/80",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1.5 h-7",
    md: "text-sm px-3.5 py-1.5 gap-2 h-9",
    lg: "text-base px-5 py-2.5 gap-2.5 h-11",
    icon: "p-1.5 h-8 w-8",
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
