import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { LineChart as ChartIcon, CheckCircle2, TrendingUp, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export const AdminAnalytics = () => {
  // Before vs After comparison data (simulated per spec)
  const comparisonData = [
    { metric: 'Blocks Required', manualBDMS: 42, aiOptimized: 26, unit: 'Blocks' },
    { metric: 'Track Hours (Total)', manualBDMS: 148, aiOptimized: 94, unit: 'Hours' },
    { metric: 'Detention Delay (m)', manualBDMS: 320, aiOptimized: 45, unit: 'Minutes' },
    { metric: 'Corridor Conflicts', manualBDMS: 18, aiOptimized: 2, unit: 'Incidents' },
    { metric: 'Overdue Backlog', manualBDMS: 12, aiOptimized: 3, unit: 'Tasks' }
  ];

  const weeklyTrendData = [
    { week: 'Week 1', manualHours: 38, optimizedHours: 24, multiDeptBundles: 3 },
    { week: 'Week 2', manualHours: 36, optimizedHours: 22, multiDeptBundles: 4 },
    { week: 'Week 3', manualHours: 42, optimizedHours: 26, multiDeptBundles: 5 },
    { week: 'Week 4', manualHours: 32, optimizedHours: 22, multiDeptBundles: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-orange-400" />
            <span>Optimization Impact Analytics & Efficiency Baseline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparative analysis of legacy manual BDMS process against autonomous multi-department AI scheduling.
          </p>
        </div>
        {/* Required Simulated Data Disclaimer Badge */}
        <div className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[11px] font-mono font-bold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>SIMULATED OPERATIONAL DATA</span>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3.5 bg-[#111827] border border-[#1F2937] rounded-lg text-xs text-slate-400 leading-relaxed">
        <strong className="text-slate-200 font-semibold">Operational Evaluation Notice: </strong>
        All metrics and efficiency gains presented on this dashboard represent <em>simulated comparative modeling</em> contrasting historical manual Block Demanding (BDMS) records with the AI combinatorial optimization model. Not official audited Indian Railways statistics.
      </div>

      {/* Primary KPI Comparative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Possessions Reduction
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">26</span>
            <span className="text-xs text-slate-500 line-through">42 Manual</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            -38.1% fewer track blocks needed
          </span>
        </Card>

        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Corridor Possession Hours
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">94 hrs</span>
            <span className="text-xs text-slate-500 line-through">148 hrs</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            54 possession hours saved
          </span>
        </Card>

        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Passenger Delay Minutes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">45 min</span>
            <span className="text-xs text-slate-500 line-through">320 min</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            -85.9% train delay reduction
          </span>
        </Card>

        <Card className="p-4 bg-[#111827] border-emerald-500/30">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Multi-Dept Unified Blocks
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">16 Bundled</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            +19.2% Net Track Availability Gain
          </span>
        </Card>
      </div>

      {/* Main Bar Chart: Manual BDMS vs AI Optimized */}
      <Card className="border-[#1F2937] bg-[#111827]">
        <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
          <CardTitle className="flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Comparative Analysis: Legacy Manual BDMS Baseline vs. AI Scheduled
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">
              Corridor Section: NDLS-MTJ & KLK-SML
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: '#1F2937',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="manualBDMS" name="Manual BDMS Process" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aiOptimized" name="AI-Driven Optimization (Current)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend Line Chart */}
      <Card className="border-[#1F2937] bg-[#111827]">
        <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Weekly Possession Hours Trajectory & Multi-Department Bundling
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderColor: '#1F2937',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="manualHours" name="Manual Track Hours (Hrs)" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="optimizedHours" name="AI Optimized Hours (Hrs)" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
                <Line type="monotone" dataKey="multiDeptBundles" name="Multi-Dept Bundles (#)" stroke="#F97316" strokeWidth={2} dot={{ r: 4, fill: '#F97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
