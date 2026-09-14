import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllRequests, manualOverrideBlock } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { SlidersHorizontal, AlertTriangle, ShieldAlert, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';

export const AdminManualOverride = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetIdFromUrl = searchParams.get('id');

  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(targetIdFromUrl || '');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State for Override
  const [overrideAction, setOverrideAction] = useState('RESCHEDULE_WINDOW');
  const [overrideDate, setOverrideDate] = useState('2026-09-08');
  const [overrideTimeWindow, setOverrideTimeWindow] = useState('02:00 - 04:30 (Direct Controller Slot)');
  const [durationMinutes, setDurationMinutes] = useState(150);
  const [justification, setJustification] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('AUTH-NR-HQ-9902');
  const [officerName, setOfficerName] = useState('R. K. Meena (Chief Operations Manager)');

  useEffect(() => {
    async function load() {
      const all = await getAllRequests();
      setRequests(all);
      if (targetIdFromUrl) {
        setSelectedRequestId(targetIdFromUrl);
        const match = all.find(r => r.id === targetIdFromUrl);
        if (match) {
          setSelectedRequest(match);
          if (match.scheduledSlot) {
            setOverrideDate(match.scheduledSlot.date || '2026-09-08');
            setOverrideTimeWindow(match.scheduledSlot.timeWindow || '01:30 - 04:00');
            setDurationMinutes(match.scheduledSlot.durationMinutes || 150);
          }
        }
      } else if (all.length > 0) {
        setSelectedRequestId(all[0].id);
        setSelectedRequest(all[0]);
      }
    }
    load();
  }, [targetIdFromUrl]);

  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    const match = requests.find(r => r.id === id);
    setSelectedRequest(match || null);
    if (match?.scheduledSlot) {
      setOverrideDate(match.scheduledSlot.date || '2026-09-08');
      setOverrideTimeWindow(match.scheduledSlot.timeWindow || '01:30 - 04:00');
      setDurationMinutes(match.scheduledSlot.durationMinutes || 150);
    }
  };

  const handleExecuteOverride = async (e) => {
    e.preventDefault();
    if (!selectedRequestId || !justification.trim() || !authorizationCode.trim()) {
      alert('Mandatory justification and authorization code required.');
      return;
    }
    setSubmitting(true);
    try {
      await manualOverrideBlock(selectedRequestId, {
        slotDate: overrideDate,
        timeWindow: overrideTimeWindow,
        durationMinutes: Number(durationMinutes),
        justification,
        authorizationCode,
        authorizedBy: officerName
      });
      setSuccessMessage(`MANUAL OVERRIDE EXECUTED: ${selectedRequestId} rescheduled to ${overrideTimeWindow}. Audit trail recorded.`);
      setTimeout(() => {
        navigate('/admin/all-requests');
      }, 2000);
    } catch (err) {
      alert('Error executing manual override.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* High Visibility Exception Path Warning Header */}
      <div className="p-4 bg-red-500/10 border-2 border-red-500/40 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <span>Critical Exception Path: Manual Schedule Override</span>
            <span className="text-[10px] font-mono bg-red-500 text-white px-2 py-0.5 rounded font-bold">
              Restricted
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            <strong>Warning:</strong> Manual intervention bypasses the AI combinatorial optimization engine and could create downstream passenger delays or cascade timetable conflicts. Use exclusively for safety crises, natural calamities, or VIP movement protocols.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-md text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleExecuteOverride} className="space-y-6">
        {/* Step 1: Select Target Block */}
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Block Possession to Override
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Maintenance Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleSelectRequest(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-red-500 font-mono"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — [{r.department}] {r.maintenanceType} ({r.assetName})
                  </option>
                ))}
              </select>
            </div>

            {selectedRequest && (
              <div className="p-4 bg-[#0B0F17] border border-[#1F2937] rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{selectedRequest.assetName}</span>
                  <PriorityTag priority={selectedRequest.declaredPriority} />
                </div>
                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2">
                  <span>Location: {selectedRequest.location}</span>
                  <span>Currently Scheduled: {selectedRequest.scheduledSlot?.timeWindow || 'Unscheduled'}</span>
                  <span>Duration: {selectedRequest.estimatedDurationMinutes}m</span>
                  <span>Current Status: {selectedRequest.status}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Override Parameters */}
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Override Parameters & Mandatory Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Overridden Date"
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                required
              />
              <Input
                label="Overridden Time Window"
                value={overrideTimeWindow}
                onChange={(e) => setOverrideTimeWindow(e.target.value)}
                placeholder="e.g. 02:00 - 04:30"
                required
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min="30"
                max="480"
                required
              />
            </div>

            <Textarea
              label="Mandatory Regulatory & Operational Justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              placeholder="State reasons why automated AI schedule is superseded (e.g., Track fracture emergency / Chief Commissioner of Railway Safety directive)..."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="HQ Authorization Token / Memo No."
                value={authorizationCode}
                onChange={(e) => setAuthorizationCode(e.target.value)}
                required
              />
              <Input
                label="Authorizing Operating Officer"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="bg-[#0B0F17]/80 border-t border-[#1F2937] flex items-center justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={submitting}
              icon={SlidersHorizontal}
            >
              {submitting ? 'Committing Override...' : 'Execute Manual Override & Record Audit Log'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
