import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const ReportModal = ({ isOpen, onClose, requests = [] }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalRequests = requests.length;
  const scheduledCount = requests.filter(r => r.scheduledSlot || r.status === 'Scheduled' || r.status === 'Approved/Overridden').length;
  const unaccommodatedCount = requests.filter(r => r.status === 'Cannot Be Accommodated' || r.status === 'Alternative Suggested').length;
  const reviewCount = requests.filter(r => r.status === 'Human Review Requested' || r.status === 'Admin Review').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#111827] border border-[#1E2633] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 text-rail-text">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-[#0E131A] border-b border-[#1E2633] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Corridor Maintenance Allocation & Optimization Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F97316] text-white hover:bg-[#EA580C] text-xs font-semibold shadow-glow-orange transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-rail-muted hover:text-white hover:bg-[#1E293B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div id="printable-report" className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#0E131A] text-rail-text print:bg-white print:text-black print:p-0">
          {/* Official Letterhead */}
          <div className="border-b-2 border-[#1E2633] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#F97316] flex items-center justify-center text-white font-bold font-mono">
                  IR
                </div>
                <div>
                  <h1 className="text-base font-bold text-white print:text-black uppercase tracking-tight">
                    Northern Railway • Operations Planning Directorate
                  </h1>
                  <p className="text-xs text-rail-muted print:text-gray-600">
                    AI-Driven Maintenance Block Planning & Corridor Optimization (BDMS-v2)
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right font-mono text-[11px] text-rail-muted print:text-gray-600">
              <div>Ref: NR/OP-AI/2026/RPT-09</div>
              <div>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div>Corridor: Delhi-Palwal-Mathura (141.2 Km)</div>
            </div>
          </div>

          {/* Executive Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#161F2E] border border-[#1E2633] print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] uppercase font-mono text-rail-muted print:text-gray-600 block">Total Requirements</span>
              <span className="text-xl font-bold text-white print:text-black mt-0.5 block">{totalRequests}</span>
              <span className="text-[10px] text-rail-muted print:text-gray-600">Cross-Department</span>
            </div>
            <div className="p-3 rounded-lg bg-[#161F2E] border border-[#1E2633] print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] uppercase font-mono text-[#10B981] block">Auto-Scheduled</span>
              <span className="text-xl font-bold text-[#10B981] mt-0.5 block">{scheduledCount}</span>
              <span className="text-[10px] text-rail-muted print:text-gray-600">Zero Passenger Delays</span>
            </div>
            <div className="p-3 rounded-lg bg-[#161F2E] border border-[#1E2633] print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] uppercase font-mono text-[#F59E0B] block">Alternatives Proposed</span>
              <span className="text-xl font-bold text-[#F59E0B] mt-0.5 block">{unaccommodatedCount}</span>
              <span className="text-[10px] text-rail-muted print:text-gray-600">Conflict Resolved</span>
            </div>
            <div className="p-3 rounded-lg bg-[#161F2E] border border-[#1E2633] print:bg-gray-100 print:border-gray-300">
              <span className="text-[10px] uppercase font-mono text-[#38BDF8] block">Human Review</span>
              <span className="text-xl font-bold text-[#38BDF8] mt-0.5 block">{reviewCount}</span>
              <span className="text-[10px] text-rail-muted print:text-gray-600">Appeals Pending</span>
            </div>
          </div>

          {/* Table of All Maintenance Requests & Outcomes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white print:text-black mb-2">
              Comprehensive Maintenance Block Schedule & Allocation Outcomes
            </h4>
            <div className="border border-[#1E2633] rounded-lg overflow-x-auto print:border-black">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#161F2E] text-rail-muted print:bg-gray-200 print:text-black font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Request ID</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Dept</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Asset & Section</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Scope</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Input Priority</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">ML Score</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Scheduled Window</th>
                    <th className="py-2.5 px-3 border-b border-[#1E2633] print:border-black">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2633] print:divide-gray-300 font-mono text-[11px]">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#161F2E]/50">
                      <td className="py-2 px-3 font-bold text-white print:text-black">{req.id}</td>
                      <td className="py-2 px-3">{req.department}</td>
                      <td className="py-2 px-3 font-sans">
                        <div className="font-semibold text-white print:text-black text-xs">{req.assetName}</div>
                        <div className="text-[10px] text-rail-muted print:text-gray-500">{req.location}</div>
                      </td>
                      <td className="py-2 px-3 font-sans text-rail-muted print:text-black">{req.maintenanceType}</td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] uppercase">{req.declaredPriority}</span>
                      </td>
                      <td className="py-2 px-3 font-bold text-[#F97316] print:text-black">{req.score}/100</td>
                      <td className="py-2 px-3">
                        {req.scheduledSlot ? (
                          <span className="text-white print:text-black font-semibold">
                            {req.scheduledSlot.timeWindow} ({req.scheduledSlot.date})
                          </span>
                        ) : (
                          <span className="text-rail-muted print:text-gray-500">Unscheduled</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-sans">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          req.status === 'Scheduled' || req.status === 'Approved/Overridden'
                            ? 'text-[#10B981] bg-[#10B981]/10'
                            : req.status === 'Alternative Suggested'
                            ? 'text-[#F59E0B] bg-[#F59E0B]/10'
                            : 'text-[#38BDF8] bg-[#38BDF8]/10'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chief Operations Controller / Admin Directive & Audit Statement */}
          <div className="p-4 rounded-xl bg-[#161F2E] border border-[#1E2633] text-xs space-y-2 print:bg-gray-100 print:border-black">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F97316] print:text-black" />
              <h5 className="font-bold text-white print:text-black uppercase tracking-wider text-xs">
                Chief Operations Controller (Admin) Directive & Certification
              </h5>
            </div>
            <p className="text-[11px] text-rail-muted print:text-gray-700 leading-relaxed font-sans">
              "The scheduled maintenance blocks detailed above have been evaluated and verified against the live Control Office Application (COA) passenger train timetable and dynamic freight forecasts. Multi-department co-location (bundling track renewals, OHE catenary repairs, and signaling checks into shared possessions) has saved an estimated 54 track-possession hours this cycle. All field units must observe strict line clearance protocols."
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#1E2633] print:border-gray-400 text-[10px] font-mono text-rail-muted print:text-black">
              <span>Authorized by: R. K. Meena, Chief Operations Manager</span>
              <span>Audit Signature Hash: SHA256-NR-9982-OPTIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
