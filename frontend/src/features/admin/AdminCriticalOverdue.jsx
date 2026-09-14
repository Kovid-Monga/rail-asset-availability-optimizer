import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRequests } from '../../services/requests';
import { fetchTmsAssets } from '../../services/tms';
import { fetchTdmsAssets } from '../../services/tdms';
import { fetchSmmsAssets } from '../../services/smms';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Flame, ShieldAlert, AlertTriangle, ArrowRight, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export const AdminCriticalOverdue = () => {
  const [criticalItems, setCriticalItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [tms, tdms, smms, reqs] = await Promise.all([
        fetchTmsAssets(),
        fetchTdmsAssets(),
        fetchSmmsAssets(),
        getAllRequests()
      ]);

      const list = [
        ...tms.filter(a => a.isOverdue || a.healthStatus === 'Critical').map(a => ({
          id: a.id,
          name: a.name,
          department: 'Engineering (TMS)',
          deptCode: 'ENG',
          healthStatus: a.healthStatus,
          defectDescription: a.defectDescription,
          overdueDate: a.overdueDate || 'Immediate',
          riskLevel: 'Derailment Risk / Speed Restriction'
        })),
        ...tdms.filter(a => a.isOverdue || a.healthStatus === 'Worn Wire').map(a => ({
          id: a.id,
          name: a.name,
          department: 'TRD (TDMS)',
          deptCode: 'TRD',
          healthStatus: a.healthStatus,
          defectDescription: a.defectDescription,
          overdueDate: a.overdueDate || 'Immediate',
          riskLevel: 'Pantograph Entanglement / OHE Snapping'
        })),
        ...smms.filter(a => a.isOverdue || a.healthStatus === 'High Friction').map(a => ({
          id: a.id,
          name: a.name,
          department: 'S&T (SMMS)',
          deptCode: 'SNT',
          healthStatus: a.healthStatus,
          defectDescription: a.defectDescription,
          overdueDate: a.overdueDate || 'Immediate',
          riskLevel: 'Point Detection Failure / Red Aspect Lock'
        }))
      ];

      setCriticalItems(list);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#1F2937]">
        <div>
          <h2 className="text-lg font-bold text-red-400 tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-400" />
            <span>Overdue Inspections & Critical Safety Deficiencies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed aggregating overdue maintenance across TMS, TDMS, and SMMS databases requiring immediate corridor intervention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/manual-override">
            <Button size="sm" variant="danger" icon={SlidersHorizontal}>
              Emergency Override
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Overdue Cards */}
      <div className="grid grid-cols-1 gap-4">
        {criticalItems.map((item) => (
          <Card key={item.id} className="border-red-500/40 bg-[#111827]">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-red-400">{item.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.deptCode === 'ENG'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.deptCode === 'TRD'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {item.department}
                    </span>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                      Status: {item.healthStatus}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-100">{item.name}</div>
                  <p className="text-xs text-slate-400">{item.defectDescription}</p>

                  <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Consequence: {item.riskLevel}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-red-400 bg-[#0B0F17] px-2.5 py-1 rounded border border-[#1F2937]">
                    Overdue: {item.overdueDate}
                  </span>
                  <Link to={`/${item.deptCode.toLowerCase()}/new-request?assetId=${item.id}`}>
                    <Button size="sm" variant="default" icon={ArrowRight}>
                      Create Priority Block
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
