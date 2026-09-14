import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRequest } from '../../services/requests';
import { fetchTmsAssets } from '../../services/tms';
import { fetchTdmsAssets } from '../../services/tdms';
import { fetchSmmsAssets } from '../../services/smms';
import { computeMlUrgencyScore } from '../../services/schedulingEngine';
import { CORRIDORS, DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { TrdFieldBlock } from './TrdFieldBlock';
import { SntFieldBlock } from './SntFieldBlock';
import {
  CheckCircle2,
  Sparkles,
  Wrench,
  Info,
  Cpu,
  Activity,
  Clock
} from 'lucide-react';

export const SharedDepartmentRequestForm = () => {
  const { currentRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId');

  const deptKey = currentRole === 'ADMIN' ? 'ENG' : currentRole;
  const deptConfig = DEPARTMENTS[deptKey] || DEPARTMENTS.ENG;

  const [assets, setAssets] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    department: deptKey,
    corridor: 'NDLS-MTJ',
    location: deptConfig.defaultLocation || 'NDLS-NZM (UP Line)',
    trackLine: 'UP Line',
    assetId: '',
    assetName: '',
    sourceAssetHealth: 'Normal',
    maintenanceType: deptConfig.maintenanceTypes?.[0] || 'Routine Maintenance',
    description: '',
    estimatedDurationMinutes: 140,
    preferredWindow: 'Night Window (01:30 - 04:00)',
    earliestStartTime: '2026-09-08 01:00',
    latestAcceptableTime: '2026-09-08 05:00',
    deadline: '2026-09-12 18:00',
    declaredPriority: 'Critical', // Department-declared input signal
    isOverdue: false,
    // Field-block defaults
    speedRestrictionRequired: true,
    speedRestrictionValue: '30 km/h',
    machinesRequired: ['Duomatic Tamping Machine #09-32'],
    crewCount: 20,
    powerDisconnectionRequired: deptKey === 'TRD',
    safetyRestrictions: 'Lookout flags posted at safe braking distance.',
    // TRD fields
    oheMaintenanceType: 'Contact Wire & Catenary Replacement',
    equipmentInvolved: '8-Wheeler Tower Wagon #TW-409',
    electricalSafetyConstraints: 'Traction Power Controller (TPC) Permit-to-Work (PTW) required; Tuglakabad TSS feeder isolation.',
    requiredDuration: '140 minutes',
    // S&T fields
    signalTelecomAsset: 'Electric Point Machine 110V DC',
    operationalSafetyConstraints: 'Disconnection memo issued to Station Master; signals held at Danger.'
  });

  useEffect(() => {
    async function loadAssets() {
      let loadedAssets = [];
      if (deptKey === 'ENG') {
        loadedAssets = await fetchTmsAssets();
      } else if (deptKey === 'TRD') {
        loadedAssets = await fetchTdmsAssets();
      } else if (deptKey === 'SNT') {
        loadedAssets = await fetchSmmsAssets();
      }

      setAssets(loadedAssets);

      if (loadedAssets.length > 0) {
        const targetAsset = preselectedAssetId
          ? (loadedAssets.find(a => a.id === preselectedAssetId) || loadedAssets[0])
          : loadedAssets[0];

        setFormData(prev => ({
          ...prev,
          department: deptKey,
          assetId: targetAsset.id,
          assetName: targetAsset.name,
          sourceAssetHealth: targetAsset.healthStatus || 'Normal',
          isOverdue: !!targetAsset.isOverdue,
          location: `${targetAsset.name} (${targetAsset.trackLine || 'UP Line'})`,
          trackLine: targetAsset.trackLine || 'UP Line',
          description: targetAsset.defectDescription || prev.description
        }));
      }
    }
    loadAssets();
  }, [deptKey, preselectedAssetId]);

  const handleAssetChange = (assetId) => {
    const selected = assets.find(a => a.id === assetId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        assetId: selected.id,
        assetName: selected.name,
        sourceAssetHealth: selected.healthStatus || 'Normal',
        isOverdue: !!selected.isOverdue,
        location: `${selected.name} (${selected.trackLine || 'UP Line'})`,
        trackLine: selected.trackLine || 'UP Line',
        description: selected.defectDescription || prev.description
      }));
    }
  };

  // Live algorithmic score preview computed dynamically
  const liveMlScore = useMemo(() => {
    return computeMlUrgencyScore(formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createRequest({
        ...formData,
        department: deptKey,
        departmentName: deptConfig.name,
        sourceSystem: deptConfig.sourceSystem
      });
      navigate(`/${deptKey.toLowerCase()}/requests?id=${created.id}`);
    } catch (err) {
      console.error('Submission failed', err);
      alert('Error creating maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>New {deptConfig.name} Maintenance Block Requirement</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${deptConfig.badgeColor}`}>
              {deptConfig.sourceSystem} Connected
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit field requirements and physical constraints. The AI combinatorial engine will optimize slot allocation, evaluate cross-department bundling, and balance against train operations.
          </p>
        </div>
      </div>

      {/* Core Principle Notice */}
      <div className="p-4 bg-[#111827] border-l-4 border-orange-500 rounded-lg shadow-md flex items-start gap-3">
        <Cpu className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-slate-200">
            Autonomous AI Scheduling & Objective Prioritization
          </div>
          <p className="text-slate-400 leading-relaxed">
            Departments specify maintenance scope and constraints. Your declared priority acts as one input signal (weighted ~20%) alongside real-time {deptConfig.sourceSystem} defect severity, line tonnage (GMT), compliance deadlines, and passenger timetable occupancy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form Inputs */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Information & Asset Linking */}
          <Card>
            <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span>1. Basic Information & {deptConfig.sourceSystem} Asset Linking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Corridor / Section
                  </label>
                  <select
                    value={formData.corridor}
                    onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500 font-medium"
                  >
                    {CORRIDORS.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.distanceKm} Km — {c.tracks})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link to {deptConfig.sourceSystem} Asset Record
                  </label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500 font-mono"
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} [{a.healthStatus}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Physical Location (Km / Span / Station Yard)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Track Line
                  </label>
                  <select
                    value={formData.trackLine}
                    onChange={(e) => setFormData({ ...formData, trackLine: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
                  >
                    <option value="UP Line">UP Main Line (Delhi bound / Heritage Ascent)</option>
                    <option value="DN Line">DN Main Line (Mathura bound / Heritage Descent)</option>
                    <option value="3rd Line">3rd Dedicated Freight Line</option>
                    <option value="Cross-over 2">Station Cross-over Turnout 2</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Maintenance Activity Type
                  </label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
                  >
                    {(deptConfig.maintenanceTypes || []).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asset Health Diagnostic (from {deptConfig.sourceSystem})
                  </label>
                  <div className="flex items-center justify-between p-2 bg-[#0B0F17] rounded-md border border-[#1F2937]">
                    <span className="text-xs font-bold text-amber-400">{formData.sourceAssetHealth}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{deptConfig.sourceSystem} Live Diagnostic</span>
                  </div>
                </div>
              </div>

              <Textarea
                label="Work Scope & Field Justification"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Describe physical defect condition, inspection report findings..."
                required
              />
            </CardContent>
          </Card>

          {/* Section 2: Scheduling Parameters & Priority Input Signal */}
          <Card>
            <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>2. Scheduling Parameters & Priority Input Signal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Estimated Duration (Minutes)"
                  type="number"
                  value={formData.estimatedDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: Number(e.target.value) })}
                  min="30"
                  max="480"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={formData.preferredWindow}
                    onChange={(e) => setFormData({ ...formData, preferredWindow: e.target.value })}
                    className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
                  >
                    <option value="Night Window (01:30 - 04:00)">Night Window (01:30 - 04:00) [Optimal]</option>
                    <option value="Daytime Peak (08:00 - 11:00)">Daytime Peak (08:00 - 11:00) [High Conflict Risk]</option>
                    <option value="Afternoon Slack (12:30 - 15:00)">Afternoon Slack (12:30 - 15:00)</option>
                    <option value="Evening Shadow (22:30 - 01:00)">Evening Shadow (22:30 - 01:00)</option>
                  </select>
                </div>
                <Input
                  label="Compliance Deadline Date/Time"
                  type="text"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  helperText={`${deptConfig.sourceSystem} validity threshold`}
                  required
                />
              </div>

              {/* Department-Declared Priority (Input Signal Only) */}
              <div className="p-4 bg-[#0B0F17] border border-[#1F2937] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <span>Department-Declared Priority</span>
                    <span className="text-[10px] font-mono uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                      Input Signal (~20% Weight)
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  This declaration represents {deptConfig.name}'s field urgency appraisal. The AI scheduler evaluates this alongside source sensor health, line density, and corridor occupancy.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Critical', 'High', 'Normal', 'Low'].map((p) => {
                    const isSelected = formData.declaredPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, declaredPriority: p })}
                        className={`py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500 text-slate-900 font-bold shadow-lg shadow-orange-500/20'
                            : 'border-[#1F2937] bg-[#111827] text-slate-300 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        <span>{p}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Department-Specific Field Block (Config-Driven) */}
          {deptKey === 'TRD' && (
            <TrdFieldBlock formData={formData} setFormData={setFormData} />
          )}
          {deptKey === 'SNT' && (
            <SntFieldBlock formData={formData} setFormData={setFormData} />
          )}
          {deptKey === 'ENG' && (
            <Card>
              <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  <span>3. Engineering Department Specific Constraints</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0B0F17] p-3 rounded-md border border-[#1F2937]">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.speedRestrictionRequired}
                        onChange={(e) => setFormData({ ...formData, speedRestrictionRequired: e.target.checked })}
                        className="rounded text-orange-500 focus:ring-orange-500 bg-[#1F2937] border-[#374151]"
                      />
                      <span>Temporary Speed Restriction (TSR) Required</span>
                    </label>
                    {formData.speedRestrictionRequired && (
                      <input
                        type="text"
                        value={formData.speedRestrictionValue}
                        onChange={(e) => setFormData({ ...formData, speedRestrictionValue: e.target.value })}
                        className="mt-2 w-full bg-[#111827] text-slate-200 text-xs px-3 py-1.5 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
                        placeholder="e.g. 30 km/h for 24 hours"
                      />
                    )}
                  </div>

                  <div className="bg-[#0B0F17] p-3 rounded-md border border-[#1F2937]">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.powerDisconnectionRequired}
                        onChange={(e) => setFormData({ ...formData, powerDisconnectionRequired: e.target.checked })}
                        className="rounded text-orange-500 focus:ring-orange-500 bg-[#1F2937] border-[#374151]"
                      />
                      <span className="text-amber-300">25kV OHE Power Disconnection Required (TRD Joint Block)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Enables the optimizer to automatically bundle with TRD catenary isolation.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Maintenance Crew Count"
                    type="number"
                    value={formData.crewCount}
                    onChange={(e) => setFormData({ ...formData, crewCount: Number(e.target.value) })}
                    min="4"
                    max="80"
                  />
                  <Input
                    label="Track Safety & Flagging Restrictions"
                    value={formData.safetyRestrictions}
                    onChange={(e) => setFormData({ ...formData, safetyRestrictions: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(`/${deptKey.toLowerCase()}/dashboard`)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              type="submit"
              disabled={submitting}
              icon={Sparkles}
            >
              {submitting ? 'Submitting to AI Engine...' : 'Submit to AI Scheduling Engine'}
            </Button>
          </div>
        </form>

        {/* Right 1 Col: Live AI/ML Scoring Telemetry Card */}
        <div className="space-y-4">
          <Card className="border-orange-500/30 bg-[#111827] shadow-xl overflow-hidden sticky top-4">
            <CardHeader className="bg-gradient-to-r from-orange-500/10 via-transparent to-transparent border-b border-[#1F2937]">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>Live AI Priority Preview</span>
                </CardTitle>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Active Model v2.4
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {/* Score Meter */}
              <div className="text-center p-4 bg-[#0B0F17] rounded-lg border border-[#1F2937]">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                  Computed ML Urgency Index
                </span>
                <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 mt-1 font-mono">
                  {liveMlScore.score}
                  <span className="text-sm font-normal text-slate-500"> / 100</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border font-mono uppercase tracking-wider bg-orange-500/10 border-orange-500/30 text-orange-400">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>Tier: {liveMlScore.category}</span>
                </div>
              </div>

              {/* Drivers Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Model Factor Weighting
                </span>
                <div className="space-y-1.5">
                  {liveMlScore.drivers.map((d, i) => (
                    <div key={i} className="p-2 bg-[#0B0F17] rounded border border-[#1F2937] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 truncate max-w-[180px]">{d.name.split(':')[0]}</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">{d.points}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                        <span className="truncate">{d.name.split(':')[1] || d.weight}</span>
                        <span className="font-mono text-[9px] text-orange-400/80 uppercase">{d.weight}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plain Language Assurance */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  What happens next?
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Upon submission, the combinatorial solver compares your requested window with live passenger timetables, active freight corridors, and other departmental demands to generate an optimal conflict-free block slot.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
