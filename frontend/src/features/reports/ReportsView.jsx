import React, { useState, useEffect } from 'react';
import { getAllRequests } from '../../services/requests';
import { ReportModal } from '../../components/shared/ReportModal';
import { Download, Printer, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export const ReportsView = () => {
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getAllRequests();
      setRequests(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2633]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F97316]" />
            <span>Corridor Maintenance Audit & Optimization Reports</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Generate, preview, and download official PDF block allocation summaries, scheduled vs unaccommodated outcomes, and safety certifications.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] text-white hover:bg-[#EA580C] text-xs font-semibold shadow-glow-orange transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Generate Full PDF Report</span>
        </button>
      </div>

      {/* Available Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#064E3B]/40 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Daily Corridor Possession Summary</h4>
            <p className="text-xs text-rail-muted mt-1 leading-relaxed">
              Complete breakdown of all approved track blocks, co-located joint works, and train clearance windows.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-white text-xs font-semibold border border-[#1E2633] transition-colors"
          >
            Preview & Print PDF
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#431407]/40 border border-[#F97316]/30 flex items-center justify-center text-[#F97316]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cross-Department Bundling Audit</h4>
            <p className="text-xs text-rail-muted mt-1 leading-relaxed">
              Analysis of multi-department possessions (ENG + TRD + S&T) with net track possession hours saved.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-white text-xs font-semibold border border-[#1E2633] transition-colors"
          >
            Generate Bundling Report
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#111827] border border-[#1E2633] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#450A0A]/40 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Conflict & Appeals Registry</h4>
            <p className="text-xs text-rail-muted mt-1 leading-relaxed">
              Log of unaccommodated daytime requests, proposed alternative slots, and human review adjudications.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-white text-xs font-semibold border border-[#1E2633] transition-colors"
          >
            Export Appeals Log
          </button>
        </div>
      </div>

      {/* PDF Modal */}
      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requests={requests}
      />
    </div>
  );
};
