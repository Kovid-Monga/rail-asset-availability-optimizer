import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DashboardRouter } from '../DashboardRouter';
import { ProtectedRoute } from '../ProtectedRoute';
import { LoginPage } from '../../features/auth/LoginPage';

// Department views
import { SharedDepartmentDashboard } from '../../features/dashboard/SharedDepartmentDashboard';
import { SharedDepartmentRequestForm } from '../../features/requests/SharedDepartmentRequestForm';
import { SharedDepartmentRequestList } from '../../features/requests/SharedDepartmentRequestList';
import { CorridorTimetable } from '../../features/timetable/CorridorTimetable';
import { ScheduledWorkView } from '../../features/scheduling/ScheduledWorkView';
import { HumanReviewAppealForm } from '../../features/human-review/HumanReviewAppealForm';

// Admin views (structurally distinct)
import { AdminSystemDashboard } from '../../features/admin/AdminSystemDashboard';
import { AdminAllRequests } from '../../features/admin/AdminAllRequests';
import { AdminAiSchedule } from '../../features/admin/AdminAiSchedule';
import { AdminWeeklyPlan } from '../../features/admin/AdminWeeklyPlan';
import { AdminMonthlyPlan } from '../../features/admin/AdminMonthlyPlan';
import { AdminCriticalOverdue } from '../../features/admin/AdminCriticalOverdue';
import { AdminConflictsAlerts } from '../../features/admin/AdminConflictsAlerts';
import { AdminHumanReviewQueue } from '../../features/admin/AdminHumanReviewQueue';
import { AdminAnalytics } from '../../features/admin/AdminAnalytics';
import { AdminManualOverride } from '../../features/admin/AdminManualOverride';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public / Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect to active role dashboard */}
      <Route path="/" element={<DashboardRouter />} />

      {/* Engineering Portal Routes */}
      <Route
        path="/eng"
        element={
          <ProtectedRoute allowedRoles={['ENG', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/eng/dashboard" replace />} />
        <Route path="dashboard" element={<SharedDepartmentDashboard />} />
        <Route path="new-request" element={<SharedDepartmentRequestForm />} />
        <Route path="requests" element={<SharedDepartmentRequestList />} />
        <Route path="timetable" element={<CorridorTimetable />} />
        <Route path="scheduled-work" element={<ScheduledWorkView />} />
        <Route path="human-review" element={<HumanReviewAppealForm />} />
      </Route>

      {/* TRD Portal Routes */}
      <Route
        path="/trd"
        element={
          <ProtectedRoute allowedRoles={['TRD', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/trd/dashboard" replace />} />
        <Route path="dashboard" element={<SharedDepartmentDashboard />} />
        <Route path="new-request" element={<SharedDepartmentRequestForm />} />
        <Route path="requests" element={<SharedDepartmentRequestList />} />
        <Route path="timetable" element={<CorridorTimetable />} />
        <Route path="scheduled-work" element={<ScheduledWorkView />} />
        <Route path="human-review" element={<HumanReviewAppealForm />} />
      </Route>

      {/* S&T Portal Routes */}
      <Route
        path="/snt"
        element={
          <ProtectedRoute allowedRoles={['SNT', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/snt/dashboard" replace />} />
        <Route path="dashboard" element={<SharedDepartmentDashboard />} />
        <Route path="new-request" element={<SharedDepartmentRequestForm />} />
        <Route path="requests" element={<SharedDepartmentRequestList />} />
        <Route path="timetable" element={<CorridorTimetable />} />
        <Route path="scheduled-work" element={<ScheduledWorkView />} />
        <Route path="human-review" element={<HumanReviewAppealForm />} />
      </Route>

      {/* Central Admin Portal Routes (Structurally Separate) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminSystemDashboard />} />
        <Route path="requests" element={<AdminAllRequests />} />
        <Route path="ai-schedule" element={<AdminAiSchedule />} />
        <Route path="weekly-plan" element={<AdminWeeklyPlan />} />
        <Route path="monthly-plan" element={<AdminMonthlyPlan />} />
        <Route path="critical-overdue" element={<AdminCriticalOverdue />} />
        <Route path="conflicts-alerts" element={<AdminConflictsAlerts />} />
        <Route path="human-review" element={<AdminHumanReviewQueue />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="manual-override" element={<AdminManualOverride />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
