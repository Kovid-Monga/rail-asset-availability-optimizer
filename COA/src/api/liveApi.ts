/* ==========================================================================
 * LIVE BACKEND IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Used when VITE_DATA_SOURCE=live. Maps real backend requests & blocks
 * from PostgreSQL directly into frontend types.
 * ========================================================================== */

import { http } from "./client"
import { ENDPOINTS } from "./endpoints"
import type { RailApi } from "./index"
import type {
	AIRecommendation,
	BackendBlockSchedule,
	BackendConflictCheck,
	BackendMaintenanceRequest,
	BackendOverviewStats,
	DashboardResponse,
	Incident,
	MaintenanceTask,
	NetworkResponse,
	ScheduleResponse,
	WhatIfResponse,
} from "@/types"

export function mapBackendRequestToTask(req: BackendMaintenanceRequest): MaintenanceTask {
	const deptMap: Record<string, "Engineering" | "S&T" | "OHE"> = {
		TMS: "Engineering",
		SMMS: "S&T",
		TDMS: "OHE",
	}

	const pr = req.priority_result
	const priority = pr ? pr.priority_class : "Normal"
	const priority_score = pr ? pr.priority_score : 0
	const traffic = pr ? pr.traffic : ((req.asset_impact as any) || "Medium")

	const priority_explanation = pr
		? {
				score: pr.priority_score,
				category: pr.priority_class,
				derived_reason_severity: pr.predicted_severity,
				model_version: "Priority Model v1.0",
				reasoning: `Evaluated by Priority Model: Reason Severity (${pr.predicted_severity}: ${pr.severity_score} pts), Asset Impact (${req.asset_impact || "Medium"}: ${pr.asset_impact_score} pts), Traffic Impact (${pr.traffic}: ${pr.traffic_score} pts), and Due Date Urgency (${pr.due_date_score} pts).`,
				factors: [
					{
						label: "Asset Impact",
						score: pr.asset_impact_score,
						max: 30,
						value: req.asset_impact || "Medium",
					},
					{
						label: "Reason Severity",
						score: pr.severity_score,
						max: 25,
						value: pr.predicted_severity,
					},
					{
						label: "Traffic Impact",
						score: pr.traffic_score,
						max: 25,
						value: pr.traffic,
					},
					{
						label: "Due Date Urgency",
						score: pr.due_date_score,
						max: 20,
						value: req.due_date,
					},
				],
			}
		: undefined

	return {
		task_id: `MT-${req.need_id}`,
		source_system: (req.department as any) || "TMS",
		department: deptMap[req.department.toUpperCase()] || "Engineering",
		block_section: `${req.block_start} - ${req.block_end}`,
		line: req.line || "UP Main",
		work_location: req.work_location || req.block_start,
		reason_code: req.reason_code || "ENG-01",
		reason_description: req.reason_description || "Maintenance request",
		asset_impact: (req.asset_impact as any) || "Medium",
		due_date: req.due_date,
		traffic,
		duration_min: req.duration_min,
		status: req.status === "SUBMITTED" ? "Pending" : "Scheduled",
		priority,
		priority_score,
		priority_explanation,
		compatibility: undefined,
	}
}

export const liveApi: RailApi = {
	getTasks: async () => {
		const raw = await http.get<BackendMaintenanceRequest[]>(ENDPOINTS.requests)
		return raw.map(mapBackendRequestToTask)
	},
	getTask: async (id: string) => {
		const numericId = id.replace(/^MT-/, "")
		const raw = await http.get<BackendMaintenanceRequest>(ENDPOINTS.requestById(numericId))
		return mapBackendRequestToTask(raw)
	},
	getSchedule: async () => {
		const raw = await http.get<BackendBlockSchedule[]>(ENDPOINTS.blocks)
		return {
			plan_date: new Date().toISOString().slice(0, 10),
			optimization_run_id: "LIVE-RUN",
			generated_at: new Date().toISOString(),
			engine_version: "v1.0.0-central",
			blocks: raw.map((b) => ({
				block_id: b.block_id,
				block_section: b.section,
				line: b.line,
				start_time: b.start_time,
				end_time: b.end_time,
				tasks: b.tasks,
				departments: ["Engineering"],
				assigned_team: "Maintenance Division",
				estimated_delay_min: 0,
				compatibility_score: 1.0,
				status: b.status === "APPROVED" ? "APPROVED" : "PENDING_REVIEW",
				requires_approval: b.status === "PENDING_APPROVAL",
				is_combined: b.tasks.length > 1,
			})),
			summary: {
				total_blocks: raw.length,
				combined_blocks: raw.filter((b) => b.tasks.length > 1).length,
				total_estimated_delay_min: 0,
				conflicts: 0,
				awaiting_approval: raw.filter((b) => b.status === "PENDING_APPROVAL").length,
			},
		}
	},
	getDashboard: async () => {
		const stats = await http.get<BackendOverviewStats>(ENDPOINTS.overviewStats)
		return {
			system_status: "OPERATIONAL",
			last_updated: new Date().toISOString(),
			kpis: [
				{ id: "total", label: "Total Blocks", value: stats.total_blocks, intent: "neutral" },
				{ id: "approved", label: "Approved", value: stats.approved, intent: "positive" },
				{ id: "pending", label: "Pending Approval", value: stats.pending_approval, intent: "attention" },
				{ id: "conflicts", label: "Conflicts", value: stats.conflicts, intent: stats.conflicts > 0 ? "danger" : "positive" },
			],
			delay_trend: [],
			availability_trend: [],
			backlog_by_department: [],
			pipeline: [],
		}
	},
	getRecommendations: () => http.get<AIRecommendation[]>(ENDPOINTS.recommendations),
	getNetwork: async () => ({
		stations: [],
		sections: [],
		trains: [],
	}),
	getIncidents: async () => [],
	createIncident: async (input) => ({
		...input,
		incident_id: "INC-01",
		reported_at: new Date().toISOString(),
		stage: "SUBMITTED",
	}),
	runWhatIf: async () => ({
		simulation_id: "WIF-01",
		scenario: "ASSET_FAILURE",
		affected_tasks: 0,
		estimated_delay_delta_min: 0,
		conflicts_resolved: 0,
		conflicts_introduced: 0,
		narrative: "No simulation active while models are under construction.",
		comparison: [],
		revised_blocks: [],
	}),
	approveBlock: async (input) => {
		await http.post(ENDPOINTS.approveBlock(input.block_id))
		return { ok: true, block_id: input.block_id }
	},
	overrideBlock: async (input) => {
		await http.put(ENDPOINTS.updateBlock(input.block_id), {
			start_time: input.new_start,
			end_time: input.new_end,
		})
		return { ok: true, block_id: input.block_id }
	},
	applyRecommendation: async (id) => {
		// Does not auto-approve; navigates to schedule
		return { ok: true, recommendation_id: id }
	},
	// Extended block schedule APIs
	getRawBlocks: (date?: string) =>
		http.get<BackendBlockSchedule[]>(ENDPOINTS.blocks + (date ? `?date=${date}` : "")),
	getRawBlock: (id: string) => http.get<BackendBlockSchedule>(ENDPOINTS.blockById(id)),
	updateBlockSchedule: (id: string, payload: any) =>
		http.put<BackendBlockSchedule>(ENDPOINTS.updateBlock(id), payload),
	checkBlockConflicts: (id: string) =>
		http.post<BackendConflictCheck>(ENDPOINTS.checkConflicts(id)),
	approveBlockSchedule: (id: string) =>
		http.post<BackendBlockSchedule>(ENDPOINTS.approveBlock(id)),
	rejectBlockSchedule: (id: string) =>
		http.post<BackendBlockSchedule>(ENDPOINTS.rejectBlock(id)),
	createProposal: (payload: any) =>
		http.post<BackendBlockSchedule>(ENDPOINTS.createProposal, payload),
	getOverviewStats: () => http.get<BackendOverviewStats>(ENDPOINTS.overviewStats),
}
