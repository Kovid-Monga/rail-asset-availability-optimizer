import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const RoleGate = ({ allowedRoles = [], children, fallback }) => {
  const { currentRole } = useAuth();

  if (!allowedRoles.includes(currentRole)) {
    if (fallback) return fallback;
    return (
      <div className="p-6 text-center border border-rail-border rounded-md bg-rail-surface max-w-md mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-rail-critical mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-rail-text">Access Restricted</h3>
        <p className="text-xs text-rail-muted mt-1">
          This operations console view requires {allowedRoles.join(', ')} clearance. You are currently logged in as <span className="font-semibold text-rail-text">{currentRole}</span>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
