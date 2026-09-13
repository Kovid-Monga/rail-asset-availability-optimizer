import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardRouter = () => {
  const { currentRole } = useAuth();
  return <Navigate to={`/${currentRole.toLowerCase()}/dashboard`} replace />;
};
