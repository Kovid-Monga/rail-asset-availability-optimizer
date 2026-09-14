import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DepartmentLayout } from './DepartmentLayout';
import { AdminLayout } from './AdminLayout';

export const DashboardLayout = () => {
  const { currentRole, isAdminPreviewing } = useAuth();

  // Admin persona (unless previewing a department) renders Ledgerix RAIL AdminLayout
  if (currentRole === 'ADMIN' && !isAdminPreviewing) {
    return <AdminLayout />;
  }

  // Department personas (ENG, TRD, SNT) or Admin in department preview mode render RailSync DepartmentLayout
  return <DepartmentLayout />;
};
