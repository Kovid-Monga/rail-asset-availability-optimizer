import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardRouter } from '../DashboardRouter';
import { LoginPage } from '../../features/auth/LoginPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect to active role overview */}
      <Route path="/" element={<DashboardRouter />} />

      {/* Dynamic Shell Routing for ENG, TRD, SNT, ADMIN */}
      {['eng', 'trd', 'snt', 'admin'].map((dept) => (
        <Route
          key={dept}
          path={`/${dept}/*`}
          element={<DashboardLayout />}
        />
      ))}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
