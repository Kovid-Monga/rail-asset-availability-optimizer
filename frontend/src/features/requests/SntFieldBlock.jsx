import React from 'react';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Radio, ShieldAlert } from 'lucide-react';

export const SntFieldBlock = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 p-4 bg-[#F2F6F9] border border-[#4A6B82]/30 rounded-sm">
      <div className="flex items-center gap-2 pb-2 border-b border-rail-border">
        <Radio className="w-4 h-4 text-[#4A6B82]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A6B82]">
          S&T Department Specific Fields (Signalling & Telecommunication)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-rail-text mb-1">
            Signalling / Telecom Asset Classification
          </label>
          <select
            value={formData.signalTelecomAsset || 'Electric Point Machine 110V DC'}
            onChange={(e) => setFormData({ ...formData, signalTelecomAsset: e.target.value })}
            className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-1.5 rounded-sm border border-rail-border"
          >
            <option value="Electric Point Machine 110V DC">Electric Point Machine 110V DC</option>
            <option value="Multi-Section Digital Axle Counter (MS-DAC)">Multi-Section Digital Axle Counter (MS-DAC)</option>
            <option value="Electronic Interlocking (EI) Microprocessor">Electronic Interlocking (EI) Microprocessor</option>
            <option value="LED Signal Unit & Aspect Lamp">LED Signal Unit & Aspect Lamp</option>
            <option value="Audio Frequency Track Circuit (AFTC)">Audio Frequency Track Circuit (AFTC)</option>
            <option value="Optical Fibre Communication Node">Optical Fibre Communication Node</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-rail-text mb-1">
            Equipment & Diagnostic Tools Involved
          </label>
          <input
            type="text"
            value={formData.equipmentInvolved || 'Point Megger, Friction Meter, Calibrated Throw Gauge'}
            onChange={(e) => setFormData({ ...formData, equipmentInvolved: e.target.value })}
            className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-1.5 rounded-sm border border-rail-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-rail-text cursor-pointer">
            <input
              type="checkbox"
              checked={formData.disconnectionNoticeRequired ?? true}
              onChange={(e) => setFormData({ ...formData, disconnectionNoticeRequired: e.target.checked })}
              className="rounded-sm text-[#4A6B82] focus:ring-[#4A6B82]"
            />
            <span>Formal Disconnection Memo to Station Master Required</span>
          </label>
          <p className="text-[11px] text-rail-muted mt-1">
            Signals held at Danger (Red Aspect); crank handle interlock locked out.
          </p>
        </div>

        <Input
          label="Required Signal Interlocking Disconnection Duration"
          value={formData.requiredDuration || '120 minutes'}
          onChange={(e) => setFormData({ ...formData, requiredDuration: e.target.value })}
        />
      </div>

      <Textarea
        label="Signalling Operational & Safety Constraints"
        value={formData.operationalSafetyConstraints || 'Disconnection memo issued to Station Master NZM; signals 21 & 23 clamped at Danger; emergency crank handle isolated.'}
        onChange={(e) => setFormData({ ...formData, operationalSafetyConstraints: e.target.value })}
        rows={2}
      />
    </div>
  );
};
