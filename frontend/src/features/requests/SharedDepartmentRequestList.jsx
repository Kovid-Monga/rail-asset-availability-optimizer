import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getRequestsByDepartment } from '../../services/requests';
import { REQUEST_STAGES, DEPARTMENTS } from '../../constants/departments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { StatusTimeline } from './StatusTimeline';
import { Search, Filter, PlusCircle, Sparkles, Flame } from 'lucide-react';

export const SharedDepartmentRequestList = () => {
  const { currentRole } = useAuth();
  const deptKey = currentRole === 'ADMIN' ? 'ENG' : currentRole;
  const deptConfig = DEPARTMENTS[deptKey] || DEPARTMENTS.ENG;

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedIdFromUrl = searchParams.get('id');

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeRequestForModal, setActiveRequestForModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getRequestsByDepartment(deptKey);
      setRequests(data);
      if (selectedIdFromUrl) {
        const match = data.find(r => r.id === selectedIdFromUrl);
        if (match) setActiveRequestForModal(match);
      }
      setLoading(false);
    }
    load();
  }, [deptKey, selectedIdFromUrl]);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.maintenanceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (req) => {
    setActiveRequestForModal(req);
    setSearchParams({ id: req.id });
  };

  const handleCloseDetail = () => {
    setActiveRequestForModal(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <span>{deptConfig.name} Maintenance Requirements & Block Registry</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-sm border font-semibold ${deptConfig.badgeColor}`}>
              {requests.length} Records
            </span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Full lifecycle tracking: Submitted requirements ➔ AI Priority Scoring ➔ Timetable Optimization ➔ Possession Schedule
          </p>
        </div>
        <Link to={`/${deptKey.toLowerCase()}/new-request`}>
          <Button variant="default" icon={PlusCircle}>
            New Maintenance Request
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-rail-surface">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-rail-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search by Request ID (e.g. ${deptConfig.prefix}-2026-...), asset name, location...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#FCFAF5] text-xs rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-rail-muted shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FCFAF5] text-xs px-3 py-1.5 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
            >
              <option value="ALL">All Lifecycle Stages</option>
              <option value={REQUEST_STAGES.SCHEDULED}>Scheduled</option>
              <option value={REQUEST_STAGES.ALTERNATIVE_SUGGESTED}>Alternative Suggested</option>
              <option value={REQUEST_STAGES.HUMAN_REVIEW_REQUESTED}>Human Review Requested</option>
              <option value={REQUEST_STAGES.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Asset & Location</TableHead>
            <TableHead>Maintenance Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Input Priority</TableHead>
            <TableHead>Status Lifecycle</TableHead>
            <TableHead>AI Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-rail-muted text-xs">
                No matching maintenance requirements found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((req) => (
              <TableRow
                key={req.id}
                isClickable
                onClick={() => handleOpenDetail(req)}
              >
                <TableCell className="font-mono font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{req.id}</span>
                    {req.isOverdue && (
                      <span title="Overdue inspection" className="text-rail-critical">
                        <Flame className="w-3.5 h-3.5 inline" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-rail-text">{req.assetName}</div>
                  <div className="text-[10px] text-rail-muted">{req.location}</div>
                </TableCell>
                <TableCell>
                  <div className="text-rail-text font-medium">{req.maintenanceType}</div>
                  {req.aiExplanation?.bundledDepartments && (
                    <div className="text-[10px] text-rail-primary font-mono flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Joint: {req.aiExplanation.bundledDepartments.join(', ')}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-rail-text">
                  {req.estimatedDurationMinutes}m
                </TableCell>
                <TableCell>
                  <PriorityTag priority={req.declaredPriority} />
                </TableCell>
                <TableCell>
                  <RequestStatusBadge status={req.status} />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {req.score ? (
                    <span className="font-bold text-rail-primary">{req.score}</span>
                  ) : (
                    <span className="text-rail-muted">Queued</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {req.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED && (
                      <Link to={`/${deptKey.toLowerCase()}/scheduled-work`}>
                        <Button size="sm" variant="warning">
                          Alternatives
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDetail(req)}
                    >
                      Lifecycle
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal / Drawer for Request Detail & Lifecycle Status Timeline */}
      {activeRequestForModal && (
        <Modal
          isOpen={!!activeRequestForModal}
          onClose={handleCloseDetail}
          title={`Maintenance Block Lifecycle: ${activeRequestForModal.id}`}
          description={`${activeRequestForModal.maintenanceType} • ${activeRequestForModal.assetName}`}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-mono text-rail-muted">
                Source System: {activeRequestForModal.sourceSystem} • Logged at: {activeRequestForModal.statusHistory?.[0]?.timestamp}
              </span>
              <div className="flex items-center gap-2">
                {activeRequestForModal.status === REQUEST_STAGES.ALTERNATIVE_SUGGESTED && (
                  <Link to={`/${deptKey.toLowerCase()}/scheduled-work`}>
                    <Button size="sm" variant="warning">
                      Handle Suggested Alternatives
                    </Button>
                  </Link>
                )}
                {activeRequestForModal.status !== REQUEST_STAGES.HUMAN_REVIEW_REQUESTED && (
                  <Link to={`/${deptKey.toLowerCase()}/human-review?id=${activeRequestForModal.id}`}>
                    <Button size="sm" variant="outline">
                      File Human Review Appeal
                    </Button>
                  </Link>
                )}
                <Button size="sm" variant="default" onClick={handleCloseDetail}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="p-4 bg-rail-surface border border-rail-border rounded-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rail-muted mb-4">
                Lifecycle Progression
              </h4>
              <StatusTimeline request={activeRequestForModal} />
            </div>

            {activeRequestForModal.aiExplanation && (
              <div className="p-4 bg-[#F2EDE2] border border-rail-border rounded-md space-y-2.5">
                <h4 className="text-xs font-bold text-rail-text uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rail-primary" />
                  <span>AI Decision & Plain-Language Explanation</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-rail-text block">Priority Drivers:</span>
                    <ul className="text-[11px] text-rail-muted list-disc list-inside mt-1 space-y-0.5">
                      {activeRequestForModal.aiExplanation.priorityDrivers?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-rail-text block">Timetable & Capacity Margin:</span>
                    <p className="text-[11px] text-rail-muted mt-1 leading-relaxed">
                      {activeRequestForModal.aiExplanation.timetableGaps}
                    </p>
                  </div>
                </div>
                {activeRequestForModal.aiExplanation.bundlingBenefit && (
                  <div className="mt-2 p-2 bg-[#FAF7ED] border border-rail-secondary/30 rounded-sm text-[11px] text-rail-text">
                    <strong className="text-rail-secondary font-semibold">Cross-Department Bundling Gain: </strong>
                    {activeRequestForModal.aiExplanation.bundlingBenefit}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
