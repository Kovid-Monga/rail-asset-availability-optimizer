import React, { useState, useEffect } from 'react';
import { fetchPassengerTimetable, fetchGoodsForecast } from '../../services/coa';
import { getAllRequests } from '../../services/requests';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CorridorVisualization } from './CorridorVisualization';
import { Train, PackageCheck, AlertCircle, Clock, Calendar, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';

export const CorridorTimetable = () => {
  const [passengerTrains, setPassengerTrains] = useState([]);
  const [goodsForecasts, setGoodsForecasts] = useState([]);
  const [scheduledBlocks, setScheduledBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' | 'PASSENGER' | 'GOODS' | 'BLOCKS'

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [passengers, goods, reqs] = await Promise.all([
        fetchPassengerTimetable(),
        fetchGoodsForecast(),
        getAllRequests()
      ]);
      setPassengerTrains(passengers);
      setGoodsForecasts(goods);
      setScheduledBlocks(reqs.filter(r => r.scheduledSlot));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <span>COA Corridor & Timetable Constraints Matrix</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#EAE3D4] text-rail-text rounded-sm border border-rail-border font-semibold">
              Live COA Feed
            </span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Real-time feed from Control Office Application (COA). Hard passenger constraints vs flexible freight paths during optimization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('ALL')}
            className={cn("px-2.5 py-1 text-xs rounded-sm border font-medium", viewMode === 'ALL' ? "bg-rail-primary text-white border-rail-primary" : "bg-rail-surface text-rail-text border-rail-border")}
          >
            All Tracks
          </button>
          <button
            onClick={() => setViewMode('PASSENGER')}
            className={cn("px-2.5 py-1 text-xs rounded-sm border font-medium", viewMode === 'PASSENGER' ? "bg-rail-primary text-white border-rail-primary" : "bg-rail-surface text-rail-text border-rail-border")}
          >
            Hard Passenger
          </button>
          <button
            onClick={() => setViewMode('GOODS')}
            className={cn("px-2.5 py-1 text-xs rounded-sm border font-medium", viewMode === 'GOODS' ? "bg-rail-primary text-white border-rail-primary" : "bg-rail-surface text-rail-text border-rail-border")}
          >
            Soft Freight
          </button>
        </div>
      </div>

      {/* Corridor Spatial Map */}
      <CorridorVisualization activeBlocks={scheduledBlocks} />

      {/* Constraints Legend and Architecture Principle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hard Constraint Principle Box */}
        <div className="p-3.5 bg-rail-surface border-2 border-rail-primary/80 rounded-md">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rail-primary"></span>
            <span className="text-xs font-bold text-rail-text uppercase tracking-wider">
              Hard Constraints: Passenger Timetable (Non-Negotiable)
            </span>
          </div>
          <p className="text-xs text-rail-muted mt-1 leading-relaxed">
            Solid border and bold styling denote fixed passenger train paths (Vande Bharat, Rajdhani, Shatabdi, suburban locals). The AI engine is mathematically bounded from overlapping or creating cascade detention on these slots.
          </p>
        </div>

        {/* Soft Constraint Principle Box */}
        <div className="p-3.5 bg-[#F9F7F1] border-2 border-dashed border-rail-secondary rounded-md">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-rail-secondary bg-transparent"></span>
            <span className="text-xs font-bold text-rail-secondary uppercase tracking-wider">
              Soft Constraints: Goods Forecast (Flexible / Regulated)
            </span>
          </div>
          <p className="text-xs text-rail-muted mt-1 leading-relaxed">
            Dashed border and lighter styling denote freight paths. The optimization engine can regulate freight in yard loops (e.g. Tuglakabad Yard) or divert to 3rd lines to yield maintenance possession windows.
          </p>
        </div>
      </div>

      {/* 24-Hour Corridor Schedule Grid (Gantt-style) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rail-primary" />
              <span>Corridor Possession & Train Movement Matrix</span>
            </div>
            <span className="text-xs font-mono text-rail-muted font-normal">
              Optimal Shadow Window: 01:30 - 04:15
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline visualization bar */}
          <div className="border border-rail-border rounded-sm p-4 bg-[#FAF7F0] space-y-4">
            {/* Hours Ruler */}
            <div className="grid grid-cols-12 text-[10px] font-mono text-rail-muted border-b border-rail-border pb-1 text-center">
              <span>00:00</span>
              <span className="text-rail-success font-bold">02:00 [Shadow]</span>
              <span>04:00</span>
              <span className="text-rail-critical font-bold">06:00 [Peak]</span>
              <span className="text-rail-critical font-bold">08:00 [Peak]</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
              <span>20:00</span>
              <span>22:00</span>
            </div>

            {/* UP Track Lane */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-rail-text flex items-center justify-between">
                <span>UP Line (Km 0 to 141)</span>
                <span className="text-[10px] font-mono text-rail-muted">High Speed Trunk</span>
              </div>
              <div className="h-10 bg-[#EFEBE1] rounded-sm border border-rail-border relative flex items-center px-1 overflow-hidden">
                {/* Block Possession: 01:30 - 04:00 (ENG + TRD + SNT Joint Block) */}
                <div
                  style={{ left: '6%', width: '11%' }}
                  className="absolute h-8 bg-rail-success text-white rounded-sm border border-rail-success font-semibold text-[10px] flex items-center justify-center shadow-xs cursor-pointer"
                  title="Joint Maintenance Block: ENG Sleeper + TRD Catenary + S&T Point Machine (01:30 - 04:00)"
                >
                  <span className="truncate px-1">Joint Block (ENG+TRD+S&T)</span>
                </div>

                {/* Train 12424: 10:05 - 11:15 */}
                <div
                  style={{ left: '42%', width: '6%' }}
                  className="absolute h-8 bg-rail-primary text-white rounded-sm border border-rail-primary font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 12424 Dibrugarh Rajdhani Express (Hard Constraint)"
                >
                  <span className="truncate px-1">#12424 Rajdhani</span>
                </div>

                {/* Commuter 64064: 08:15 - 09:20 */}
                <div
                  style={{ left: '34%', width: '5%' }}
                  className="absolute h-8 bg-rail-primary text-white rounded-sm border border-rail-primary font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 64064 Palwal Local (Hard Constraint)"
                >
                  <span className="truncate px-1">#64064 EMU</span>
                </div>

                {/* Soft freight: 01:30 - 04:00 (Regulated in loop) */}
                <div
                  style={{ left: '7%', width: '10%' }}
                  className="absolute h-6 -bottom-0.5 bg-rail-secondaryLight text-rail-secondary rounded-sm border-2 border-dashed border-rail-secondary font-mono text-[9px] flex items-center justify-center z-10"
                  title="BOXN Coal Rake: Regulated at TKD Yard loop (Soft constraint)"
                >
                  <span className="truncate px-1">Freight (Held in loop)</span>
                </div>
              </div>
            </div>

            {/* DN Track Lane */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-rail-text flex items-center justify-between">
                <span>DN Line (Km 0 to 141)</span>
                <span className="text-[10px] font-mono text-rail-muted">Trunk Passenger Line</span>
              </div>
              <div className="h-10 bg-[#EFEBE1] rounded-sm border border-rail-border relative flex items-center px-1 overflow-hidden">
                {/* Train 22436: 06:00 - 07:18 */}
                <div
                  style={{ left: '25%', width: '6%' }}
                  className="absolute h-8 bg-rail-primary text-white rounded-sm border border-rail-primary font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 22436 Vande Bharat Express (Hard Constraint)"
                >
                  <span className="truncate px-1">#22436 Vande Bharat</span>
                </div>

                {/* Train 12004: 06:10 - 07:25 */}
                <div
                  style={{ left: '26%', width: '6%' }}
                  className="absolute h-6 top-1 bg-rail-primary/90 text-white rounded-sm border border-rail-primary font-bold text-[9px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 12004 Swarna Shatabdi (Hard Constraint)"
                >
                  <span className="truncate px-1">#12004 Shatabdi</span>
                </div>

                {/* Train 12952: 16:55 - 18:05 */}
                <div
                  style={{ left: '70%', width: '6%' }}
                  className="absolute h-8 bg-rail-primary text-white rounded-sm border border-rail-primary font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 12952 Tejas Rajdhani (Hard Constraint)"
                >
                  <span className="truncate px-1">#12952 Tejas</span>
                </div>

                {/* Train 12626: 20:10 - 21:30 */}
                <div
                  style={{ left: '84%', width: '6%' }}
                  className="absolute h-8 bg-rail-primary text-white rounded-sm border border-rail-primary font-bold text-[10px] flex items-center justify-center cursor-pointer shadow-xs"
                  title="Train 12626 Kerala Express (Hard Constraint)"
                >
                  <span className="truncate px-1">#12626 Express</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Table: Passenger Hard Constraints & Freight Soft Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Passenger Hard Constraints */}
        <Card className="border-rail-primary/40">
          <CardHeader className="bg-[#EBE5DA]">
            <CardTitle className="flex items-center gap-2">
              <Train className="w-4 h-4 text-rail-primary" />
              <span>COA Passenger Timetable (Hard Constraints)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-rail-border/60">
              {passengerTrains.map(train => (
                <div key={train.trainNumber} className="p-3.5 hover:bg-[#FAF7F0] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rail-text">
                        #{train.trainNumber}
                      </span>
                      <span className="font-semibold text-xs text-rail-text">
                        {train.trainName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-rail-primary text-white px-2 py-0.5 rounded-sm font-semibold">
                      Hard Constraint
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-rail-muted mt-1.5 font-mono">
                    <span>Corridor: {train.corridorEntry} ➔ {train.corridorExit}</span>
                    <span>Line: {train.trackLine}</span>
                    <span>Route: {train.origin} ➔ {train.destination}</span>
                  </div>
                  <p className="text-[11px] text-rail-muted mt-1">
                    {train.notes}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Goods Forecast Soft Constraints */}
        <Card className="border-dashed border-2 border-rail-secondary/60">
          <CardHeader className="bg-[#FAF4E8]">
            <CardTitle className="flex items-center gap-2 text-rail-secondary">
              <PackageCheck className="w-4 h-4 text-rail-secondary" />
              <span>COA Goods Forecast (Soft Constraints)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-rail-border/60">
              {goodsForecasts.map(gf => (
                <div key={gf.forecastId} className="p-3.5 hover:bg-[#FAF7F0] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-rail-text">
                        {gf.forecastId}
                      </span>
                      <span className="font-semibold text-xs text-rail-text">
                        {gf.rakeType}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-rail-secondaryLight text-rail-secondary px-2 py-0.5 rounded-sm border border-rail-secondary/40 font-semibold">
                      Soft Constraint
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-rail-muted mt-1.5 font-mono">
                    <span>Window: {gf.estimatedWindow}</span>
                    <span>Max Hold: {gf.maxDetentionToleratedMinutes}m</span>
                    <span>Flexibility: {gf.flexibility}</span>
                  </div>
                  <p className="text-[11px] text-rail-muted mt-1 leading-relaxed">
                    {gf.notes}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
