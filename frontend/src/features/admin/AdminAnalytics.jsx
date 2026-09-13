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
import { LineChart as ChartIcon, CheckCircle2, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

export const AdminAnalytics = () => {
  // Before vs After comparison data (simulated per spec)
  const comparisonData = [
    { metric: 'Total Possessions Required', manualBDMS: 42, aiOptimized: 26, unit: 'Blocks' },
    { metric: 'Total Track Possession', manualBDMS: 148, aiOptimized: 94, unit: 'Hours' },
    { metric: 'Train Detention / Delay', manualBDMS: 320, aiOptimized: 45, unit: 'Minutes' },
    { metric: 'Corridor Slot Conflicts', manualBDMS: 18, aiOptimized: 2, unit: 'Incidents' },
    { metric: 'Overdue Backlog Tasks', manualBDMS: 12, aiOptimized: 3, unit: 'Tasks' }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-rail-primary" />
            <span>Optimization Impact Analytics & Efficiency Baseline</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Comparative analysis of manual BDMS process against autonomous multi-department optimization.
          </p>
        </div>
        {/* Required Simulated Data Disclaimer Badge */}
        <div className="px-3 py-1 bg-[#FAF3E2] text-rail-secondary border border-rail-secondary/40 rounded-sm text-[11px] font-mono font-bold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>SIMULATED OPERATIONAL DATA</span>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-3 bg-[#FAF7ED] border border-rail-border rounded-sm text-[11px] text-rail-muted leading-relaxed">
        <strong className="text-rail-text font-semibold">Operational Evaluation Notice: </strong>
        All metrics and efficiency gains presented on this dashboard represent <em>simulated comparative modeling</em> contrasting historical manual Block Demanding (BDMS) data with the AI optimization model. Not official audited Indian Railways statistics.
      </div>

      {/* Primary KPI Comparative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Possessions Reduction
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rail-text">26</span>
            <span className="text-xs text-rail-muted line-through">42 Manual</span>
          </div>
          <span className="text-[10px] text-rail-success font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            -38.1% fewer track blocks needed
          </span>
        </Card>

        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Corridor Possession Hours
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rail-text">94 hrs</span>
            <span className="text-xs text-rail-muted line-through">148 hrs</span>
          </div>
          <span className="text-[10px] text-rail-success font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            54 possession hours saved
          </span>
        </Card>

        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Passenger Delay Minutes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rail-text">45 min</span>
            <span className="text-xs text-rail-muted line-through">320 min</span>
          </div>
          <span className="text-[10px] text-rail-success font-semibold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            -85.9% train delay reduction
          </span>
        </Card>

        <Card className="p-4 bg-rail-surface border-[#5C7A5A]/40 bg-[#FAFBF9]">
          <span className="text-[10px] font-bold text-rail-success uppercase tracking-tight block flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Multi-Dept Unified Blocks
          </span>
          <div className="text-2xl font-bold text-rail-success mt-1">16 Bundled</div>
          <span className="text-[10px] text-rail-success font-semibold mt-1 block">
            +19.2% Net Asset Availability Gain
          </span>
        </Card>
      </div>

      {/* Main Bar Chart: Manual BDMS vs AI Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full">
            <span>Optimization Comparison: Manual BDMS Baseline vs. AI Scheduled</span>
            <span className="text-[10px] font-mono text-rail-muted font-normal">
              Corridor Section: NDLS-MTJ
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D0C2" />
                <XAxis dataKey="metric" tick={{ fill: '#6B6258', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B6258', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#F7F4EC',
                    borderColor: '#D8D0C2',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="manualBDMS" name="Manual Process (BDMS Baseline)" fill="#9C4A3A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="aiOptimized" name="AI-Driven Optimization (Current)" fill="#3E5C55" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Chart: Weekly Trend of Possession Hours and Multi-Dept Bundles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Possession Hours Required by Week</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D0C2" />
                  <XAxis dataKey="week" tick={{ fill: '#6B6258', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B6258', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F4EC', borderColor: '#D8D0C2', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="manualHours" name="BDMS Hours" stroke="#B5762E" strokeWidth={2} />
                  <Line type="monotone" dataKey="optimizedHours" name="AI Hours" stroke="#3E5C55" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Department Multi-Activity Co-Location Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D0C2" />
                  <XAxis dataKey="week" tick={{ fill: '#6B6258', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B6258', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#F7F4EC', borderColor: '#D8D0C2', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="multiDeptBundles" name="Unified Mega Blocks (ENG+TRD+S&T)" fill="#5C7A5A" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
