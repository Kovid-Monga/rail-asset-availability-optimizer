/* ==========================================================================
 * API ABSTRACTION
 * --------------------------------------------------------------------------
 *   Mock API  ─┐
 *              ├─→  RailApi  ─→  hooks  ─→  pages  ─→  components
 *   Live API  ─┘
 *
 * Components depend on this interface only, so switching data source is a
 * one-line .env change (VITE_DATA_SOURCE=mock|live).
 * ========================================================================== */

import { DATA_SOURCE } from "./client"
import { liveApi } from "./liveApi"
import { mockApi } from "./mockApi"
import type {
	AIRecommendation,
	ApprovalRequest,
	DashboardResponse,
	Incident,
	MaintenanceTask,
	NetworkResponse,
	OverrideRequest,
	ScheduleResponse,
	WhatIfRequest,
	WhatIfResponse,
} from "@/types"

export interface RailApi {
	getTasks(): Promise<MaintenanceTask[]>
	getTask(id: string): Promise<MaintenanceTask>
	getSchedule(): Promise<ScheduleResponse>
	getDashboard(): Promise<DashboardResponse>
	getRecommendations(): Promise<AIRecommendation[]>
	getNetwork(): Promise<NetworkResponse>
	getIncidents(): Promise<Incident[]>
	createIncident(input: Omit<Incident, "incident_id" | "reported_at" | "stage">): Promise<Incident>
	runWhatIf(input: WhatIfRequest): Promise<WhatIfResponse>
	approveBlock(input: ApprovalRequest): Promise<{ ok: boolean; block_id: string }>
	overrideBlock(input: OverrideRequest): Promise<{ ok: boolean; block_id: string }>
	applyRecommendation(id: string): Promise<{ ok: boolean; recommendation_id: string }>
}

export const api: RailApi = DATA_SOURCE === "live" ? liveApi : mockApi
export const isMockMode = DATA_SOURCE !== "live"
export { API_BASE_URL, ApiError } from "./client"
