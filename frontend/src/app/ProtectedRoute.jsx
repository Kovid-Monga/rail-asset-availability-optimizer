import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { currentRole } = useAuth();

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // If not authorized for this specific portal, navigate to user's assigned role home
    return <Navigate to={`/${currentRole.toLowerCase()}/dashboard`} replace />;
  }

  return children;
};
