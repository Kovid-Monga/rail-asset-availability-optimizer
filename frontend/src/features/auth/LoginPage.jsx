import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants/departments';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Train, ShieldCheck, Wrench, Zap, Radio, Lock, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { currentRole, switchRole, availableRoles } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const handleLogin = () => {
    switchRole(selectedRole);
    if (selectedRole === 'ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate(`/${selectedRole.toLowerCase()}/dashboard`);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ENG': return <Wrench className="w-5 h-5 text-[#3E5C55]" />;
      case 'TRD': return <Zap className="w-5 h-5 text-[#B5762E]" />;
      case 'SNT': return <Radio className="w-5 h-5 text-[#4A6B82]" />;
      case 'ADMIN': return <ShieldCheck className="w-5 h-5 text-[#2B2621]" />;
      default: return <Train className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-rail-base flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-rail-primary rounded-md flex items-center justify-center text-white mx-auto shadow-sm">
            <Train className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-rail-text uppercase">
            Railway Maintenance Block Planning Console
          </h1>
          <p className="text-xs text-rail-muted max-w-sm mx-auto">
            AI-Driven BDMS Modernization • Northern Railway Control Operations
          </p>
        </div>

        {/* Portal selection card */}
        <Card className="shadow-md border-rail-border">
          <CardHeader className="bg-[#FAF7F0] border-b border-rail-border">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rail-muted">
              Select Department or Administrative Role
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {availableRoles.map((roleObj) => {
              const deptConfig = DEPARTMENTS[roleObj.role];
              const isSelected = selectedRole === roleObj.role;

              return (
                <div
                  key={roleObj.role}
                  onClick={() => setSelectedRole(roleObj.role)}
                  className={`p-3.5 rounded-sm border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#F2ECE1] border-rail-primary ring-1 ring-rail-primary shadow-xs'
                      : 'bg-rail-surface border-rail-border hover:bg-[#FAF7F1]'
                  }`}
                >
                  <div className="p-2 rounded-sm bg-white border border-rail-border shrink-0 mt-0.5">
                    {getRoleIcon(roleObj.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rail-text">
                        {roleObj.departmentName}
                      </span>
                      <span className="font-mono text-[10px] bg-[#EAE2D2] text-rail-text px-1.5 py-0.2 rounded-sm font-semibold border border-rail-border">
                        {roleObj.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-rail-muted mt-0.5">
                      {roleObj.name} • {roleObj.designation}
                    </p>
                    <span className="text-[10px] font-mono text-rail-primary font-medium block mt-1">
                      Source: {roleObj.sourceSystem}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
          <CardFooter className="bg-[#F2EFE7] flex justify-between items-center">
            <span className="text-[11px] text-rail-muted font-mono flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Role Clearance Verified
            </span>
            <Button
              variant="default"
              onClick={handleLogin}
              icon={ArrowRight}
            >
              Enter Console
            </Button>
          </CardFooter>
        </Card>

        {/* Industrial Footer */}
        <div className="text-center text-[10px] font-mono text-rail-muted">
          Smart India Hackathon • AI Railway Maintenance Block Planning System
        </div>
      </div>
    </div>
  );
};
