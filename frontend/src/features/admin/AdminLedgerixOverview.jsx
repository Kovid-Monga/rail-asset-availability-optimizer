import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Hammer, 
  Zap, 
  Radio, 
  Cpu, 
  Eye, 
  ArrowRight, 
  Users, 
  Train, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Activity, 
  Clock,
  X,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllRequests } from '../../services/requests';
import { mockPassengerTimetable } from '../../services/coa';
import { REQUEST_STAGES } from '../../constants/departments';

export const AdminLedgerixOverview = ({ onNavigateTab }) => {
  const { currentRole, setPreviewDept } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeChip, setActiveChip] = useState('ALL'); // 'ALL' | 'Auto-Scheduled' | 'Human Review' | 'Completed'
  const [selectedDeptModal, setSelectedDeptModal] = useState(null); // null | 'TMS' | 'TDMS' | 'SMS'
  const [featuredReq, setFeaturedReq] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllRequests();
        setRequests(data);
        if (data.length > 0) {
          setFeaturedReq(data[0]);
        }
      } catch (err) {
        console.error('Failed to load admin requests', err);
      }
    }
    load();
  }, []);

  // Filter requests based on status chip
  const filteredRequests = requests.filter(r => {
    if (activeChip === 'ALL') return true;
    if (activeChip === 'Auto-Scheduled') {
      return r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.ACCEPTED;
    }
    if (activeChip === 'Human Review') {
      return r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || 
             r.status === REQUEST_STAGES.ADMIN_REVIEW ||
             r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED;
    }
    if (activeChip === 'Completed') {
      return r.status === REQUEST_STAGES.COMPLETED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN;
    }
    return true;
  });

  const totalCount = requests.length;
  const autoScheduledCount = requests.filter(r => r.status === REQUEST_STAGES.SCHEDULED || r.status === REQUEST_STAGES.ACCEPTED).length;
  const humanReviewCount = requests.filter(r => r.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || r.status === REQUEST_STAGES.ADMIN_REVIEW || r.status === REQUEST_STAGES.CANNOT_BE_ACCOMMODATED).length;
  const completedCount = requests.filter(r => r.status === REQUEST_STAGES.COMPLETED || r.status === REQUEST_STAGES.APPROVED_OVERRIDDEN).length;

  const getDeptModalData = () => {
    if (!selectedDeptModal) return { title: '', deptKey: '', items: [] };
    const deptKey = selectedDeptModal === 'TMS' ? 'ENG' : selectedDeptModal === 'TDMS' ? 'TRD' : 'SNT';
    const deptName = selectedDeptModal === 'TMS' ? 'Engineering (TMS)' : selectedDeptModal === 'TDMS' ? 'Traction Distribution (TDMS)' : 'Signal & Telecom (S&MS)';
    const items = requests.filter(r => r.department === deptKey);
    return { title: deptName, deptKey, items };
  };

  const modalData = getDeptModalData();

  return (
    <div className="flex-1 flex flex-col xl:flex-row overflow-hidden w-full gap-6 animate-fade-in">

      {/* LEFT COLUMN: 3 Stacked Department Cards + AI Optimization Summary (340px) */}
      <aside className="w-full xl:w-80 2xl:w-96 flex flex-col justify-between shrink-0 space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Layers className="w-4 h-4 text-[#F97316] mr-2" /> Operational Departments
            </h2>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
              3 Active
            </span>
          </div>

          {/* CARD 1: Engineering (TMS) */}
          <div 
            onClick={() => setSelectedDeptModal('TMS')}
            className="bg-[#1E293B]/60 hover:bg-[#1E293B] rounded-2xl p-4 border border-slate-800 transition duration-200 space-y-3 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Hammer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">Engineering</h3>
                  <div className="text-[11px] text-slate-400 font-mono">TMS • Track Mgmt System</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                1 Dispute
              </span>
            </div>

            <div className="bg-[#0F172A]/80 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Dispute Work:</span>
                <span className="text-white font-medium">Overnight Ballast Tamping</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Status:</span>
                <span className="text-orange-400 font-semibold flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> Freight REQ Conflict
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-1">
              <span>Review Department Requests</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* CARD 2: Traction Distribution (TDMS) */}
          <div 
            onClick={() => setSelectedDeptModal('TDMS')}
            className="bg-[#1E293B]/60 hover:bg-[#1E293B] rounded-2xl p-4 border border-slate-800 transition duration-200 space-y-3 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">Traction Distribution</h3>
                  <div className="text-[11px] text-slate-400 font-mono">TDMS • Overhead OHE</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                1 Dispute
              </span>
            </div>

            <div className="bg-[#0F172A]/80 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Power Cut Req:</span>
                <span className="text-white font-medium">Barog Station Yard</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">AI Status:</span>
                <span className="text-amber-400 font-semibold flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Human Review
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold pt-1">
              <span>Review Department Requests</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* CARD 3: Signal & Telecom (S&MS) */}
          <div 
            onClick={() => setSelectedDeptModal('SMS')}
            className="bg-[#1E293B]/60 hover:bg-[#1E293B] rounded-2xl p-4 border border-slate-800 transition duration-200 space-y-3 group cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition"></div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition">Signal & Telecom</h3>
                  <div className="text-[11px] text-slate-400 font-mono">S&MS • Signaling Systems</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                1 Dispute
              </span>
            </div>

            <div className="bg-[#0F172A]/80 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Interlocking Check:</span>
                <span className="text-white font-medium">Tunnel No. 103 (Barog)</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">AI Status:</span>
                <span className="text-orange-400 font-semibold flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> Daylight Req
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-purple-400 font-semibold pt-1">
              <span>Review Department Requests</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* SUMMARY CARD: AI Delay & Optimization Metrics */}
        <div className="bg-gradient-to-br from-slate-900 to-[#0F172A] p-4 rounded-2xl border border-orange-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#F97316]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Optimization Summary</h3>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/20 text-[#F97316] border border-orange-500/30 font-mono">
              REAL-TIME
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#1E293B]/80 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Track Hours Saved</div>
              <div className="text-base font-black text-white font-mono mt-0.5">1,284 hrs</div>
            </div>
            <div className="bg-[#1E293B]/80 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Delay Reduction</div>
              <div className="text-base font-black text-emerald-400 font-mono mt-0.5">42 m/day</div>
            </div>
            <div className="bg-[#1E293B]/80 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Slot Efficiency</div>
              <div className="text-base font-black text-white font-mono mt-0.5">98.4%</div>
            </div>
            <div className="bg-[#1E293B]/80 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400">Multi-Dept Bundling</div>
              <div className="text-base font-black text-amber-400 font-mono mt-0.5">312 Blocks</div>
            </div>
          </div>
        </div>

      </aside>

      {/* CENTER SECTION: Status Chip Filters + Hero Featured Card + Request Log Table */}
      <section className="flex-1 overflow-y-auto space-y-6">

        {/* STATUS CHIPS FILTER BAR */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveChip('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
              activeChip === 'ALL'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>Total Requests:</span>
            <span className="bg-black/30 px-1.5 py-0.2 rounded font-mono text-[10px]">{totalCount}</span>
          </button>

          <button
            onClick={() => setActiveChip('Auto-Scheduled')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
              activeChip === 'Auto-Scheduled'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>Auto-Scheduled:</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono text-[10px]">
              {autoScheduledCount}
            </span>
          </button>

          <button
            onClick={() => setActiveChip('Human Review')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
              activeChip === 'Human Review'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>Human Review:</span>
            <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-mono text-[10px]">
              {humanReviewCount}
            </span>
          </button>

          <button
            onClick={() => setActiveChip('Completed')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1.5 shrink-0 transition cursor-pointer ${
              activeChip === 'Completed'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'bg-[#1E293B] text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>Completed:</span>
            <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono text-[10px]">
              {completedCount}
            </span>
          </button>
        </div>

        {/* LARGE FEATURED CARD (Hero Track Maintenance Image) */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group min-h-[220px] flex flex-col justify-end">
          <img
            src="/hero-train.jpg"
            alt="Track Maintenance"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
          
          <div className="relative p-6 space-y-3 z-10">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F97316] text-white uppercase tracking-wider">
                Active Slot Executing
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-emerald-400 border border-emerald-500/30 flex items-center font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                TRN 52491 Bundled Corridor
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Kalka - Shimla Mountain Rail Corridor Maintenance & Signaling Upgrade
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl line-clamp-2">
              Multi-Department integrated track block (Engineering TMS + S&MS Interlocking). Zero delay caused to commercial passenger operations through AI dynamic gap slotting.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center space-x-4 text-slate-300">
                <div><span className="text-slate-500">Duration:</span> <strong className="text-white">120 Mins</strong></div>
                <div><span className="text-slate-500">Location:</span> <strong className="text-white">Barog Tunnel Sec</strong></div>
                <div><span className="text-slate-500">Supervisor:</span> <strong className="text-white">Eng. A. Verma</strong></div>
              </div>

              <button 
                onClick={() => setSelectedDeptModal('TMS')}
                className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW DASHBOARD OPERATIONS RECENT FEED */}
        <div className="bg-[#0F172A] rounded-2xl border border-[#1E293B] p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center">
              <Activity className="w-4 h-4 text-[#F97316] mr-2" /> Department Slot Request Log
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Operations Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#1E293B]/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Req ID</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Task Description</th>
                  <th className="py-2.5 px-3">AI Allocated Slot</th>
                  <th className="py-2.5 px-3">Conflict Resolution</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRequests.map(req => {
                  const isDispute = req.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED || req.status === REQUEST_STAGES.ADMIN_REVIEW;
                  return (
                    <tr key={req.id} className="hover:bg-[#1E293B]/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {req.id}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          req.department === 'ENG' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : req.department === 'TRD'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {req.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium max-w-[200px] truncate">
                        {req.maintenanceType}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-emerald-400">
                        {req.scheduledSlot?.timeWindow || req.preferredWindow || 'Pending'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {req.aiExplanation?.timetableGaps?.substring(0, 45) || 'Passenger gap auto-aligned'}...
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isDispute 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDispute ? (
                          <button
                            onClick={() => onNavigateTab ? onNavigateTab('human-review') : null}
                            className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500 text-orange-400 hover:text-white rounded-lg text-[10px] font-bold transition"
                          >
                            Adjudicate
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedDeptModal(req.department === 'ENG' ? 'TMS' : req.department === 'TRD' ? 'TDMS' : 'SMS')}
                            className="p-1 rounded-lg bg-[#1E293B] hover:bg-[#F97316] text-slate-400 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* RIGHT SIDEBAR: Persona Switcher + Live Train Status + Energy Ring (320px) */}
      <aside className="w-full xl:w-80 2xl:w-88 flex flex-col justify-between shrink-0 space-y-4">
        
        {/* WIDGET 1: Select Portal Persona Widget (Department-Preview Switcher) */}
        <div className="bg-[#1E293B]/60 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Users className="w-4 h-4 text-[#F97316] mr-2" /> Portal Persona Switcher
            </h3>
            <span className="text-[9px] bg-orange-500/20 text-[#F97316] px-1.5 py-0.2 rounded font-mono border border-orange-500/30 font-bold">
              ADMIN COCKPIT
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Preview any department's actual RailSync dashboard shell using their real data:
          </p>

          <div className="space-y-1.5 text-xs">
            <button
              onClick={() => setPreviewDept(null)}
              className="w-full p-2.5 rounded-xl bg-[#F97316] text-white font-semibold text-left flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>Central Operations (ADMIN)</span>
              <CheckCircle2 className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => setPreviewDept('ENG')}
              className="w-full p-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-white text-left flex items-center justify-between border border-slate-800 transition cursor-pointer group"
            >
              <span>Engineering (TMS)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition" />
            </button>

            <button
              onClick={() => setPreviewDept('TRD')}
              className="w-full p-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-white text-left flex items-center justify-between border border-slate-800 transition cursor-pointer group"
            >
              <span>Traction Distribution (TDMS)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </button>

            <button
              onClick={() => setPreviewDept('SNT')}
              className="w-full p-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-white text-left flex items-center justify-between border border-slate-800 transition cursor-pointer group"
            >
              <span>Signal & Telecom (S&MS)</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition" />
            </button>
          </div>
        </div>

        {/* WIDGET 2: Live Train Status List */}
        <div className="bg-[#1E293B]/40 rounded-2xl p-4 border border-slate-800 space-y-3 flex-1 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Train className="w-4 h-4 text-emerald-400 mr-2" /> Live Train Telemetry
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span> Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {mockPassengerTimetable.slice(0, 3).map((train, idx) => (
              <div key={train.trainNumber} className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-[11px]">
                    TRN {train.trainNumber} <span className="text-slate-400 font-normal">({train.trainName})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {train.origin} &rarr; {train.destination} | {train.speedKmH} km/h
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  idx === 1 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {train.status}
                </span>
              </div>
            ))}
            <div className="p-2.5 rounded-xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-[11px]">
                  TRN 120 <span className="text-slate-400 font-normal">(Freight TRN 120)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Kalka Outer Siding</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20">
                Awaiting Slot
              </span>
            </div>
          </div>
        </div>

        {/* WIDGET 3: Corridor & Energy Efficiency Metric Ring */}
        <div className="bg-[#1E293B]/60 rounded-2xl p-4 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
              <Zap className="w-4 h-4 text-[#F97316] mr-2" /> Corridor Energy Score
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Today</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* SVG Circular Progress Ring */}
            <div className="w-20 h-20 relative shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#F97316]"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute font-black text-sm text-white font-mono">
                94%
              </div>
            </div>
            <div className="text-xs space-y-1">
              <div className="text-slate-300 font-semibold">Traction Power Optimized</div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Regulated speed limits during active maintenance blocks reduced peak power draw by 18%.
              </div>
            </div>
          </div>
        </div>

      </aside>

      {/* DEPARTMENT REQUESTS POPUP MODAL */}
      {selectedDeptModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F172A] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col justify-between">
            <button 
              onClick={() => setSelectedDeptModal(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{modalData.title} Requests</h3>
                  <p className="text-xs text-slate-400">Scheduled track blocks and AI conflict resolutions</p>
                </div>
              </div>

              <div className="space-y-3 text-xs overflow-y-auto max-h-[55vh] pr-1">
                {modalData.items.map(req => (
                  <div key={req.id} className="p-3.5 bg-[#1E293B]/70 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{req.id}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {req.status}
                      </span>
                    </div>
                    <div className="text-slate-300 font-medium">{req.maintenanceType}</div>
                    <div className="text-[11px] text-slate-400">Location: {req.location}</div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                      <span className="text-slate-500">Allocated Slot:</span>
                      <span className="text-emerald-400">{req.scheduledSlot?.timeWindow || req.preferredWindow}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center mt-4 text-xs">
              <span className="text-[11px] text-slate-500 font-mono">Ledgerix RAIL AI Dispatch Engine</span>
              <button 
                onClick={() => setSelectedDeptModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
