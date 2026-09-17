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
	BackendBlockSchedule,
	BackendConflictCheck,
	BackendOverviewStats,
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

	// Real database Block Schedules & Overview APIs
	getRawBlocks?(date?: string): Promise<BackendBlockSchedule[]>
	getRawBlock?(id: string): Promise<BackendBlockSchedule>
	updateBlockSchedule?(id: string, payload: any): Promise<BackendBlockSchedule>
	checkBlockConflicts?(id: string): Promise<BackendConflictCheck>
	approveBlockSchedule?(id: string): Promise<BackendBlockSchedule>
	rejectBlockSchedule?(id: string): Promise<BackendBlockSchedule>
	createProposal?(payload: any): Promise<BackendBlockSchedule>
	getOverviewStats?(): Promise<BackendOverviewStats>
}

export const api: RailApi = DATA_SOURCE === "live" ? liveApi : mockApi
export const isMockMode = DATA_SOURCE !== "live"
export { API_BASE_URL, ApiError } from "./client"
