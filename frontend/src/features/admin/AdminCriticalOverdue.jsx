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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-rail-border">
        <div>
          <h2 className="text-lg font-bold text-rail-critical tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-rail-critical" />
            <span>Critical & Overdue Maintenance Triage Console</span>
          </h2>
          <p className="text-xs text-rail-muted mt-0.5">
            Real-time feed of safety-critical defects and overdue inspection cycles flagged by TMS, TDMS, and SMMS databases.
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

      {/* Critical Triage Cards */}
      <div className="space-y-4">
        {criticalItems.map((item, index) => (
          <Card key={index} className="border-rail-critical/40 bg-[#FAF7F2]">
            <CardHeader className="bg-[#FAF2EE]">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rail-text">{item.id}</span>
                  <Badge variant="critical">{item.healthStatus}</Badge>
                  <span className="text-xs font-bold text-rail-text">{item.name}</span>
                </div>
                <span className="text-xs font-bold font-mono text-rail-critical bg-rail-criticalLight px-2 py-0.5 rounded-sm border border-rail-critical/30">
                  OVERDUE: {item.overdueDate}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-rail-text leading-relaxed">
                {item.defectDescription}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rail-border/60 text-xs">
                <div className="flex items-center gap-2 text-[11px] text-rail-critical font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Safety Hazard: {item.riskLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/all-requests`}>
                    <Button size="sm" variant="outline">
                      Locate in Master Registry
                    </Button>
                  </Link>
                  <Link to={`/admin/manual-override?assetId=${item.id}`}>
                    <Button size="sm" variant="danger">
                      Force Emergency Block
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
