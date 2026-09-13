import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CalendarDays, Clock, CheckCircle2, Sparkles, Filter } from 'lucide-react';

export const AdminWeeklyPlan = () => {
  const [selectedSection, setSelectedSection] = useState('ALL');

  const weeklySchedule = [
    {
      date: '2026-09-07 (Mon)',
      section: 'NDLS-NZM (UP Line Km 10-15)',
      timeWindow: '01:30 - 04:00',
      departments: ['ENG', 'TRD', 'SNT'],
      activities: [
        'ENG: Through Sleeper Renewal (420 PSC sleepers)',
        'TRD: Contact wire splice & catenary tensioning',
        'S&T: Point Machine 41A motor overhaul & throw test'
      ],
      blockType: 'MEGA_JOINT_BLOCK',
      savedBlockMinutes: 150,
      status: 'Confirmed'
    },
    {
      date: '2026-09-08 (Tue)',
      section: 'NZM-PWL (DN Line Km 28-35)',
      timeWindow: '01:45 - 04:15',
      departments: ['ENG', 'TRD'],
      activities: [
        'ENG: Ballast Cleaning Machine (BCM-342) deep screening',
        'TRD: Insulator washing & flashover replacement'
      ],
      blockType: 'JOINT_BLOCK',
      savedBlockMinutes: 140,
      status: 'Confirmed'
    },
    {
      date: '2026-09-09 (Wed)',
      section: 'PWL-MTJ (UP Line Km 88-92)',
      timeWindow: '02:00 - 04:30',
      departments: ['ENG'],
      activities: [
        'ENG: Curve realignment & Duomatic tamping pass'
      ],
      blockType: 'SINGLE_BLOCK',
      savedBlockMinutes: 0,
      status: 'Scheduled'
    },
    {
      date: '2026-09-10 (Thu)',
      section: 'NDLS Yard South Cross-over 3',
      timeWindow: '01:00 - 04:30',
      departments: ['ENG', 'SNT'],
      activities: [
        'ENG: Turnout #108A stock & tongue rail replacement',
        'S&T: Electronic Interlocking switch detection calibration'
      ],
      blockType: 'JOINT_BLOCK',
      savedBlockMinutes: 180,
      status: 'Pending Admin Review'
    },
    {
      date: '2026-09-11 (Fri)',
      section: 'NZM-TKD (3rd Goods Line)',
      timeWindow: '13:00 - 15:30',
      departments: ['TRD'],
      activities: [
        'TRD: Cantilever inspection using 8-Wheeler Tower Wagon'
      ],
      blockType: 'SHADOW_BLOCK',
      savedBlockMinutes: 0,
      status: 'Confirmed'
    },
    {
      date: '2026-09-12 (Sat)',
      section: 'PWL-MTJ (DN Line Km 104)',
      timeWindow: '01:30 - 04:00',
      departments: ['ENG', 'SNT'],
      activities: [
        'ENG: Alumino-Thermic (AT) rail weld execution',
        'S&T: Multi-Section Digital Axle Counter clamp alignment'
      ],
      blockType: 'JOINT_BLOCK',
      savedBlockMinutes: 120,
      status: 'Scheduled'
    },
    {
      date: '2026-09-13 (Sun)',
      section: 'Corridor-wide System Audit',
      timeWindow: '02:00 - 03:30',
      departments: ['SNT'],
      activities: [
        'S&T: Optical Fibre Cable (OFC) ring protection switchover test'
      ],
      blockType: 'OFFLINE_TEST',
      savedBlockMinutes: 0,
      status: 'Scheduled'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-rail-primary" />
            <span>Tactical 7-Day Cross-Department Block Plan</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Synchronized timetable matrix showing multi-department possession windows across Northern Railway divisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-rail-muted">Corridor: Delhi-Palwal-Mathura</span>
        </div>
      </div>

      {/* Cross-Department Weekly Matrix Table */}
      <Card>
        <CardHeader className="bg-[#ECE5D8]">
          <div className="flex items-center justify-between w-full">
            <CardTitle>
              <span>Weekly Scheduled Window Grid (Mon 07 Sep – Sun 13 Sep 2026)</span>
            </CardTitle>
            <span className="text-xs font-mono bg-rail-success text-white px-2 py-0.5 rounded-sm font-semibold">
              Total 590 Minutes Possession Saved via Bundling
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-rail-border/60">
            {weeklySchedule.map((plan, idx) => (
              <div key={idx} className="p-4 hover:bg-[#FAF7F0] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 md:max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-rail-text">{plan.date}</span>
                    <span className="font-mono text-xs bg-[#EAE3D5] text-rail-text px-2 py-0.5 rounded-sm border border-rail-border">
                      {plan.timeWindow}
                    </span>
                    {plan.savedBlockMinutes > 0 && (
                      <span className="text-[10px] font-mono text-rail-success bg-[#EEF5F1] px-1.5 py-0.5 rounded-sm border border-rail-success/30 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{plan.savedBlockMinutes}m saved
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-rail-text">
                    {plan.section}
                  </div>
                </div>

                {/* Participating Department Multi-Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono uppercase text-rail-muted mr-1">Depts:</span>
                  {plan.departments.includes('ENG') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm border bg-[#E8EFEA] text-[#3E5C55] border-[#3E5C55]/30">
                      ENG
                    </span>
                  )}
                  {plan.departments.includes('TRD') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm border bg-[#F7EFE3] text-[#B5762E] border-[#B5762E]/30">
                      TRD
                    </span>
                  )}
                  {plan.departments.includes('SNT') && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm border bg-[#EBF1F5] text-[#4A6B82] border-[#4A6B82]/30">
                      S&T
                    </span>
                  )}
                </div>

                {/* Activities Breakdown */}
                <div className="flex-1 min-w-0">
                  <ul className="text-xs text-rail-muted space-y-0.5 list-disc list-inside">
                    {plan.activities.map((act, aIdx) => (
                      <li key={aIdx} className="truncate">{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Status */}
                <div className="shrink-0 text-right">
                  <Badge variant={plan.status === 'Confirmed' ? 'success' : 'secondary'}>
                    {plan.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
