import React, { useState, useEffect } from 'react';
import { Download, CloudSun, CheckCircle, Train, Users, ShieldCheck } from 'lucide-react';

export const BottomBar = ({ onGenerateReport }) => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-16 bg-[#0E131A] border-t border-[#1E2633] px-4 sm:px-6 flex items-center justify-between sticky bottom-0 z-30 text-xs">
      {/* Left: Clock, Date & Weather */}
      <div className="flex items-center gap-4 sm:gap-6 text-rail-muted">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-white text-sm font-mono tracking-tight">{time || '15:24'}</span>
          <span className="text-[11px] text-rail-muted hidden sm:inline">{date || 'May 17, 2026'}</span>
        </div>

        <div className="flex items-center gap-1.5 text-rail-muted border-l border-[#1E2633] pl-4 sm:pl-6">
          <CloudSun className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-white font-medium text-xs">18°C</span>
          <span className="text-[11px] text-rail-muted hidden md:inline">Partly Cloudy</span>
        </div>
      </div>

      {/* Center: Live System Status Telemetry */}
      <div className="hidden lg:flex items-center gap-8 text-xs">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-glow-emerald"></span>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] uppercase font-mono text-rail-muted">Network Status</span>
            <span className="text-white font-semibold text-xs mt-0.5">All Systems Operational</span>
          </div>
        </div>

        {/* Active Trains */}
        <div className="flex items-center gap-2 border-l border-[#1E2633] pl-6">
          <Train className="w-4 h-4 text-rail-muted" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] uppercase font-mono text-rail-muted">Active Trains</span>
            <span className="text-white font-semibold text-xs mt-0.5">
              124 <span className="text-rail-muted font-normal">/ 150</span>
            </span>
          </div>
        </div>

        {/* Daily Volume */}
        <div className="flex items-center gap-2 border-l border-[#1E2633] pl-6">
          <Users className="w-4 h-4 text-rail-muted" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] uppercase font-mono text-rail-muted">Passengers Today</span>
            <span className="text-white font-semibold text-xs mt-0.5 flex items-center gap-1">
              48,392 <span className="text-[10px] text-[#10B981] font-mono">↑ 6.8%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Generate Report Action Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGenerateReport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:bg-[#C2410C] text-white font-semibold text-xs shadow-glow-orange transition-all select-none"
        >
          <span>Generate Report</span>
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
