import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEPARTMENTS } from '../constants/departments';

const AuthContext = createContext(null);

const ROLE_USERS = {
  ENG: {
    role: 'ENG',
    name: 'Er. A. K. Sharma',
    designation: 'Sr. Divisional Engineer (Track / Civil)',
    departmentName: 'Engineering Department',
    sourceSystem: 'TMS (Track Management System)',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
  },
  TRD: {
    role: 'TRD',
    name: 'Er. V. P. Singh',
    designation: 'Sr. Divisional Electrical Engineer (TRD / OHE)',
    departmentName: 'Traction Distribution Department',
    sourceSystem: 'TDMS (Traction Distribution System)',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
  },
  SNT: {
    role: 'SNT',
    name: 'Er. S. Narayanan',
    designation: 'Sr. Divisional Signal & Telecom Engineer',
    departmentName: 'Signal & Telecom Department',
    sourceSystem: 'SMMS (Signal Maintenance System)',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
  },
  ADMIN: {
    role: 'ADMIN',
    name: 'R. K. Meena',
    designation: 'Chief Operations Manager / Train Controller',
    departmentName: 'Central Operations Control Center',
    sourceSystem: 'Integrated Operations Hub',
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('railway_active_role') || 'ENG';
  });
  const [previewDept, setPreviewDept] = useState(null);

  const switchRole = (role) => {
    if (ROLE_USERS[role]) {
      setCurrentRole(role);
      setPreviewDept(null);
      localStorage.setItem('railway_active_role', role);
    }
  };

  const effectiveRole = (currentRole === 'ADMIN' && previewDept) ? previewDept : currentRole;
  const currentUser = ROLE_USERS[effectiveRole] || ROLE_USERS.ENG;
  const currentDeptConfig = DEPARTMENTS[effectiveRole] || DEPARTMENTS.ENG;
  const isAdminPreviewing = currentRole === 'ADMIN' && !!previewDept;

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        effectiveRole,
        previewDept,
        setPreviewDept,
        isAdminPreviewing,
        currentUser,
        currentDeptConfig,
        switchRole,
        availableRoles: Object.values(ROLE_USERS)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
