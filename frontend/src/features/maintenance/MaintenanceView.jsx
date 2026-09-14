import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SharedDepartmentRequestList } from '../requests/SharedDepartmentRequestList';
import { SharedDepartmentRequestForm } from '../requests/SharedDepartmentRequestForm';
import { HumanReviewAppealForm } from '../human-review/HumanReviewAppealForm';
import { AdminHumanReviewQueue } from '../admin/AdminHumanReviewQueue';
import { Wrench, Plus, ListOrdered, MessageSquareWarning, Layers } from 'lucide-react';

export const MaintenanceView = () => {
  const { currentRole, isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('LIST'); // 'LIST' | 'NEW' | 'APPEAL'

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E2633]">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#F97316]" />
            <span>Maintenance Block Hub & Registry</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Submit constraints, review algorithmic prioritization, track status timelines, or file human review appeals.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 p-1 bg-[#111827] border border-[#1E2633] rounded-lg">
          <button
            onClick={() => setActiveSubTab('LIST')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === 'LIST'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-rail-muted hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Requirements List</span>
          </button>
          <button
            onClick={() => setActiveSubTab('NEW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === 'NEW'
                ? 'bg-[#F97316] text-white font-semibold shadow-glow-orange'
                : 'text-rail-muted hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Requirement</span>
          </button>
          <button
            onClick={() => setActiveSubTab('APPEAL')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSubTab === 'APPEAL'
                ? 'bg-[#1E293B] text-white font-semibold'
                : 'text-rail-muted hover:text-white'
            }`}
          >
            <MessageSquareWarning className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Human Review Queue' : 'Appeal Decision'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'LIST' && (
        <SharedDepartmentRequestList />
      )}

      {activeSubTab === 'NEW' && (
        <SharedDepartmentRequestForm />
      )}

      {activeSubTab === 'APPEAL' && (
        isAdmin ? <AdminHumanReviewQueue /> : <HumanReviewAppealForm />
      )}
    </div>
  );
};
