import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchPassengerTimetable, fetchGoodsForecast } from '../../services/coa';
import { getAllRequests } from '../../services/requests';
import { CORRIDORS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CorridorVisualization } from './CorridorVisualization';
import {
  Train,
  PackageCheck,
  Clock,
  Calendar,
  Search,
  Wrench,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  MapPin,
  Compass
} from 'lucide-react';
import { cn } from '../../utils/cn';

export const CorridorTimetable = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [selectedCorridorId, setSelectedCorridorId] = useState('KLK-SML');
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState('ALL'); // 'ALL' | 'PASSENGER' | 'FREIGHT' | 'BLOCKS'

  const [passengerTrains, setPassengerTrains] = useState([]);
  const [goodsForecasts, setGoodsForecasts] = useState([]);
  const [scheduledBlocks, setScheduledBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrainModal, setActiveTrainModal] = useState(null);

  const activeCorridor = CORRIDORS.find(c => c.id === selectedCorridorId) || CORRIDORS[0];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [passengers, goods, reqs] = await Promise.all([
        fetchPassengerTimetable(selectedCorridorId),
        fetchGoodsForecast(selectedCorridorId),
        getAllRequests()
      ]);
      setPassengerTrains(passengers);
      setGoodsForecasts(goods);
      setScheduledBlocks(reqs.filter(r => r.scheduledSlot));
      setLoading(false);
    }
    load();
  }, [selectedCorridorId]);

  // Filter trains based on search and tab
  const filteredTrains = passengerTrains.filter(t => {
    const matchesSearch = t.trainNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.trainName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (viewFilter === 'PASSENGER') return t.status !== 'Maintenance';
    if (viewFilter === 'BLOCKS') return t.status === 'Maintenance';
    return true;
  });

  const activeTrainCount = passengerTrains.filter(t => t.status !== 'Maintenance').length;
  const maintenanceCount = passengerTrains.filter(t => t.status === 'Maintenance').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Banner (Matching RailNet reference) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Route Card (Matching left route card in Reference Image 2) */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="overflow-hidden border-slate-800 bg-slate-900/90 shadow-card-dark">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Train className="w-4 h-4 text-rail-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Route
                </span>
              </div>
              <select
                value={selectedCorridorId}
                onChange={(e) => setSelectedCorridorId(e.target.value)}
                className="bg-slate-800 text-xs font-semibold text-white px-2 py-1 rounded border border-slate-700 focus:outline-none"
              >
                {CORRIDORS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.shortName}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Picture & Stats */}
            <div className="relative h-44 overflow-hidden group">
              <img
                src={activeCorridor.bannerImage}
                alt={activeCorridor.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xs font-bold block">{activeCorridor.shortName}</span>
                <span className="text-[11px] text-slate-300">
                  {activeCorridor.distanceKm} km • {activeCorridor.avgDuration} (avg)
                </span>
              </div>
            </div>

            {/* Route Telemetry Stats */}
            <div className="p-4 space-y-3 bg-slate-900/60">
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-2">
                  <Train className="w-3.5 h-3.5 text-sky-400" /> Total Trains
                </span>
                <span className="font-mono font-bold text-white">{activeCorridor.totalTrains}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Today
                </span>
                <span className="font-mono font-bold text-emerald-400">{activeTrainCount || 11}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-rail-primary" />
                  Scheduled Maintenance
                </span>
                <span className="font-mono font-bold text-rail-primary">{maintenanceCount || 1}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/60 text-[11px] italic text-slate-400 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Safe journeys, stronger connections</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Timetable Main Table Area (Matching RailNet table in Reference Image 2) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Hero Banner Header */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800 p-6 shadow-card-dark">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rail-primary animate-ping"></div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {activeCorridor.name}
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  Live Timetable & COA Corridor Possession Status
                </p>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Distance</span>
                  <span className="font-bold text-white">{activeCorridor.distanceKm} km</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Avg. Duration</span>
                  <span className="font-bold text-white">{activeCorridor.avgDuration}</span>
                </div>
                <div className="px-3 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Trains</span>
                  <span className="font-bold text-white">{activeCorridor.totalTrains}</span>
                </div>
                <div className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-emerald-400">Route Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Filter Bar: Date & Search Input */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 text-white text-xs font-semibold pl-9 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-rail-primary"
                />
              </div>

              {/* View filters */}
              <div className="hidden sm:flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewFilter('ALL')}
                  className={cn("px-2.5 py-1 text-xs font-medium rounded-md", viewFilter === 'ALL' ? "bg-rail-primary text-white" : "text-slate-400 hover:text-white")}
                >
                  All
                </button>
                <button
                  onClick={() => setViewFilter('PASSENGER')}
                  className={cn("px-2.5 py-1 text-xs font-medium rounded-md", viewFilter === 'PASSENGER' ? "bg-rail-primary text-white" : "text-slate-400 hover:text-white")}
                >
                  Passenger
                </button>
                <button
                  onClick={() => setViewFilter('BLOCKS')}
                  className={cn("px-2.5 py-1 text-xs font-medium rounded-md", viewFilter === 'BLOCKS' ? "bg-rail-primary text-white" : "text-slate-400 hover:text-white")}
                >
                  Maintenance
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search train no. or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-white placeholder:text-slate-500 text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-rail-primary"
              />
            </div>
          </div>

          {/* Train Timetable Table (Exact RailNet table layout) */}
          <div className="overflow-x-auto border border-slate-800/90 rounded-xl bg-slate-900/60 backdrop-blur-md shadow-card-dark">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">Train No.</th>
                  <th className="py-3 px-3.5">Train Name</th>
                  <th className="py-3 px-3">Departure</th>
                  <th className="py-3 px-3">Arrival</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Days</th>
                  <th className="py-3 px-3">
                    <div className="text-center">Seat / Berth Availability</div>
                    <div className="flex justify-center gap-3 text-[9px] text-slate-500 font-mono mt-0.5">
                      <span>1A</span>
                      <span>2A</span>
                      <span>3A</span>
                      <span>SL</span>
                      <span>2S</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredTrains.map((train) => {
                  const isMaintenance = train.status === 'Maintenance';
                  return (
                    <tr
                      key={train.trainNumber}
                      onClick={() => setActiveTrainModal(train)}
                      className={cn(
                        "hover:bg-slate-800/40 transition-colors cursor-pointer group",
                        isMaintenance && "bg-orange-950/20 hover:bg-orange-950/30"
                      )}
                    >
                      <td className="py-3.5 px-3.5 font-mono font-bold text-white group-hover:text-rail-primary transition-colors">
                        {train.trainNumber}
                      </td>
                      <td className="py-3.5 px-3.5 font-medium text-slate-100">
                        {train.trainName}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {train.departure}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-300">
                        {train.arrival}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 font-mono">
                        {train.duration}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {train.days}
                      </td>

                      {/* Berth / Seat Availability visual dots (Matching RailNet reference) */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {train.seats ? (
                            train.seats.map((st, i) => (
                              <span
                                key={i}
                                title={`${st.class}: ${st.available ? 'Available' : 'Unavailable/Full'}`}
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full inline-block transition-transform hover:scale-125",
                                  st.available
                                    ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                    : "bg-slate-700"
                                )}
                              />
                            ))
                          ) : (
                            <div className="flex justify-center gap-3">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status pill */}
                      <td className="py-3.5 px-3">
                        {isMaintenance ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-950/80 text-orange-400 border border-orange-500/50 shadow-glow-orange flex items-center gap-1 w-fit">
                            <Wrench className="w-3 h-3" /> Maintenance
                          </span>
                        ) : train.status.includes('Delayed') ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/50 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> {train.status}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            On Time
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTrainModal(train);
                          }}
                          className="text-slate-400 hover:text-rail-primary text-xs font-semibold flex items-center justify-end gap-1 ml-auto"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Persistent Bottom Callout Bar (Matching Reference Image 2!) */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card-dark">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-rail-primary shrink-0 shadow-inner">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Need to schedule maintenance?
                </span>
                <span className="text-xs text-slate-400">
                  Plan and allocate maintenance windows for selected trains or corridor route.
                </span>
              </div>
            </div>

            <Link to={`/${currentRole.toLowerCase() === 'admin' ? 'eng' : currentRole.toLowerCase()}/new-request`}>
              <Button variant="default" size="md" className="shrink-0 shadow-glow-orange">
                <span>Schedule Maintenance</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Corridor Spatial Map */}
      <CorridorVisualization
        selectedCorridor={selectedCorridorId}
        onSelectCorridor={(id) => setSelectedCorridorId(id)}
        activeBlocks={scheduledBlocks}
      />

      {/* Constraints Legend and Architecture Principle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hard Constraint Principle Box */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Hard Constraints: Passenger Timetable (Non-Negotiable)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Confirmed passenger train paths (Vande Bharat, Rajdhani, Kalka Mail, EMUs) are mathematically protected. The AI optimization engine cannot assign maintenance blocks that cause cascade passenger delays.
          </p>
        </div>

        {/* Soft Constraint Principle Box */}
        <div className="p-4 bg-slate-900/80 border border-dashed border-amber-500/40 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-amber-400 bg-transparent"></span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Soft Constraints: Goods Train Forecast (Flexible / Regulated)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Freight paths are probabilistic soft constraints. The engine can buffer goods trains in yard loops (e.g., Tuglakabad Yard) or divert to secondary lines to facilitate continuous multi-department possession.
          </p>
        </div>
      </div>

      {/* Train Detail Modal */}
      {activeTrainModal && (
        <Modal
          isOpen={!!activeTrainModal}
          onClose={() => setActiveTrainModal(null)}
          title={`Train #${activeTrainModal.trainNumber} — ${activeTrainModal.trainName}`}
          description={`${activeTrainModal.category || 'Express'} • ${activeCorridor.name}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 font-mono">
                Speed: {activeTrainModal.speedKmH || 110} km/h • Line: {activeTrainModal.trackLine || 'UP Line'}
              </span>
              <Button variant="outline" size="sm" onClick={() => setActiveTrainModal(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Departure</span>
                <span className="text-sm font-bold text-white">{activeTrainModal.departure}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Arrival</span>
                <span className="text-sm font-bold text-white">{activeTrainModal.arrival}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Running Days</span>
                <span className="text-sm font-bold text-white">{activeTrainModal.days}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Status</span>
                <span className="text-sm font-bold text-emerald-400">{activeTrainModal.status}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                COA Operational Constraints Classification
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTrainModal.notes || 'Strictly protected passenger slot. Corridor clearance verified with zero block infringements.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
