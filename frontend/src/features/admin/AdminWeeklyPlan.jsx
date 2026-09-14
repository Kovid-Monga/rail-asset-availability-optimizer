import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CalendarDays, Clock, CheckCircle2, Sparkles, Filter, Layers } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-400" />
            <span>Tactical 7-Day Cross-Department Block Plan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synchronized timetable matrix showing multi-department possession windows across Northern Railway divisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-[#111827] px-2.5 py-1 rounded border border-[#1F2937]">
            Corridor: Delhi–Mathura Trunk
          </span>
        </div>
      </div>

      {/* Cross-Department Weekly Matrix Table */}
      <Card className="border-[#1F2937] bg-[#111827]">
        <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Weekly Scheduled Window Grid (Mon 07 Sep – Sun 13 Sep 2026)
            </CardTitle>
            <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              590 Minutes Track Downtime Saved via Bundling
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1F2937]">
            {weeklySchedule.map((plan, idx) => (
              <div key={idx} className="p-5 hover:bg-[#0B0F17]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 md:max-w-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-200">{plan.date}</span>
                    <span className="font-mono text-xs bg-[#0B0F17] text-orange-400 px-2 py-0.5 rounded border border-[#1F2937]">
                      {plan.timeWindow}
                    </span>
                    {plan.savedBlockMinutes > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{plan.savedBlockMinutes}m saved
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-100">
                    {plan.section}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Departments:</span>
                    {plan.departments.map(d => (
                      <span
                        key={d}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          d === 'ENG'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : d === 'TRD'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-1 md:px-6">
                  <ul className="text-xs text-slate-400 space-y-1 bg-[#0B0F17] p-3 rounded-lg border border-[#1F2937]">
                    {plan.activities.map((act, aIdx) => (
                      <li key={aIdx} className="leading-relaxed flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        <span className="truncate">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${
                    plan.status === 'Confirmed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {plan.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {plan.blockType.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
