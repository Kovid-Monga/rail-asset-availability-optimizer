import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getRequestsByDepartment, submitHumanReviewAppeal } from '../../services/requests';
import { REQUEST_STAGES } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { MessageSquareWarning, Upload, FileCheck, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

export const HumanReviewAppealForm = () => {
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
      const data = await getRequestsByDepartment('ENG');
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
  }, [requestIdFromUrl]);

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
        navigate(`/eng/requests?id=${selectedRequestId}`);
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
      <div className="flex items-center justify-between pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-rail-secondary" />
            <span>Human Review Appeal Submission</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Escalate automated AI scheduling decisions to Central Operations Control when field conditions deviate from digital models.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Back
        </Button>
      </div>

      {submittedSuccess && (
        <div className="p-4 bg-rail-successLight border border-rail-success/40 text-rail-success rounded-md text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Appeal forwarded successfully to Central Admin Review Queue. Status updated to Human Review Requested.</span>
        </div>
      )}

      {/* Principle Reminder Box */}
      <div className="p-3.5 bg-[#F4EFE6] border-l-4 border-rail-secondary rounded-sm text-xs space-y-1">
        <span className="font-bold text-rail-text flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rail-secondary" />
          <span>Administrative Review Grounds</span>
        </span>
        <p className="text-rail-muted leading-relaxed">
          The AI engine schedules based on reported TMS telemetry, passenger timetable, and corridor occupancy. Human review allows department officers to submit physical field evidence not yet reflected in source databases.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              1. Select Maintenance Requirement to Appeal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rail-text mb-1">
                Target Maintenance Request
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => handleRequestSelect(e.target.value)}
                className="w-full bg-[#FCFAF5] text-rail-text text-xs px-3 py-2 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary font-mono"
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.id} — {r.maintenanceType} ({r.assetName}) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            {selectedRequest && (
              <div className="p-3.5 bg-[#FAF7F0] rounded-sm border border-rail-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rail-text">{selectedRequest.assetName}</span>
                  <PriorityTag priority={selectedRequest.declaredPriority} />
                </div>
                <div className="text-[11px] text-rail-muted grid grid-cols-2 gap-2">
                  <span>Location: {selectedRequest.location}</span>
                  <span>Preferred: {selectedRequest.preferredWindow}</span>
                  <span>Duration: {selectedRequest.estimatedDurationMinutes}m</span>
                  <span>Current Status: {selectedRequest.status}</span>
                </div>
                {selectedRequest.conflictReason && (
                  <div className="text-[11px] text-rail-critical mt-1 bg-rail-criticalLight/30 p-2 rounded-sm">
                    <strong>AI Conflict Engine Note: </strong> {selectedRequest.conflictReason}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              2. Appeal Grounds & Physical Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* PRD Specified Categories */}
            <div>
              <label className="block text-xs font-semibold text-rail-text mb-1">
                Primary Reason for Appeal (PRD Specification)
              </label>
              <Select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value)}
                options={[
                  { value: 'Defect worse than source data captured', label: '1. Defect worse than source data captured' },
                  { value: 'Deadline more important than represented', label: '2. Deadline more important than represented' },
                  { value: 'New evidence', label: '3. New physical / ultrasonic track evidence' },
                  { value: 'Constraint not properly represented', label: '4. Physical constraint not properly represented' }
                ]}
              />
            </div>

            <Textarea
              label="Detailed Written Justification"
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              rows={4}
              placeholder="Detail why the automated decision requires administrative intervention. Specify track safety implications, sleeper fracture measurements, or why proposed alternative slots are unacceptable..."
              required
            />

            {/* Evidence attachment simulation */}
            <div>
              <label className="block text-xs font-semibold text-rail-text mb-1">
                Physical Evidence Attachment (PDF / Photo / USFD Log)
              </label>
              <div className="border border-dashed border-rail-borderDark rounded-sm p-4 bg-[#FAF7F0] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-rail-primary" />
                  <div>
                    <span className="text-xs font-bold text-rail-text block">{attachedFile}</span>
                    <span className="text-[10px] text-rail-muted">Attached from local terminal • 2.4 MB</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => alert('Simulated document upload: USFD flaw scan attached.')}
                >
                  <Upload className="w-3.5 h-3.5 mr-1" /> Re-upload
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Submitting Officer
                </label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-[#FCFAF5] text-xs px-3 py-1.5 rounded-sm border border-rail-border"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-rail-text mb-1">
                  Target Review Authority
                </label>
                <div className="p-2 bg-[#F2EDE2] rounded-sm border border-rail-border text-xs text-rail-text font-medium">
                  Central Operations Control (Admin Review Queue)
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={submitting || !appealText.trim()}
              icon={MessageSquareWarning}
            >
              {submitting ? 'Submitting Appeal...' : 'Submit Appeal to Admin Queue'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
