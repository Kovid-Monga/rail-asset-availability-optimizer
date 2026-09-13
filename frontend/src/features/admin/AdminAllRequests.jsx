import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { DEPARTMENTS, REQUEST_STAGES } from '../../constants/departments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { Search, Filter, Sparkles, Layers, SlidersHorizontal, Flame } from 'lucide-react';

export const AdminAllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.maintenanceType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || r.department === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-text tracking-tight flex items-center gap-2">
            <span>Network Maintenance Requirements Registry</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#2B2621] text-white rounded-sm font-semibold">
              Cross-Department Master View
            </span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Holistic visibility over Engineering, TRD, and S&T maintenance blocks, AI algorithmic prioritization, and corridor allocation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/human-review">
            <Button size="sm" variant="secondary" icon={Layers}>
              Human Review Queue
            </Button>
          </Link>
          <Link to="/admin/manual-override">
            <Button size="sm" variant="danger" icon={SlidersHorizontal}>
              Manual Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-rail-surface">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-rail-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across all departments by ID, asset name, corridor location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#FCFAF5] text-xs rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#FCFAF5] text-xs px-3 py-1.5 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
            >
              <option value="ALL">All Departments</option>
              <option value="ENG">Engineering (Civil/Track)</option>
              <option value="TRD">TRD (Traction / OHE)</option>
              <option value="SNT">S&T (Signal & Telecom)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FCFAF5] text-xs px-3 py-1.5 rounded-sm border border-rail-border focus:outline-none focus:border-rail-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value={REQUEST_STAGES.SCHEDULED}>Scheduled</option>
              <option value={REQUEST_STAGES.ALTERNATIVE_SUGGESTED}>Alternative Suggested</option>
              <option value={REQUEST_STAGES.HUMAN_REVIEW_REQUESTED}>Human Review Requested</option>
              <option value={REQUEST_STAGES.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cross-Department Requests Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Department & Source</TableHead>
            <TableHead>Asset & Section</TableHead>
            <TableHead>Maintenance Scope</TableHead>
            <TableHead>Input Signal</TableHead>
            <TableHead>ML Score</TableHead>
            <TableHead>Lifecycle Status</TableHead>
            <TableHead>Scheduled Window</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-rail-muted text-xs">
                No matching cross-department requests found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((req) => {
              const dept = DEPARTMENTS[req.department] || DEPARTMENTS.ENG;
              return (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-bold text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{req.id}</span>
                      {req.isOverdue && (
                        <span title="Overdue inspection cycle" className="text-rail-critical">
                          <Flame className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm border font-mono ${dept.badgeColor}`}>
                      {req.department} • {dept.sourceSystem}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-rail-text text-xs">{req.assetName}</div>
                    <div className="text-[10px] text-rail-muted">{req.location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-rail-text font-medium text-xs">{req.maintenanceType}</div>
                    {req.aiExplanation?.bundledDepartments && (
                      <div className="text-[10px] text-rail-primary font-mono flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Bundled: {req.aiExplanation.bundledDepartments.join(', ')}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <PriorityTag priority={req.declaredPriority} />
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-rail-primary">
                    {req.score ? `${req.score}/100` : '—'}
                  </TableCell>
                  <TableCell>
                    <RequestStatusBadge status={req.status} />
                  </TableCell>
                  <TableCell className="font-mono text-[11px]">
                    {req.scheduledSlot ? (
                      <div>
                        <span className="font-semibold text-rail-success block">{req.scheduledSlot.timeWindow}</span>
                        <span className="text-[10px] text-rail-muted">{req.scheduledSlot.date}</span>
                      </div>
                    ) : (
                      <span className="text-rail-muted">Unscheduled</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED && (
                        <Link to={`/admin/human-review?id=${req.id}`}>
                          <Button size="sm" variant="secondary">
                            Review
                          </Button>
                        </Link>
                      )}
                      <Link to={`/admin/manual-override?id=${req.id}`}>
                        <Button size="sm" variant="outline">
                          Override
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
