/* ==========================================================================
 * REAL BACKEND API ENDPOINTS
 * --------------------------------------------------------------------------
 * Paths appended to VITE_API_BASE_URL (see src/api/client.ts).
 * ========================================================================== */

export const ENDPOINTS = {
	requests: "/requests", // GET -> MaintenanceRequestResponse[]
	requestById: (id: string | number) => `/requests/${id}`, // GET -> MaintenanceRequestResponse
	tasks: "/requests", // alias for Settings page
	taskById: (id: string | number) => `/requests/${id}`, // alias for Settings page
	blocks: "/blocks", // GET -> BlockScheduleResponse[]
	blockById: (id: string) => `/blocks/${id}`, // GET -> BlockScheduleResponse
	schedule: "/blocks", // alias for Settings page
	dashboard: "/overview/stats", // alias for Settings page
	network: "/network", // stub
	incidents: "/incidents", // stub
	whatIf: "/what-if", // stub
	approve: "/blocks/approve", // alias
	override: "/blocks/override", // alias
	applyRecommendation: (id: string | number) => `/ai/recommendations/${id}/apply`, // alias
	updateBlock: (id: string) => `/blocks/${id}`, // PUT -> BlockScheduleResponse
	approveBlock: (id: string) => `/blocks/${id}/approve`, // POST -> BlockScheduleResponse
	rejectBlock: (id: string) => `/blocks/${id}/reject`, // POST -> BlockScheduleResponse
	checkConflicts: (id: string) => `/blocks/${id}/check-conflicts`, // POST -> ConflictCheckResponse
	createProposal: "/blocks/proposals", // POST -> BlockScheduleResponse
	overviewStats: "/overview/stats", // GET -> OverviewStatsResponse
	recommendations: "/ai/recommendations", // GET -> AIRecommendationResponse[]
} as const
