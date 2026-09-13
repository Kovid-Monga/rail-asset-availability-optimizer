import React from 'react';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Zap, ShieldCheck } from 'lucide-react';

export const TrdFieldBlock = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 p-4 bg-[#FAF6EE] border border-[#B5762E]/30 rounded-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-rail-border">
        <Zap className="w-4 h-4 text-rail-secondary" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-rail-secondary">
          TRD Department Specific Fields (25kV AC OHE Distribution)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-rail-text cursor-pointer">
            <input
              type="checkbox"
              checked={formData.powerDisconnectionRequired ?? true}
              onChange={(e) => setFormData({ ...formData, powerDisconnectionRequired: e.target.checked })}
              className="rounded-sm text-rail-secondary focus:ring-rail-secondary"
            />
            <span>25kV AC Power Isolation Required (PTW)</span>
          </label>
          <p className="text-[11px] text-rail-muted mt-1">
            Requires Traction Power Controller (TPC) Permit to Work.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-rail-text mb-1">
            OHE Electrical Maintenance Type
          </label>
          <select
            value={formData.oheMaintenanceType || 'Contact Wire & Catenary Replacement'}
            onChange={(e) => setFormData({ ...formData, oheMaintenanceType: e.target.value })}
            className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-1.5 rounded-sm border border-rail-border"
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
