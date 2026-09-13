import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRequest } from '../../services/requests';
import { fetchTmsAssets } from '../../services/tms';
import { fetchTdmsAssets } from '../../services/tdms';
import { fetchSmmsAssets } from '../../services/smms';
import { CORRIDORS, DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TrdFieldBlock } from './TrdFieldBlock';
import { SntFieldBlock } from './SntFieldBlock';
import { CheckCircle2, Sparkles, Wrench, Info } from 'lucide-react';

export const SharedDepartmentRequestForm = () => {
  const { currentRole, currentDeptConfig } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId');

  const deptKey = currentRole === 'ADMIN' ? 'ENG' : currentRole;
  const deptConfig = DEPARTMENTS[deptKey] || DEPARTMENTS.ENG;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
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
          location: `${targetAsset.name} (${targetAsset.trackLine || 'UP Line'})`,
          trackLine: targetAsset.trackLine || 'UP Line',
          description: targetAsset.defectDescription || prev.description
        }));
      }
      setLoading(false);
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
        location: `${selected.name} (${selected.trackLine || 'UP Line'})`,
        trackLine: selected.trackLine || 'UP Line',
        description: selected.defectDescription || prev.description
      }));
    }
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <span>New {deptConfig.name} Maintenance Requirement</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border font-semibold ${deptConfig.badgeColor}`}>
              {deptConfig.sourceSystem} Connected
            </span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Submit physical maintenance parameters, site constraints, and preferred work windows. The AI engine will compute final schedule slots and evaluate cross-department bundling.
          </p>
        </div>
      </div>

      {/* Core Principle Notice */}
      <div className="p-3.5 bg-[#F2EDE2] border-l-4 border-rail-primary rounded-sm text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-rail-text">
          <Info className="w-4 h-4 text-rail-primary" />
          <span>Automated AI Prioritization & Conflict Optimization</span>
        </div>
        <p className="text-rail-muted leading-relaxed">
          Submission routes this requirement directly to the AI prioritization layer. Your declared priority serves as an <strong>input signal</strong> alongside asset health diagnostics, traffic density, and deadline proximity.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              1. Basic Information & {deptConfig.sourceSystem} Asset Linking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Corridor / Section
                </label>
                <select
                  value={formData.corridor}
                  onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                  className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-2 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
                >
                  {CORRIDORS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.distanceKm} Km)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Link to {deptConfig.sourceSystem} Asset Record
                </label>
                <select
                  value={formData.assetId}
                  onChange={(e) => handleAssetChange(e.target.value)}
                  className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-2 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary font-mono"
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
                label="Physical Location (Km / Span / Yard)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              <Select
                label="Track Line"
                value={formData.trackLine}
                onChange={(e) => setFormData({ ...formData, trackLine: e.target.value })}
                options={[
                  { value: 'UP Line', label: 'UP Main Line (Delhi bound)' },
                  { value: 'DN Line', label: 'DN Main Line (Mathura bound)' },
                  { value: '3rd Line', label: '3rd Freight Line' },
                  { value: 'Cross-over 2', label: 'Cross-over Turnout 2' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Maintenance Type
                </label>
                <select
                  value={formData.maintenanceType}
                  onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                  className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-2 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
                >
                  {(deptConfig.maintenanceTypes || []).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Asset Health (from {deptConfig.sourceSystem})
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#F2EDE2] rounded-sm border border-rail-border">
                  <span className="text-xs font-semibold text-rail-text">{formData.sourceAssetHealth}</span>
                  <span className="text-[10px] text-rail-muted font-mono ml-auto">{deptConfig.sourceSystem} Live Diagnostic</span>
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
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              2. Scheduling Parameters & Priority Input Signal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Select
                label="Preferred Time Window"
                value={formData.preferredWindow}
                onChange={(e) => setFormData({ ...formData, preferredWindow: e.target.value })}
                options={[
                  { value: 'Night Window (01:30 - 04:00)', label: 'Night Window (01:30 - 04:00) [Recommended]' },
                  { value: 'Daytime Peak (08:00 - 11:00)', label: 'Daytime Peak (08:00 - 11:00) [High Conflict Risk]' },
                  { value: 'Afternoon Slack (12:30 - 15:00)', label: 'Afternoon Slack (12:30 - 15:00)' },
                  { value: 'Evening Shadow (22:30 - 01:00)', label: 'Evening Shadow (22:30 - 01:00)' }
                ]}
              />
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
            <div className="p-3.5 bg-[#FAF7F0] border border-rail-border rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-rail-text flex items-center gap-1.5">
                  <span>Department-Declared Priority</span>
                  <span className="text-[10px] font-mono uppercase text-rail-muted bg-[#EAE3D4] px-1.5 py-0.2 rounded-sm border border-rail-border">
                    One Input Signal Only
                  </span>
                </label>
              </div>
              <p className="text-[11px] text-rail-muted mb-3">
                This declaration represents {deptConfig.name}'s field assessment. The final scheduling sequence is computed algorithmically by the ML prioritization layer by balancing track safety risk against network punctuality.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Critical', 'High', 'Normal', 'Low'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, declaredPriority: p })}
                    className={`py-2 px-3 rounded-sm border text-xs font-semibold flex items-center justify-between transition-colors ${
                      formData.declaredPriority === p
                        ? 'border-rail-primary bg-rail-primary text-white shadow-xs'
                        : 'border-rail-border bg-[#FCFAF5] text-rail-text hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <span>{p}</span>
                    {formData.declaredPriority === p && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
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
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-rail-primary" />
                <span>3. Engineering Department Specific Constraints</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-rail-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.speedRestrictionRequired}
                      onChange={(e) => setFormData({ ...formData, speedRestrictionRequired: e.target.checked })}
                      className="rounded-sm text-rail-primary focus:ring-rail-primary"
                    />
                    <span>Temporary Speed Restriction (TSR) Required</span>
                  </label>
                  {formData.speedRestrictionRequired && (
                    <input
                      type="text"
                      value={formData.speedRestrictionValue}
                      onChange={(e) => setFormData({ ...formData, speedRestrictionValue: e.target.value })}
                      className="mt-2 w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-1.5 rounded-sm border border-rail-border"
                      placeholder="e.g. 30 km/h for 24 hours"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-rail-text cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.powerDisconnectionRequired}
                      onChange={(e) => setFormData({ ...formData, powerDisconnectionRequired: e.target.checked })}
                      className="rounded-sm text-rail-primary focus:ring-rail-primary"
                    />
                    <span>25kV OHE Power Disconnection Required (TRD Joint Block)</span>
                  </label>
                  <p className="text-[11px] text-rail-muted mt-1">
                    Checking this informs the engine to bundle with TRD power isolation schedules.
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
    </div>
  );
};
