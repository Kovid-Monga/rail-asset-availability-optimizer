import React from 'react';
import { Input, Textarea } from '../../components/ui/Input';
import { Radio, ShieldAlert } from 'lucide-react';

export const SntFieldBlock = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 p-5 bg-[#111827] border border-cyan-500/30 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-[#1F2937]">
        <Radio className="w-4 h-4 text-cyan-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          S&T Department Parameters (Signalling & Telecommunications)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Signalling / Telecom Asset Classification
          </label>
          <select
            value={formData.signalTelecomAsset || 'Electric Point Machine 110V DC'}
            onChange={(e) => setFormData({ ...formData, signalTelecomAsset: e.target.value })}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-cyan-500"
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
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Equipment & Diagnostic Tools Involved
          </label>
          <input
            type="text"
            value={formData.equipmentInvolved || 'Point Megger, Friction Meter, Calibrated Throw Gauge'}
            onChange={(e) => setFormData({ ...formData, equipmentInvolved: e.target.value })}
            className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#0B0F17] p-3 rounded-md border border-[#1F2937]">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.disconnectionNoticeRequired ?? true}
              onChange={(e) => setFormData({ ...formData, disconnectionNoticeRequired: e.target.checked })}
              className="rounded text-cyan-500 focus:ring-cyan-500 bg-[#1F2937] border-[#374151]"
            />
            <span className="text-cyan-300">Formal Disconnection Memo to Station Master Required</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-1">
            Signals held at Danger (Red aspect); crank handle interlock locked out for maintenance.
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
