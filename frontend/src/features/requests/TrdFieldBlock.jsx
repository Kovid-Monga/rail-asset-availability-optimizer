import React from 'react';
import { Input, Textarea } from '../../components/ui/Input';
import { Zap, ShieldCheck } from 'lucide-react';

export const TrdFieldBlock = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 p-5 bg-[#111827] border border-amber-500/30 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-[#1F2937]">
        <Zap className="w-4 h-4 text-amber-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          TRD Department Parameters (25kV AC OHE Traction Distribution)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0B0F17] p-3 rounded-md border border-[#1F2937]">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.powerDisconnectionRequired ?? true}
              onChange={(e) => setFormData({ ...formData, powerDisconnectionRequired: e.target.checked })}
              className="rounded text-amber-500 focus:ring-amber-500 bg-[#1F2937] border-[#374151]"
            />
            <span className="text-amber-300">25kV AC Power Isolation Required (PTW)</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-1">
            Requires Traction Power Controller (TPC) Permit-to-Work before track possession.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            OHE Electrical Maintenance Type
          </label>
          <select
            value={formData.oheMaintenanceType || 'Contact Wire & Catenary Replacement'}
            onChange={(e) => setFormData({ ...formData, oheMaintenanceType: e.target.value })}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500"
          >
            <option value="Contact Wire & Catenary Replacement">Contact Wire & Catenary Replacement</option>
            <option value="Dropper & Jumper Adjustment">Dropper & Jumper Adjustment</option>
            <option value="Bracket & Insulator Replacement">Bracket & Insulator Replacement</option>
            <option value="Tower Wagon Cantilever Overhaul">Tower Wagon Cantilever Overhaul</option>
            <option value="Traction Substation Feeder Test">Traction Substation Feeder Test</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Equipment & Rolling Stock Involved"
          value={formData.equipmentInvolved || '8-Wheeler Tower Wagon #TW-409, 4x Earthing Rods'}
          onChange={(e) => setFormData({ ...formData, equipmentInvolved: e.target.value })}
        />
        <Input
          label="Required Power Isolation Duration"
          value={formData.requiredDuration || '140 minutes'}
          onChange={(e) => setFormData({ ...formData, requiredDuration: e.target.value })}
        />
      </div>

      <Textarea
        label="Electrical Safety & Feeder Isolation Constraints"
        value={formData.electricalSafetyConstraints || 'Tuglakabad TSS Feeder 2 locked open; earthing discharge rods clamped at spans 12/2 and 14/0.'}
        onChange={(e) => setFormData({ ...formData, electricalSafetyConstraints: e.target.value })}
        rows={2}
      />
    </div>
  );
};
