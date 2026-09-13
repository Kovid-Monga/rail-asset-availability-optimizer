import React from 'react';
import { cn } from '../../utils/cn';

export const Table = ({ children, className, ...props }) => (
  <div className="w-full overflow-x-auto border border-rail-border rounded-md bg-rail-surface">
    <table className={cn("w-full text-left border-collapse text-xs", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className, ...props }) => (
  <thead className={cn("bg-[#ECE6DA] border-b border-rail-border text-rail-muted font-semibold", className)} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className, ...props }) => (
  <tbody className={cn("divide-y divide-rail-border/60", className)} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className, isClickable = false, ...props }) => (
  <tr
    className={cn(
      "transition-colors",
      isClickable && "cursor-pointer hover:bg-[#EFEBE1] active:bg-[#EAE4D8]",
      !isClickable && "hover:bg-[#F9F7F1]",
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
      "py-2.5 px-3 font-semibold text-rail-text tracking-tight uppercase text-[10px] text-rail-muted border-r border-rail-border/40 last:border-r-0",
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
      "py-2.5 px-3 text-rail-text border-r border-rail-border/30 last:border-r-0 align-middle",
      className
    )}
    {...props}
  >
    {children}
  </td>
);
