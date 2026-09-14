import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CalendarRange, LineChart, Layers, Flame, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export const AdminMonthlyPlan = () => {
  const departmentWorkload = [
    { name: 'Engineering (Civil / Track)', requestsCount: 18, hoursPlanned: 48.5, percentage: 46, color: 'bg-emerald-500' },
    { name: 'TRD (Traction / OHE)', requestsCount: 12, hoursPlanned: 32.0, percentage: 30, color: 'bg-amber-500' },
    { name: 'S&T (Signal & Telecom)', requestsCount: 10, hoursPlanned: 24.5, percentage: 24, color: 'bg-cyan-500' }
  ];

  const majorUpcomingActivities = [
    {
      milestone: 'Yamuna Bridge Approach Deep Screening & Track Re-alignment',
      department: 'ENG + TRD',
      targetWeek: 'Week 3 (Sep 18 - 22)',
      corridor: 'NZM-PWL Km 22',
      impact: 'Co-located 4-hour night possession across 3 consecutive nights.'
    },
    {
      milestone: 'Tuglakabad TSS-02 25kV Feeder Transformer Overhaul',
      department: 'TRD',
      targetWeek: 'Week 3 (Sep 20)',
      corridor: 'TKD Yard Grid',
      impact: 'Power isolation planned during midnight shadow window.'
    },
    {
      milestone: 'Faridabad Electronic Interlocking Microprocessor Migration',
      department: 'S&T',
      targetWeek: 'Week 4 (Sep 25 - 26)',
      corridor: 'FDB Station Central Cabin',
      impact: 'Weekend non-interlocking block (NI work) with emergency manual crank handling.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-orange-400" />
            <span>Strategic Monthly Maintenance Outlook (September 2026)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Network capacity forecast, planned possessions overview, and cross-department workload distribution.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 bg-[#111827] px-3 py-1.5 rounded border border-[#1F2937]">
          <span>Simulation Horizon: 30 Days</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Total Planned Possessions
          </span>
          <div className="text-2xl font-bold text-slate-100 mt-1">40 Blocks</div>
          <span className="text-[10px] text-emerald-400 font-medium mt-1 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            16 Bundled Joint Possessions
          </span>
        </Card>

        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Corridor Track Possession Hours
          </span>
          <div className="text-2xl font-bold text-slate-100 mt-1">105.0 Hrs</div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Saved 54 hrs vs Manual BDMS
          </span>
        </Card>

        <Card className="p-4 bg-[#111827] border-[#1F2937]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">
            Corridor Availability Index
          </span>
          <div className="text-2xl font-bold text-orange-400 mt-1">94.8%</div>
          <span className="text-[10px] text-emerald-400 font-medium mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% uptime gain
          </span>
        </Card>

        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-tight block flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Projected Overdue Inspections
          </span>
          <div className="text-2xl font-bold text-red-400 mt-1">4 Items</div>
          <span className="text-[10px] text-red-300 font-medium mt-1 block">
            Prioritized in Week 2
          </span>
        </Card>
      </div>

      {/* Department Workload Distribution & Major Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Workload Breakdown */}
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Department Workload & Track Hours Share
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {departmentWorkload.map((dept, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{dept.name}</span>
                  <span className="font-mono text-slate-400">
                    {dept.requestsCount} requests • {dept.hoursPlanned} hrs ({dept.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-[#0B0F17] rounded-full overflow-hidden border border-[#1F2937]">
                  <div
                    className={`h-full ${dept.color} transition-all duration-500`}
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-[#0B0F17] rounded-lg border border-[#1F2937] text-xs space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Balanced Multi-Department Quotas
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The combinatorial solver ensures equitable track time distribution so safety-critical track work (TMS) does not starve OHE catenary rehabilitation (TDMS) or interlocking upgrades (SMMS).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Upcoming Strategic Milestones */}
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Major High-Impact Possessions (Sep 2026)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {majorUpcomingActivities.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-[#0B0F17] rounded-lg border border-[#1F2937] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{item.milestone}</span>
                  <span className="text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
                    {item.department}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{item.corridor}</span>
                  <span className="font-mono text-slate-500">{item.targetWeek}</span>
                </div>
                <p className="text-[11px] text-slate-300 bg-[#111827] p-2 rounded border border-[#1F2937]">
                  {item.impact}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
