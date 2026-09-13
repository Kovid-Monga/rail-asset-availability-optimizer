import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CalendarRange, LineChart, Layers, Flame, CheckCircle2, TrendingUp } from 'lucide-react';

export const AdminMonthlyPlan = () => {
  const departmentWorkload = [
    { name: 'Engineering (Civil/Track)', requestsCount: 18, hoursPlanned: 48.5, percentage: 46, color: 'bg-[#3E5C55]' },
    { name: 'TRD (Traction / OHE)', requestsCount: 12, hoursPlanned: 32.0, percentage: 30, color: 'bg-[#B5762E]' },
    { name: 'S&T (Signal & Telecom)', requestsCount: 10, hoursPlanned: 24.5, percentage: 24, color: 'bg-[#4A6B82]' }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-rail-primary" />
            <span>Strategic Monthly Maintenance Outlook (September 2026)</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Network capacity forecast, planned possessions overview, and department workload distribution.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-rail-muted">
          <span>Simulation Horizon: 30 Days</span>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Total Planned Possessions
          </span>
          <div className="text-2xl font-bold text-rail-text mt-1">40 Blocks</div>
          <span className="text-[10px] text-rail-success font-medium mt-0.5 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            16 Bundled Joint Possessions
          </span>
        </Card>

        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Corridor Track Possession Hours
          </span>
          <div className="text-2xl font-bold text-rail-text mt-1">105.0 Hrs</div>
          <span className="text-[10px] text-rail-muted mt-0.5 block">
            Saved 54 hrs vs Manual BDMS
          </span>
        </Card>

        <Card className="p-4 bg-rail-surface">
          <span className="text-[10px] font-bold text-rail-muted uppercase tracking-tight block">
            Corridor Availability Index
          </span>
          <div className="text-2xl font-bold text-rail-primary mt-1">94.8%</div>
          <span className="text-[10px] text-rail-success font-medium mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18.4% uptime gain
          </span>
        </Card>

        <Card className="p-4 bg-rail-criticalLight/50 border-rail-critical/40">
          <span className="text-[10px] font-bold text-rail-critical uppercase tracking-tight block flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Projected Overdue Inspections
          </span>
          <div className="text-2xl font-bold text-rail-critical mt-1">4 Items</div>
          <span className="text-[10px] text-rail-critical font-medium mt-0.5 block">
            Prioritized in Week 2
          </span>
        </Card>
      </div>

      {/* Department Workload Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Department Workload & Possession Hours Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {departmentWorkload.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rail-text">{dept.name}</span>
                  <span className="font-mono text-rail-muted">
                    {dept.hoursPlanned} hrs ({dept.requestsCount} requests) • {dept.percentage}%
                  </span>
                </div>
                <div className="h-2.5 bg-[#EAE4D8] rounded-sm overflow-hidden flex">
                  <div style={{ width: `${dept.percentage}%` }} className={`${dept.color} h-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Major Critical Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Major Strategic Milestones (Next 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-rail-border/60">
            {majorUpcomingActivities.map((act, idx) => (
              <div key={idx} className="p-4 hover:bg-[#FAF7F0] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rail-text">{act.milestone}</span>
                    <Badge variant="primary" size="sm">{act.department}</Badge>
                  </div>
                  <p className="text-xs text-rail-muted">{act.impact}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rail-text block font-mono">{act.targetWeek}</span>
                  <span className="text-[10px] text-rail-muted font-mono">{act.corridor}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
