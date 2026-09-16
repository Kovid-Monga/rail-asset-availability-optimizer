/* ==========================================================================
 * LIVE BACKEND IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Used when VITE_DATA_SOURCE=live. If your backend field names differ from
 * src/types/index.ts, map them inside these functions — that keeps every
 * component and page untouched.
 * ========================================================================== */

import { http } from "./client"
import { ENDPOINTS } from "./endpoints"
import type { RailApi } from "./index"
import type {
	AIRecommendation,
	DashboardResponse,
	Incident,
	MaintenanceTask,
	NetworkResponse,
	ScheduleResponse,
	WhatIfResponse,
} from "@/types"

export const liveApi: RailApi = {
	getTasks: () => http.get<MaintenanceTask[]>(ENDPOINTS.tasks),
	getTask: (id) => http.get<MaintenanceTask>(ENDPOINTS.taskById(id)),
	getSchedule: () => http.get<ScheduleResponse>(ENDPOINTS.schedule),
	getDashboard: () => http.get<DashboardResponse>(ENDPOINTS.dashboard),
	getRecommendations: () => http.get<AIRecommendation[]>(ENDPOINTS.recommendations),
	getNetwork: () => http.get<NetworkResponse>(ENDPOINTS.network),
	getIncidents: () => http.get<Incident[]>(ENDPOINTS.incidents),
	createIncident: (input) => http.post<Incident>(ENDPOINTS.incidents, input),
	runWhatIf: (input) => http.post<WhatIfResponse>(ENDPOINTS.whatIf, input),
	approveBlock: (input) => http.post<{ ok: boolean; block_id: string }>(ENDPOINTS.approve, input),
	overrideBlock: (input) => http.post<{ ok: boolean; block_id: string }>(ENDPOINTS.override, input),
	applyRecommendation: (id) =>
		http.post<{ ok: boolean; recommendation_id: string }>(ENDPOINTS.applyRecommendation(id)),
}
