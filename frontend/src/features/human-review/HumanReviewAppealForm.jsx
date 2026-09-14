import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequestsByDepartment, submitHumanReviewAppeal } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { MessageSquareWarning, Upload, CheckCircle2, ShieldAlert, ArrowLeft, FileText } from 'lucide-react';

export const HumanReviewAppealForm = () => {
  const { currentRole } = useAuth();
  const deptKey = currentRole === 'ADMIN' ? 'ENG' : currentRole;

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestIdFromUrl = searchParams.get('id');

  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(requestIdFromUrl || '');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form State
  const [reasonCategory, setReasonCategory] = useState('Defect worse than source data captured');
  const [appealText, setAppealText] = useState('');
  const [attachedFile, setAttachedFile] = useState('USFD_Ultrasonic_Flaw_Measurement_Field_Report.pdf');
  const [officerName, setOfficerName] = useState('Er. A. K. Sharma (Sr. DEN / Civil)');

  useEffect(() => {
    async function load() {
      const data = await getRequestsByDepartment(deptKey);
      setRequests(data);
      if (requestIdFromUrl) {
        setSelectedRequestId(requestIdFromUrl);
        const match = data.find(r => r.id === requestIdFromUrl);
        if (match) setSelectedRequest(match);
      } else if (data.length > 0) {
        setSelectedRequestId(data[0].id);
        setSelectedRequest(data[0]);
      }
    }
    load();
  }, [deptKey, requestIdFromUrl]);

  const handleRequestSelect = (id) => {
    setSelectedRequestId(id);
    const match = requests.find(r => r.id === id);
    setSelectedRequest(match || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    setSubmitting(true);
    try {
      await submitHumanReviewAppeal(selectedRequestId, {
        reasonCategory,
        appealText,
        evidenceAttachment: attachedFile,
        submittedBy: officerName
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        navigate(`/${deptKey.toLowerCase()}/requests?id=${selectedRequestId}`);
      }, 1500);
    } catch (err) {
      alert('Error submitting human review appeal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-amber-400" />
            <span>Human Review Appeal Submission</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Escalate automated AI scheduling decisions to Central Operations Control when physical track conditions deviate from digital models.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Back
        </Button>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Appeal forwarded to Central Admin Review Queue. Status updated to Human Review Requested.</span>
        </div>
      )}

      {/* Principle Reminder Box */}
      <div className="p-4 bg-[#111827] border-l-4 border-amber-500 rounded-lg text-xs space-y-1">
        <span className="font-bold text-amber-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Administrative Review Grounds</span>
        </span>
        <p className="text-slate-400 leading-relaxed">
          The AI combinatorial engine schedules based on reported telemetry, train timetables, and corridor occupancy. Human review allows field engineers to submit physical evidence (USFD flaw charts, OHE thermal scans) not yet integrated in central databases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Maintenance Requirement to Appeal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Maintenance Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleRequestSelect(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500 font-mono"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.maintenanceType} ({r.assetName}) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            {selectedRequest && (
              <div className="p-4 bg-[#0B0F17] rounded-lg border border-[#1F2937] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{selectedRequest.assetName}</span>
                  <PriorityTag priority={selectedRequest.declaredPriority} />
                </div>
                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-2">
                  <span>Location: {selectedRequest.location}</span>
                  <span>Preferred: {selectedRequest.preferredWindow}</span>
                  <span>Duration: {selectedRequest.estimatedDurationMinutes}m</span>
                  <span>Current Status: {selectedRequest.status}</span>
                </div>
                {selectedRequest.conflictReason && (
                  <div className="text-[11px] text-red-400 mt-1 bg-red-500/10 p-2.5 rounded border border-red-500/20">
                    <strong>AI Conflict Engine Note: </strong> {selectedRequest.conflictReason}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Grounds for Appeal */}
        <Card className="border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Appeal Grounds & Field Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Reason Category
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500"
              >
                <option value="Defect worse than source data captured">Defect worse than source telemetry captured (Field ultrasonic defect detected)</option>
                <option value="Machinery breakdown / Track equipment relocation constraint">Machinery breakdown / Track equipment relocation constraint</option>
                <option value="Safety hazard / Immediate derailment risk discovered during ultrasonic testing">Safety hazard / Immediate derailment risk discovered during inspection</option>
                <option value="Urgent monsoon preparedness / drainage clearance">Urgent monsoon preparedness / drainage clearance</option>
                <option value="Contractor / Track maintenance machine crew mobilization deadline">Contractor / Track maintenance machine crew mobilization deadline</option>
              </select>
            </div>

            <Textarea
              label="Detailed Technical Justification"
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              rows={4}
              placeholder="Detail specific physical findings, USFD peak heights, rail temperature measurements, or operational reasons why the automated slot allocation is infeasible..."
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Attached Field Evidence / Measurement Report
              </label>
              <div className="flex items-center gap-3 p-3 bg-[#0B0F17] rounded-lg border border-[#1F2937]">
                <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{attachedFile}</div>
                  <div className="text-[10px] text-slate-500 font-mono">2.4 MB • Ultrasonic USFD Field Trace • Verified P-Way Lab</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => alert('Evidence file inspected: USFD trace confirms 14mm flaw depth.')}
                  icon={Upload}
                >
                  Change File
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Submitting Railway Officer
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-[#0B0F17] text-slate-200 text-xs px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-amber-500"
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
              variant="warning"
              type="submit"
              disabled={submitting}
              icon={MessageSquareWarning}
            >
              {submitting ? 'Transmitting Appeal...' : 'Submit Appeal to Central Control'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
