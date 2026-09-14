import React, { useState } from 'react';
import { STATIONS, CORRIDORS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Train, Wrench, ShieldAlert, CheckCircle2, Activity, Zap, Radio } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CorridorVisualization = ({ activeBlocks = [], selectedCorridor = 'KLK-SML', onSelectCorridor }) => {
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeCorridorId, setActiveCorridorId] = useState(selectedCorridor);

  const handleCorridorChange = (id) => {
    setActiveCorridorId(id);
    setSelectedPin(null);
    if (onSelectCorridor) onSelectCorridor(id);
  };

  const isKalka = activeCorridorId === 'KLK-SML';
  const corridorInfo = CORRIDORS.find(c => c.id === activeCorridorId) || CORRIDORS[0];
  const stations = STATIONS.filter(s => s.corridor === activeCorridorId);

  // Corridor maintenance and telemetry pins
  const pins = isKalka ? [
    {
      id: 'KLK-PIN-1',
      km: 42.8,
      station: 'BRG (Barog)',
      title: 'Barog Tunnel #33 USFD Track Inspection',
      type: 'JOINT_BLOCK',
      department: 'ENG + S&T',
      status: 'Scheduled',
      time: '01:30 - 04:30',
      track: 'Main Hill Track',
      desc: 'Joint ultrasonic flaw detection (USFD) and tokenless block instrument calibration. Zero passenger interference.',
      speedRestriction: '25 km/h Caution'
    },
    {
      id: 'KLK-PIN-2',
      km: 61.4,
      station: 'KDGH (Kandaghat)',
      title: 'Viaduct Arch Bridge #226 Masonry Audit',
      type: 'WATCHLIST',
      department: 'ENG',
      status: 'Inspection Due',
      time: 'Cyclical Interval',
      track: 'Main Hill Track',
      desc: 'Multi-span stone masonry viaduct periodic inspection. Sourced from TMS defect database.',
      speedRestriction: 'None'
    }
  ] : [
    {
      id: 'TRK-PIN-1',
      km: 14.5,
      station: 'NZM - TKD',
      title: 'TSR Sleeper Renewal (ENG) + S&T Point Machine #41A',
      type: 'JOINT_BLOCK',
      department: 'ENG + S&T + TRD',
      status: 'Scheduled Joint Block',
      time: '01:30 - 04:00',
      track: 'UP Main Line',
      desc: 'Unified 150m possession; co-located track sleeper renewal, OHE wire splice, and point machine overhaul.',
      speedRestriction: '45 km/h for 24h'
    },
    {
      id: 'TRK-PIN-2',
      km: 29.2,
      station: 'FDB Outer',
      title: 'Ballast Cleaning (ENG-2026-00422)',
      type: 'CONFLICT_ZONE',
      department: 'ENG',
      status: 'Alternative Suggested',
      time: 'Night Slot Proposed',
      track: 'DN Main Line',
      desc: 'Daytime window denied due to Vande Bharat & EMU paths. Night shadow slot recommended by optimizer.',
      speedRestriction: '30 km/h during tamping'
    },
    {
      id: 'TRK-PIN-3',
      km: 10.4,
      station: 'NDLS Yard South',
      title: 'Turnout #108A USFD Urgent Flaw',
      type: 'CRITICAL_DEFECT',
      department: 'ENG',
      status: 'Human Review Pending',
      time: 'Emergency Night Slot',
      track: 'Yard Cross-over',
      desc: 'USFD testing revealed micro-crack. Department appeal filed for emergency night override.',
      speedRestriction: '15 km/h Severe'
    },
    {
      id: 'TRK-PIN-4',
      km: 12.8,
      station: 'NZM Feeder',
      title: 'OHE Catenary Wire Tensioning',
      type: 'TRD_BLOCK',
      department: 'TRD',
      status: 'Scheduled',
      time: '01:30 - 04:00',
      track: 'UP Line',
      desc: 'Power shutdown combined with track block. 25kV feeder isolated at Tuglakabad TSS.',
      speedRestriction: 'Power Isolation'
    }
  ];

  return (
    <Card className="w-full overflow-hidden border-slate-800 bg-[#0F172A]/90 backdrop-blur-md">
      <CardHeader className="bg-slate-900/80 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <Activity className="w-4 h-4 text-rail-primary animate-pulse" />
              <span>{corridorInfo.name}</span>
              <span className="text-[10px] font-mono text-slate-300 px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
                {corridorInfo.distanceKm} Km • {corridorInfo.lineCount} {corridorInfo.lineCount === 1 ? 'Track' : 'Tracks'}
              </span>
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Live spatial map of active possessions, scheduled joint blocks, and track asset telemetry
            </p>
          </div>

          {/* Corridor Switcher & Legend */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {CORRIDORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleCorridorChange(c.id)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-md transition-all",
                    activeCorridorId === c.id
                      ? "bg-rail-primary text-white shadow-glow-orange"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {c.shortName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 bg-[#0B0F17]/95">
        {/* Schematic Track Diagram */}
        <div className="relative border border-slate-800/90 rounded-xl bg-slate-950/80 p-5 overflow-x-auto min-w-[760px] shadow-inner">
          {/* Track Lines Header */}
          <div className="absolute left-4 top-4 text-[10px] font-mono text-slate-400 space-y-8">
            {isKalka ? (
              <>
                <span className="block font-semibold text-sky-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
                  Narrow Gauge Main Track
                </span>
                <span className="block font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span>
                  Station Loop & Sidings
                </span>
              </>
            ) : (
              <>
                <span className="block font-semibold text-sky-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>
                  UP Line (Delhi Bound)
                </span>
                <span className="block font-semibold text-purple-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                  DN Line (Mathura Bound)
                </span>
                <span className="block font-semibold text-amber-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  3rd Freight Trunk
                </span>
              </>
            )}
          </div>

          <div className="ml-48 mr-6">
            {/* Stations Axis */}
            <div className="flex justify-between items-center mb-5 relative pb-3 border-b border-slate-800">
              {stations.map((stn) => (
                <div key={stn.code} className="flex flex-col items-center group cursor-pointer">
                  <div className="w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-500 group-hover:border-rail-primary group-hover:bg-rail-primary transition-all"></div>
                  <span className="text-[11px] font-bold text-slate-200 mt-1.5 group-hover:text-rail-primary">{stn.code}</span>
                  <span className="text-[9px] font-mono text-slate-500">{stn.km}k</span>
                </div>
              ))}
            </div>

            {/* Track 1 */}
            <div className="relative h-11 flex items-center border-y border-dashed border-slate-800/80 my-3">
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-sky-900 via-sky-600 to-sky-900 rounded opacity-60"></div>
              
              {isKalka ? (
                /* Barog Tunnel #33 Pin */
                <button
                  onClick={() => setSelectedPin(pins[0])}
                  className="absolute left-[40%] -top-2.5 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-glow-emerald transition-all hover:scale-105 z-10"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tunnel #33 Joint Block (ENG+S&T)</span>
                </button>
              ) : (
                <>
                  {/* Pin 1: Km 14.5 (NZM-TKD) */}
                  <button
                    onClick={() => setSelectedPin(pins[0])}
                    className="absolute left-[12%] -top-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-glow-emerald transition-all hover:scale-105 z-10"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Joint Block Km 14/2 (ENG+TRD+S&T)</span>
                  </button>
                  {/* Pin 4: Km 12.8 (TRD) */}
                  <button
                    onClick={() => setSelectedPin(pins[3])}
                    className="absolute left-[10%] top-5 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-600 text-white hover:bg-amber-500 shadow-sm z-10"
                  >
                    <Zap className="w-3 h-3" />
                    <span>TRD 25kV Feeder Block</span>
                  </button>
                </>
              )}
            </div>

            {/* Track 2 */}
            <div className="relative h-11 flex items-center border-y border-dashed border-slate-800/80 my-3">
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-purple-900 via-purple-600 to-purple-900 rounded opacity-60"></div>
              
              {isKalka ? (
                /* Viaduct Arch Bridge Pin */
                <button
                  onClick={() => setSelectedPin(pins[1])}
                  className="absolute left-[60%] -top-2.5 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-sky-600 text-white hover:bg-sky-500 shadow-glow-cyan transition-all hover:scale-105 z-10"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Viaduct Arch Bridge #226 (TMS Audit)</span>
                </button>
              ) : (
                /* Pin 2: Km 29.2 (Faridabad Outer) */
                <button
                  onClick={() => setSelectedPin(pins[1])}
                  className="absolute left-[24%] -top-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all hover:scale-105 z-10"
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Km 28/4 BCM (Night Alt Slot)</span>
                </button>
              )}
            </div>

            {!isKalka && (
              /* Track 3: 3rd Line (Freight dedicated) */
              <div className="relative h-11 flex items-center border-y border-dashed border-slate-800/80 my-3">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-amber-900 via-amber-600 to-amber-900 rounded opacity-60"></div>
                {/* Pin 3: Yard Turnout Flaw */}
                <button
                  onClick={() => setSelectedPin(pins[2])}
                  className="absolute left-[6%] -top-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/50 transition-all hover:scale-105 z-10 animate-pulse"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Turnout 108A [USFD Crack - Appeal]</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pin Details Drawer / Card */}
        {selectedPin && (
          <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start justify-between gap-4 animate-in fade-in duration-150 shadow-card-dark">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-white">{selectedPin.title}</span>
                <Badge variant={selectedPin.type === 'CRITICAL_DEFECT' ? 'critical' : selectedPin.type === 'CONFLICT_ZONE' ? 'warning' : 'success'}>
                  {selectedPin.status}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {selectedPin.station} • {selectedPin.track}
                </span>
                {selectedPin.speedRestriction !== 'None' && (
                  <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 bg-amber-950/60 rounded border border-amber-500/30">
                    TSR: {selectedPin.speedRestriction}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedPin.desc}</p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-mono bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
                {selectedPin.time}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
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
