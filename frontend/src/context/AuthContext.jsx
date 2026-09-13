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
    badgeColor: 'text-[#3E5C55] bg-[#E8EFEA] border-[#3E5C55]/30'
  },
  TRD: {
    role: 'TRD',
    name: 'Er. V. P. Singh',
    designation: 'Sr. Divisional Electrical Engineer (TRD / OHE)',
    departmentName: 'Traction Distribution Department',
    sourceSystem: 'TDMS (Traction Distribution System)',
    badgeColor: 'text-[#B5762E] bg-[#F7EFE3] border-[#B5762E]/30'
  },
  SNT: {
    role: 'SNT',
    name: 'Er. S. Narayanan',
    designation: 'Sr. Divisional Signal & Telecom Engineer',
    departmentName: 'Signal & Telecom Department',
    sourceSystem: 'SMMS (Signal Maintenance System)',
    badgeColor: 'text-[#4A6B82] bg-[#EBF1F5] border-[#4A6B82]/30'
  },
  ADMIN: {
    role: 'ADMIN',
    name: 'R. K. Meena',
    designation: 'Chief Operations Manager / Train Controller',
    departmentName: 'Central Operations Control Center',
    sourceSystem: 'Integrated Operations Hub',
    badgeColor: 'text-[#2B2621] bg-[#E5DFD4] border-[#2B2621]/30'
  }
};

export const AuthProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('railway_active_role') || 'ENG';
  });

  const switchRole = (role) => {
    if (ROLE_USERS[role]) {
      setCurrentRole(role);
      localStorage.setItem('railway_active_role', role);
    }
  };

  const currentUser = ROLE_USERS[currentRole] || ROLE_USERS.ENG;
  const currentDeptConfig = DEPARTMENTS[currentRole] || DEPARTMENTS.ENG;

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        currentDeptConfig,
        switchRole,
        availableRoles: Object.values(ROLE_USERS),
        isAdmin: currentRole === 'ADMIN'
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
