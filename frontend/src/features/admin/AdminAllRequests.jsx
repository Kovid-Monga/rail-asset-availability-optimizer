import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { DEPARTMENTS, REQUEST_STAGES } from '../../constants/departments';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { PriorityTag } from '../../components/shared/PriorityTag';
import { RequestStatusBadge } from '../../components/shared/RequestStatusBadge';
import { Search, Filter, Sparkles, Layers, SlidersHorizontal, Flame, Calendar } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Network Maintenance Requirements Master Registry</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded font-semibold">
              Cross-Department View ({requests.length} Items)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
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

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-[#111827] border-[#1F2937]">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across all departments by ID, asset name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0B0F17] text-xs text-slate-200 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500 placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-[#0B0F17] text-xs text-slate-200 px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Departments</option>
              <option value="ENG">Engineering (TMS)</option>
              <option value="TRD">TRD (TDMS)</option>
              <option value="SNT">S&T (SMMS)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0B0F17] text-xs text-slate-200 px-3 py-2 rounded-md border border-[#1F2937] focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Stages</option>
              <option value={REQUEST_STAGES.SCHEDULED}>Scheduled</option>
              <option value={REQUEST_STAGES.ALTERNATIVE_SUGGESTED}>Alternative Suggested</option>
              <option value={REQUEST_STAGES.HUMAN_REVIEW_REQUESTED}>Human Review</option>
              <option value={REQUEST_STAGES.APPROVED_OVERRIDDEN}>Overridden</option>
              <option value={REQUEST_STAGES.COMPLETED}>Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Cross-Department Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request ID</TableHead>
            <TableHead>Dept</TableHead>
            <TableHead>Asset & Location</TableHead>
            <TableHead>Work Scope</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI Score</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-slate-500 text-xs">
                No matching maintenance requirements found.
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-mono font-bold text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-orange-400">{req.id}</span>
                    {req.isOverdue && (
                      <span title="Overdue inspection" className="text-red-400">
                        <Flame className="w-3.5 h-3.5 inline" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      req.department === 'ENG'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : req.department === 'TRD'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }`}
                  >
                    {req.department}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-slate-200">{req.assetName}</div>
                  <div className="text-[10px] text-slate-400">{req.location}</div>
                </TableCell>
                <TableCell>
                  <div className="text-slate-200 font-medium">{req.maintenanceType}</div>
                  {req.aiExplanation?.bundledDepartments && (
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Joint: {req.aiExplanation.bundledDepartments.join(', ')}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-300">
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
                    <span className="font-bold text-orange-400">{req.score}</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {req.status === REQUEST_STAGES.HUMAN_REVIEW_REQUESTED && (
                      <Link to={`/admin/human-review?id=${req.id}`}>
                        <Button size="sm" variant="warning">
                          Review Appeal
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
