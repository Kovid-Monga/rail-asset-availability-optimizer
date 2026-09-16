/* ==========================================================================
 * >>>>>>>>>>  REPLACE MOCK ENDPOINTS WITH REAL ONES HERE  <<<<<<<<<<
 * --------------------------------------------------------------------------
 * This is the ONLY file you edit when the backend team hands you their
 * routes. Paths are appended to VITE_API_BASE_URL (see src/api/client.ts).
 * ========================================================================== */

export const ENDPOINTS = {
	tasks: "/api/tasks", // GET  -> MaintenanceTask[]
	taskById: (id: string) => `/api/tasks/${id}`, // GET  -> MaintenanceTask
	schedule: "/api/schedule", // GET  -> ScheduleResponse
	dashboard: "/api/dashboard", // GET  -> DashboardResponse
	recommendations: "/api/recommendations", // GET  -> AIRecommendation[]
	network: "/api/network", // GET  -> NetworkResponse
	incidents: "/api/incidents", // GET/POST -> Incident[] / Incident
	whatIf: "/api/what-if", // POST -> WhatIfResponse
	approve: "/api/schedule/approve", // POST -> { ok }
	override: "/api/schedule/override", // POST -> { ok }
	applyRecommendation: (id: string) => `/api/recommendations/${id}/apply`, // POST
} as const
