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
      <div className="p-4 bg-rail-criticalLight border-2 border-rail-critical rounded-md flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-rail-critical shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-rail-critical uppercase tracking-wider flex items-center gap-2">
            <span>Critical Exception Path: Manual Schedule Override</span>
            <span className="text-[10px] font-mono bg-rail-critical text-white px-1.5 py-0.2 rounded-sm font-semibold">
              Restricted
            </span>
          </h2>
          <p className="text-xs text-rail-text mt-1 leading-relaxed">
            <strong>Warning:</strong> Manual intervention bypasses the AI combinatorial optimization engine and could create downstream passenger delays or cascade timetable conflicts. Use exclusively for safety crises, natural calamities, or VIP movement protocols.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-rail-successLight border border-rail-success/40 text-rail-success rounded-sm text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleExecuteOverride} className="space-y-6">
        {/* Step 1: Select Target Block */}
        <Card className="border-rail-border">
          <CardHeader className="bg-[#FAF7F0]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              1. Select Block Possession to Override
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rail-text mb-1">
                Target Maintenance Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleSelectRequest(e.target.value)}
                className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-2 rounded-sm border border-rail-border focus:outline-none focus:border-rail-critical font-mono"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — [{r.department}] {r.maintenanceType} ({r.assetName})
                  </option>
                ))}
              </select>
            </div>

            {selectedRequest && (
              <div className="p-3 bg-[#FAF7F0] border border-rail-border rounded-sm text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rail-text">{selectedRequest.assetName}</span>
                  <PriorityTag priority={selectedRequest.declaredPriority} />
                </div>
                <div className="text-[11px] text-rail-muted">
                  Location: {selectedRequest.location} • Current Status: {selectedRequest.status}
                </div>
                {selectedRequest.scheduledSlot && (
                  <div className="text-[11px] font-mono text-rail-primary mt-1">
                    Current Slot: {selectedRequest.scheduledSlot.timeWindow} ({selectedRequest.scheduledSlot.date})
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Override Parameters */}
        <Card className="border-rail-border">
          <CardHeader className="bg-[#FAF7F0]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              2. Forced Possession Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Forced Slot Date"
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                required
              />
              <Input
                label="Forced Time Window"
                value={overrideTimeWindow}
                onChange={(e) => setOverrideTimeWindow(e.target.value)}
                required
              />
              <Input
                label="Duration (Minutes)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Mandatory Justification & Audit Authorization */}
        <Card className="border-rail-critical/50 bg-[#FAF7F2]">
          <CardHeader className="bg-[#FAF0ED]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-critical flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>3. Mandatory Audit Trail & Authorization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Operational Justification (Mandatory for Safety Compliance)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              placeholder="State precise reason for manual override: e.g., Acute rail flaw at Turnout 108A carrying immediate derailment risk; emergency OHE catenary strand snapping..."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Authorizing Officer / Controller"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                required
              />
              <Input
                label="Security Authorization Code"
                value={authorizationCode}
                onChange={(e) => setAuthorizationCode(e.target.value)}
                placeholder="e.g. AUTH-NR-HQ-9902"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="bg-[#FAF2EE] flex justify-between items-center">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Abort Override
            </Button>
            <Button
              variant="danger"
              type="submit"
              disabled={submitting || !justification.trim() || !authorizationCode.trim()}
              icon={AlertTriangle}
            >
              {submitting ? 'Recording Audit & Enforcing...' : 'Execute Manual Override'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
