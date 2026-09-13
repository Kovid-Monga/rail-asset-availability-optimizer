import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-rail-surface border border-rail-border rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("px-4 py-3 border-b border-rail-border flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn("text-sm font-semibold text-rail-text tracking-tight flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-xs text-rail-muted mt-0.5", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("px-4 py-3 bg-[#F2EFE7] border-t border-rail-border flex items-center rounded-b-md", className)}
      {...props}
    >
      {children}
    </div>
  );
};
