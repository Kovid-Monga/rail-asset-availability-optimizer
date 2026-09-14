import React, { useState, useEffect } from 'react';
import { getAllRequests } from '../../services/requests';
import { CorridorVisualization } from '../timetable/CorridorVisualization';
import { AdminConflictsAlerts } from '../admin/AdminConflictsAlerts';
import { AdminManualOverride } from '../admin/AdminManualOverride';
import { Activity, AlertTriangle, SlidersHorizontal, Layers, CheckCircle2 } from 'lucide-react';

export const OperationsView = () => {
  const [activeTab, setActiveTab] = useState('MONITOR'); // 'MONITOR' | 'CONFLICTS' | 'OVERRIDE'
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getAllRequests();
      setRequests(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2633]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#F97316]" />
            <span>Corridor Operations & Dispatch Control</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Monitor real-time train movements, capacity conflicts, and execute emergency administrative schedule adjustments.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#111827] border border-[#1E2633] rounded-lg">
          <button
            onClick={() => setActiveTab('MONITOR')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'MONITOR'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-rail-muted hover:text-white'
            }`}
          >
            Live Corridor Monitor
          </button>
          <button
            onClick={() => setActiveTab('CONFLICTS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'CONFLICTS'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-rail-muted hover:text-white'
            }`}
          >
            Conflicts & Alerts
          </button>
          <button
            onClick={() => setActiveTab('OVERRIDE')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'OVERRIDE'
                ? 'bg-[#EF4444] text-white font-semibold'
                : 'text-[#EF4444] hover:bg-[#450A0A]/40'
            }`}
          >
            Manual Override
          </button>
        </div>
      </div>

      {activeTab === 'MONITOR' && (
        <div className="space-y-6">
          <CorridorVisualization activeBlocks={requests} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2633]">
              <span className="text-[10px] uppercase font-mono text-rail-muted block">Corridor Throughput</span>
              <span className="text-xl font-bold text-white mt-1 block">84.2 GMT / Year</span>
              <span className="text-[10px] text-[#10B981] font-mono">High-Density Trunk</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2633]">
              <span className="text-[10px] uppercase font-mono text-rail-muted block">Active Possession Windows</span>
              <span className="text-xl font-bold text-white mt-1 block">3 Blocks Confirmed</span>
              <span className="text-[10px] text-[#38BDF8] font-mono">01:30 - 04:15 Night Window</span>
            </div>
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1E2633]">
              <span className="text-[10px] uppercase font-mono text-rail-muted block">Line Capacity Margin</span>
              <span className="text-xl font-bold text-white mt-1 block">94.8% Available</span>
              <span className="text-[10px] text-[#10B981] font-mono">+19.2% Uptime Gain</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CONFLICTS' && (
        <AdminConflictsAlerts />
      )}

      {activeTab === 'OVERRIDE' && (
        <AdminManualOverride />
      )}
    </div>
  );
};
