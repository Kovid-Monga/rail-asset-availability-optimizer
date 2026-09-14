import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, 
  Plus, 
  ListChecks, 
  FileSpreadsheet, 
  BarChart3, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getRequestsByDepartment } from '../../services/requests';
import { ReportModal } from '../../components/shared/ReportModal';
import { REQUEST_STAGES } from '../../constants/departments';

const MONTHLY_DATA_2026 = [
  { month: 'Jan', drives: 34 },
  { month: 'Feb', drives: 28 },
  { month: 'Mar', drives: 42 },
  { month: 'Apr', drives: 39 },
  { month: 'May', drives: 45 },
  { month: 'Jun', drives: 38 },
  { month: 'Jul', drives: 31 },
  { month: 'Aug', drives: 48 },
  { month: 'Sep', drives: 54 },
  { month: 'Oct', drives: 49 },
  { month: 'Nov', drives: 40 },
  { month: 'Dec', drives: 39 },
];

const MONTHLY_DATA_2025 = [
  { month: 'Jan', drives: 26 },
  { month: 'Feb', drives: 22 },
  { month: 'Mar', drives: 31 },
  { month: 'Apr', drives: 35 },
  { month: 'May', drives: 33 },
  { month: 'Jun', drives: 30 },
  { month: 'Jul', drives: 28 },
  { month: 'Aug', drives: 36 },
  { month: 'Sep', drives: 41 },
  { month: 'Oct', drives: 38 },
  { month: 'Nov', drives: 32 },
  { month: 'Dec', drives: 30 },
];

export const DepartmentOverview = ({ onNavigateTab }) => {
  const { effectiveRole } = useAuth();
  const { isDark } = useTheme();
  const [requests, setRequests] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedInspectReq, setSelectedInspectReq] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRequestsByDepartment(effectiveRole);
        setRequests(data);
      } catch (err) {
        console.error('Failed to load department requests', err);
      }
    }
    load();
  }, [effectiveRole]);

  // Today's scheduled maintenance drives
  const todayDrives = requests.filter(r => {
    // Show scheduled or in-progress drives
    return r.status === REQUEST_STAGES.SCHEDULED || 
           r.status === REQUEST_STAGES.IN_PROGRESS || 
           r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN;
  });

  const filteredDrives = todayDrives.filter(drive => {
    if (selectedType === 'ALL') return true;
    return drive.maintenanceType?.toLowerCase().includes(selectedType.toLowerCase());
  });

  const chartData = selectedYear === '2026' ? MONTHLY_DATA_2026 : MONTHLY_DATA_2025;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar: Today's Scheduled Maintenance Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] p-5 rounded-2xl border border-[#1E293B] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-orange-500/10 text-[#F97316] border border-orange-500/20">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">Maintenance Scheduled for Today</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-[#F97316] border border-orange-500/20">
                {todayDrives.length} Drives
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Corridor: Kalka &rarr; Shimla / Delhi &rarr; Mathura | Mon, Sep 14, 2026
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigateTab ? onNavigateTab('maintenance') : null}
          className="flex items-center justify-center space-x-2 bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition shadow-lg shadow-orange-500/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Maintenance</span>
        </button>
      </div>

      {/* ROW 1: Scheduled Today Table + Report Generation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Maintenance List Card (2 cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <ListChecks className="w-4 h-4 text-[#F97316]" />
                <span>Active Drives Scheduled Today</span>
              </h2>
              <div className="flex items-center space-x-2">
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-[#1E293B] text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F97316]"
                >
                  <option value="ALL">All Maintenance Types</option>
                  <option value="Sleeper">Sleeper Renewal (TSR)</option>
                  <option value="Ballast">Ballast Cleaning (BCM)</option>
                  <option value="Tamping">Track Tamping</option>
                  <option value="OHE">OHE Inspection</option>
                  <option value="Point Machine">Point Machine</option>
                </select>
              </div>
            </div>

            {/* Maintenance Drives Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#1E293B]/80 text-slate-400 uppercase font-semibold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Req ID & Line</th>
                    <th className="py-2.5 px-3">Maintenance Type</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredDrives.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No scheduled drives matching this filter today.
                      </td>
                    </tr>
                  ) : (
                    filteredDrives.map(drive => (
                      <tr key={drive.id} className="hover:bg-[#1E293B]/40 transition">
                        <td className="py-3 px-3 font-mono text-[11px] text-white">
                          <div>{drive.scheduledSlot?.date || 'Today'}</div>
                          <div className="text-slate-400 text-[10px]">
                            {drive.scheduledSlot?.timeWindow?.split(' ')[0] || drive.preferredWindow || 'Night Window'}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-white">
                          <span className="font-mono text-emerald-400 font-bold">{drive.id}</span>
                          <span className="text-[10px] text-slate-400 block">{drive.trackLine || 'Main Track'}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium">
                          {drive.maintenanceType}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] max-w-[140px] truncate">
                          {drive.location || drive.sectionName || drive.corridor}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {drive.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedInspectReq(drive)}
                            className="p-1.5 rounded-lg bg-[#1E293B] hover:bg-[#F97316] text-slate-300 hover:text-white transition"
                            title="Inspect Slot Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredDrives.length} scheduled items for today</span>
            <button 
              onClick={() => onNavigateTab ? onNavigateTab('maintenance') : null}
              className="text-[#F97316] hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Report Generation Card (1 col) */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition duration-500"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Report Generation</h2>
                  <p className="text-[11px] text-slate-400">Comprehensive Operations Audit</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                PDF / CSV
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Generate an end-to-end report containing all scheduled maintenance drives, engineer diagnostic inputs, delays mitigated, and route equipment health scores.
            </p>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                <span>Includes 100% inspector diagnostic inputs</span>
              </div>
              <div className="flex items-center text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                <span>AI delay impact & speed restrictions log</span>
              </div>
              <div className="flex items-center text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                <span>Compliance ready for Northern Railway Audit</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full py-2.5 px-4 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#F97316]" />
            <span>Generate Maintenance Report</span>
          </button>
        </div>

      </div>

      {/* ROW 2: Bar Graph & AI Optimization Engine Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Maintenance Drives Successfully Scheduled (Bar Chart - 2 cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#F97316]" />
                <span>Monthly Maintenance Drives Successfully Scheduled</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Historical distribution of successful track & rolling stock drives
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-[#1E293B] text-xs text-slate-300 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F97316]"
              >
                <option value="2026">Year 2026</option>
                <option value="2025">Year 2025</option>
              </select>
              <span className="flex items-center text-xs text-slate-400 pl-2">
                <span 
                  className="w-2.5 h-2.5 rounded-sm mr-1.5"
                  style={{ backgroundColor: isDark ? '#F97316' : '#0D5C55' }}
                ></span> Completed Drives
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1E293B' : '#E2E8F0'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} />
                <YAxis stroke={isDark ? '#64748B' : '#94A3B8'} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                    borderColor: isDark ? '#334155' : '#E2E8F0', 
                    color: isDark ? '#FFFFFF' : '#0F172A',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                  cursor={{ fill: isDark ? 'rgba(249, 115, 22, 0.08)' : 'rgba(13, 92, 85, 0.08)' }}
                />
                <Bar dataKey="drives" fill={isDark ? '#F97316' : '#0D5C55'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2% completion rate vs previous quarter
            </span>
            <span className="text-slate-500 font-mono">Total {selectedYear}: {selectedYear === '2026' ? '487 Drives' : '393 Drives'}</span>
          </div>
        </div>

        {/* AI Optimization Engine Card (1 col) */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 flex flex-col justify-between border-l-4 border-l-[#F97316] relative">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-orange-500/10 text-[#F97316]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-[#F97316] uppercase">AI Scheduling Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                OPTIMIZED
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">Minimum Delay Slot Allocation</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Intelligent predictive scheduling aligns track work windows with commercial train gaps to minimize passenger train hold times.
            </p>

            {/* AI KPIs Grid */}
            <div className="space-y-2.5">
              <div className="bg-[#1E293B]/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Normal Train Delay Saved</div>
                  <div className="text-[10px] text-slate-500">Compared to manual slotting</div>
                </div>
                <div className="text-sm font-bold text-emerald-400 font-mono">-42 mins/day</div>
              </div>

              <div className="bg-[#1E293B]/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Schedule Optimization Score</div>
                  <div className="text-[10px] text-slate-500">Route congestion index</div>
                </div>
                <div className="text-sm font-bold text-white font-mono">98.4%</div>
              </div>

              <div className="bg-[#1E293B]/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Conflict Preventions</div>
                  <div className="text-[10px] text-slate-500">Automated signal reroutes</div>
                </div>
                <div className="text-sm font-bold text-amber-400 font-mono">14 this week</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#F97316]" /> Next Automated Re-Index: 04:18m
            </span>
            <span className="text-emerald-400 font-medium">COA Live Sync</span>
          </div>
        </div>

      </div>

      {/* Detail Inspection Modal */}
      {selectedInspectReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <div>
                <h3 className="text-base font-bold text-white">{selectedInspectReq.id} Details</h3>
                <p className="text-xs text-slate-400">{selectedInspectReq.maintenanceType}</p>
              </div>
              <button 
                onClick={() => setSelectedInspectReq(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-[#1E293B] rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-[#1E293B]/60 p-3 rounded-xl space-y-1.5 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-white font-mono">{selectedInspectReq.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Slot:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {selectedInspectReq.scheduledSlot?.timeWindow || selectedInspectReq.preferredWindow}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white">{selectedInspectReq.estimatedDurationMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Declared Priority:</span>
                  <span className="text-orange-400 font-semibold">{selectedInspectReq.declaredPriority}</span>
                </div>
              </div>

              {selectedInspectReq.aiExplanation && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-bold text-[#F97316] uppercase">AI Slotting Rationale</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedInspectReq.aiExplanation.timetableGaps || 'Fitted into clear passenger gap.'}
                  </p>
                  {selectedInspectReq.aiExplanation.bundlingBenefit && (
                    <p className="text-slate-400 text-[10px]">
                      Bundling: {selectedInspectReq.aiExplanation.bundlingBenefit}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedInspectReq(null)}
                className="px-4 py-2 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        requests={requests}
      />
    </div>
  );
};
