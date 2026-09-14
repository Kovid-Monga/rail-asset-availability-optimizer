import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Train, ShieldCheck, Wrench, Zap, Radio, Lock, ArrowRight, Activity } from 'lucide-react';

export const LoginPage = () => {
  const { currentRole, switchRole, availableRoles } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleLogin = () => {
    switchRole(selectedRole);
    navigate(`/${selectedRole.toLowerCase()}/overview`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ENG': return <Wrench className="w-5 h-5 text-emerald-400" />;
      case 'TRD': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'SNT': return <Radio className="w-5 h-5 text-cyan-400" />;
      case 'ADMIN': return <ShieldCheck className="w-5 h-5 text-orange-400" />;
      default: return <Train className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-orange-500/20">
            <Train className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">
            Railway Maintenance Block Console
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Autonomous AI Multi-Department Corridor Scheduling • Operations Control
          </p>
        </div>

        {/* Portal selection card */}
        <Card className="shadow-2xl border-[#1F2937] bg-[#111827]">
          <CardHeader className="bg-[#1F2937]/50 border-b border-[#1F2937]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select Operational Role & Department
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {availableRoles.map((roleObj) => {
              const isSelected = selectedRole === roleObj.role;

              return (
                <div
                  key={roleObj.role}
                  onClick={() => setSelectedRole(roleObj.role)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#0B0F17] border-orange-500 ring-1 ring-orange-500/40 shadow-lg shadow-orange-500/10'
                      : 'bg-[#0B0F17] border-[#1F2937] hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 rounded-md bg-[#111827] border border-[#1F2937] shrink-0 mt-0.5">
                    {getRoleIcon(roleObj.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-100">
                        {roleObj.departmentName}
                      </span>
                      <span className="font-mono text-[10px] bg-[#111827] text-orange-400 px-2 py-0.5 rounded font-bold border border-[#1F2937]">
                        {roleObj.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {roleObj.name} • {roleObj.designation}
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400 font-medium block mt-1">
                      Integrated Feed: {roleObj.sourceSystem}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="bg-[#0B0F17]/80 border-t border-[#1F2937] flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Role Clearance Active
            </span>
            <Button
              variant="default"
              onClick={handleLogin}
              icon={ArrowRight}
            >
              Enter Operations Console
            </Button>
          </CardFooter>
        </Card>

        {/* System Footer */}
        <div className="text-center text-[10px] font-mono text-slate-500">
          Smart India Hackathon • SIH Railway Automatic Block Planning System
        </div>
      </div>
    </div>
  );
};
