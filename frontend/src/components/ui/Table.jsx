import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className, ...props }) => (
  <div className="w-full overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-900/60 backdrop-blur-md shadow-card-dark">
    <table className={cn("w-full text-left border-collapse text-xs", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className, ...props }) => (
  <thead className={cn("bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold", className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }) => (
  <tbody className={cn("divide-y divide-slate-800/60 text-slate-200", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, isClickable = false, ...props }) => (
  <tr
    className={cn(
      "transition-colors",
      isClickable && "cursor-pointer hover:bg-slate-800/60 active:bg-slate-800/90",
      !isClickable && "hover:bg-slate-800/30",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className, ...props }) => (
  <th
    className={cn(
      "py-3 px-4 font-bold text-slate-400 tracking-wider uppercase text-[10px] sm:text-[11px]",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ children, className, ...props }) => (
  <td
    className={cn(
      "py-3.5 px-4 text-slate-200 align-middle",
      className
    )}
    {...props}
  >
    {children}
  </td>
);
