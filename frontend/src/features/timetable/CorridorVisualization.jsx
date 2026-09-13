import React, { useState } from 'react';
import { STATIONS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Train, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CorridorVisualization = ({ activeBlocks = [], selectedCorridor = 'NDLS-MTJ' }) => {
  const [selectedPin, setSelectedPin] = useState(null);

  // Representative corridor assets
  const corridorPins = [
    {
      id: 'PIN-1',
      km: 14.5,
      station: 'NZM - TKD',
      title: 'TSR Sleeper Renewal (ENG) + S&T Point Machine #41A',
      type: 'JOINT_BLOCK',
      department: 'ENG + S&T',
      status: 'Scheduled',
      time: '01:30 - 04:00',
      track: 'UP Line',
      desc: 'Unified 150m possession; co-located track sleeper and point machine maintenance.'
    },
    {
      id: 'PIN-2',
      km: 29.2,
      station: 'FDB Outer',
      title: 'Ballast Cleaning (ENG-2026-00422)',
      type: 'CONFLICT_ZONE',
      department: 'ENG',
      status: 'Alternative Suggested',
      time: 'Night Slot Proposed',
      track: 'DN Line',
      desc: 'Daytime window denied due to Vande Bharat & EMU paths. Night shadow slot recommended.'
    },
    {
      id: 'PIN-3',
      km: 10.4,
      station: 'NDLS Yard South',
      title: 'Turnout #108A Urgent Flaw',
      type: 'CRITICAL_DEFECT',
      department: 'ENG',
      status: 'Human Review Pending',
      time: 'Urgent Night Slot',
      track: 'Cross-over 3',
      desc: 'USFD testing revealed micro-crack. Department appeal filed for emergency night override.'
    },
    {
      id: 'PIN-4',
      km: 12.8,
      station: 'NZM',
      title: 'OHE Catenary Wire Splice',
      type: 'TRD_BLOCK',
      department: 'TRD',
      status: 'Scheduled',
      time: '01:30 - 04:00',
      track: 'UP Line',
      desc: 'Power shutdown combined with track block. 25kV feeder isolated.'
    }
  ];

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-[#ECE5D8]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <span>Delhi - Palwal - Mathura Trunk Corridor Schematic</span>
              <span className="text-[10px] font-mono text-rail-muted px-1.5 py-0.5 bg-[#E2DACB] rounded-sm border border-rail-border">
                141.2 Km • 3 Tracks
              </span>
            </CardTitle>
            <p className="text-xs text-rail-muted mt-0.5">
              Live spatial map of active possessions, scheduled joint blocks, and critical track diagnostics
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-rail-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rail-success"></span> Scheduled Joint Block
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rail-warning"></span> Alternative Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rail-critical"></span> Critical Defect / Appeal
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 bg-[#FAF7F0]">
        {/* Schematic SVG Corridor Track Diagram */}
        <div className="relative border border-rail-border rounded-sm bg-[#F2EDE2] p-4 overflow-x-auto min-w-[760px]">
          {/* Track Lines Header */}
          <div className="absolute left-3 top-3 text-[10px] font-mono text-rail-muted space-y-7">
            <span className="block font-semibold text-rail-text">UP Line (Delhi Bound)</span>
            <span className="block font-semibold text-rail-text">DN Line (Mathura Bound)</span>
            <span className="block font-semibold text-rail-text">3rd Freight Line</span>
          </div>

          <div className="ml-40 mr-6">
            {/* Stations Axis */}
            <div className="flex justify-between items-center mb-4 relative pb-2 border-b border-rail-border">
              {STATIONS.map((stn) => (
                <div key={stn.code} className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-rail-text"></div>
                  <span className="text-[11px] font-bold text-rail-text mt-1">{stn.code}</span>
                  <span className="text-[9px] font-mono text-rail-muted">{stn.km}k</span>
                </div>
              ))}
            </div>

            {/* Track 1: UP Line */}
            <div className="relative h-9 flex items-center border-y border-dashed border-rail-borderDark/80 my-2">
              <div className="absolute inset-x-0 h-0.5 bg-rail-text/40"></div>
              {/* Pin 1: Km 14.5 (NZM-TKD) */}
              <button
                onClick={() => setSelectedPin(corridorPins[0])}
                className="absolute left-[12%] -top-2 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-rail-success text-white hover:brightness-110 shadow-xs transition-transform hover:scale-105 z-10"
              >
                <Wrench className="w-3 h-3" />
                <span>Joint Block Km 14/2 (ENG + S&T)</span>
              </button>

              {/* Pin 4: Km 12.8 (TRD) */}
              <button
                onClick={() => setSelectedPin(corridorPins[3])}
                className="absolute left-[10%] top-4 flex items-center gap-1 px-1.5 py-0.2 rounded-sm text-[9px] font-bold bg-rail-secondary text-white hover:brightness-110 shadow-xs z-10"
              >
                <span>TRD OHE Splice</span>
              </button>
            </div>

            {/* Track 2: DN Line */}
            <div className="relative h-9 flex items-center border-y border-dashed border-rail-borderDark/80 my-2">
              <div className="absolute inset-x-0 h-0.5 bg-rail-text/40"></div>
              {/* Pin 2: Km 29.2 (Faridabad Outer) */}
              <button
                onClick={() => setSelectedPin(corridorPins[1])}
                className="absolute left-[24%] -top-2 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-rail-warning text-[#2B2621] hover:brightness-110 shadow-xs transition-transform hover:scale-105 z-10"
              >
                <Train className="w-3 h-3" />
                <span>Km 28/4 BCM (Alt Slot)</span>
              </button>
            </div>

            {/* Track 3: 3rd Line (Freight dedicated) */}
            <div className="relative h-9 flex items-center border-y border-dashed border-rail-borderDark/80 my-2">
              <div className="absolute inset-x-0 h-0.5 bg-rail-muted/30"></div>
              {/* Pin 3: Cross-over / Yard Turnout */}
              <button
                onClick={() => setSelectedPin(corridorPins[2])}
                className="absolute left-[5%] -top-2 flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-rail-critical text-white hover:brightness-110 shadow-xs transition-transform hover:scale-105 z-10 animate-pulse"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Turnout 108A [USFD Defect]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pin Details Drawer / Card */}
        {selectedPin && (
          <div className="mt-4 p-3.5 bg-rail-surface border border-rail-border rounded-sm flex flex-col sm:flex-row items-start justify-between gap-3 animate-in fade-in duration-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-rail-text">{selectedPin.title}</span>
                <Badge variant={selectedPin.type === 'CRITICAL_DEFECT' ? 'critical' : selectedPin.type === 'CONFLICT_ZONE' ? 'warning' : 'success'}>
                  {selectedPin.status}
                </Badge>
                <span className="text-[11px] font-mono text-rail-muted">
                  {selectedPin.station} • {selectedPin.track}
                </span>
              </div>
              <p className="text-xs text-rail-muted mt-1">{selectedPin.desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono bg-[#EAE3D4] text-rail-text px-2 py-1 rounded-sm border border-rail-border">
                {selectedPin.time}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-xs text-rail-muted hover:text-rail-text px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
