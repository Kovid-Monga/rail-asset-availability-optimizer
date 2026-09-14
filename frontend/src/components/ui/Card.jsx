import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-[#111827]/80 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-card-dark transition-all",
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
      className={cn("px-5 py-4 border-b border-slate-800/80 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn("text-sm font-bold text-white tracking-tight flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn("text-xs text-slate-400 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div
      className={cn("px-5 py-3.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center rounded-b-xl", className)}
      {...props}
    >
      {children}
    </div>
  );
};
