/* ==========================================================================
 * MOCK IMPLEMENTATION of RailApi
 * --------------------------------------------------------------------------
 * Simulates network latency so loading states are real, and applies
 * mutations to an in-memory copy so approve / override / apply behave like
 * a backend. NEVER used when VITE_DATA_SOURCE=live.
 * ========================================================================== */

import type { RailApi } from "./index"
import {
	mockDashboard,
	mockIncidents,
	mockNetwork,
	mockRecommendations,
	mockSchedule,
	mockTasks,
} from "@/data/mockData"
import type { Incident, ScheduleBlock, ScheduleResponse, WhatIfRequest, WhatIfResponse } from "@/types"

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const db = {
	tasks: clone(mockTasks),
	schedule: clone(mockSchedule),
	recommendations: clone(mockRecommendations),
	incidents: clone(mockIncidents),
	dashboard: clone(mockDashboard),
	network: clone(mockNetwork),
}

async function respond<T>(value: T, ms = 420): Promise<T> {
	await delay(ms)
	return clone(value)
}

function addMinutes(hhmm: string, minutes: number): string {
	const [h, m] = hhmm.split(":").map(Number)
	const total = (h * 60 + m + minutes + 1440) % 1440
	return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function recomputeSummary(schedule: ScheduleResponse) {
	schedule.summary = {
		total_blocks: schedule.blocks.length,
		combined_blocks: schedule.blocks.filter((b) => b.is_combined).length,
		total_estimated_delay_min: schedule.blocks.reduce((s, b) => s + b.estimated_delay_min, 0),
		conflicts: schedule.blocks.filter((b) => b.status === "CONFLICT").length,
		awaiting_approval: schedule.blocks.filter((b) => b.requires_approval).length,
	}
}

export const mockApi: RailApi = {
	getTasks: () => respond(db.tasks),

	getTask: async (id) => {
		await delay(240)
		const task = db.tasks.find((t) => t.task_id === id)
		if (!task) throw new Error(`Task ${id} not found.`)
		return clone(task)
	},

	getSchedule: () => respond(db.schedule, 520),
	getDashboard: () => respond({ ...db.dashboard, last_updated: new Date().toISOString() }, 360),
	getRecommendations: () => respond(db.recommendations, 470),
	getNetwork: () => respond(db.network, 300),
	getIncidents: () => respond(db.incidents, 300),

	createIncident: async (input) => {
		await delay(700)
		const incident: Incident = {
			...input,
			incident_id: `INC-${2049 + db.incidents.length}`,
			reported_at: new Date().toISOString(),
			stage: "SUBMITTED",
		}
		db.incidents = [incident, ...db.incidents]
		return clone(incident)
	},

	runWhatIf: async (input: WhatIfRequest): Promise<WhatIfResponse> => {
		await delay(1600) // the real optimizer will be slower
		const shift = input.severity === "High" ? 50 : input.severity === "Medium" ? 25 : 10
		const affected = db.schedule.blocks.filter(
			(b) => b.block_section === input.block_section || b.status === "CONFLICT",
		)
		const revised: ScheduleBlock[] = db.schedule.blocks.map((b) =>
			affected.some((a) => a.block_id === b.block_id)
				? {
						...clone(b),
						start_time: addMinutes(b.start_time, shift),
						end_time: addMinutes(b.end_time, shift),
						status: b.status === "CONFLICT" ? "AI_RECOMMENDED" : b.status,
						requires_approval: true,
						conflict_reason: undefined,
					}
				: clone(b),
		)
		const label: Record<WhatIfRequest["scenario"], string> = {
			ASSET_FAILURE: "a sudden asset failure",
			TRAFFIC_SURGE: "a traffic surge",
			FACILITY_UNAVAILABLE: "a maintenance facility becoming unavailable",
			CREW_SHORTAGE: "a crew shortage",
		}
		return {
			simulation_id: `SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
			scenario: input.scenario,
			affected_tasks: affected.reduce((s, b) => s + b.tasks.length, 0),
			estimated_delay_delta_min: Math.round(shift / 6),
			conflicts_resolved: db.schedule.blocks.filter((b) => b.status === "CONFLICT").length,
			conflicts_introduced: input.severity === "High" ? 1 : 0,
			narrative: `Re-optimized the corridor after ${label[input.scenario]} on ${input.block_section} (${input.severity.toLowerCase()} severity). ${affected.length} block window(s) were shifted to protect scheduled train paths. Every revised window still requires planner approval before publishing to BDMS.`,
			comparison: affected.map((b) => ({
				block_id: b.block_id,
				block_section: b.block_section,
				original: { start: b.start_time, end: b.end_time },
				revised: { start: addMinutes(b.start_time, shift), end: addMinutes(b.end_time, shift) },
			})),
			revised_blocks: revised,
		}
	},

	approveBlock: async ({ block_id, decision }) => {
		await delay(520)
		const block = db.schedule.blocks.find((b) => b.block_id === block_id)
		if (block) {
			block.status = decision === "APPROVE" ? "APPROVED" : "PENDING_REVIEW"
			block.requires_approval = decision !== "APPROVE"
			if (decision === "REJECT") block.conflict_reason = "Rejected by planner — awaiting re-optimization."
			else block.conflict_reason = undefined
			recomputeSummary(db.schedule)
		}
		return { ok: true, block_id }
	},

	overrideBlock: async ({ block_id, new_start, new_end, assigned_team, remove_task_ids, reason, planner }) => {
		await delay(560)
		const block = db.schedule.blocks.find((b) => b.block_id === block_id)
		if (block) {
			block.planner_override = {
				by: planner,
				at: new Date().toISOString(),
				original_start: block.start_time,
				original_end: block.end_time,
				new_start,
				new_end,
				reason,
			}
			block.start_time = new_start
			block.end_time = new_end
			if (assigned_team) block.assigned_team = assigned_team
			if (remove_task_ids?.length) {
				block.tasks = block.tasks.filter((t) => !remove_task_ids.includes(t))
				block.is_combined = block.tasks.length > 1
			}
			block.status = "APPROVED"
			block.requires_approval = false
			block.conflict_reason = undefined
			recomputeSummary(db.schedule)
		}
		return { ok: true, block_id }
	},

	applyRecommendation: async (id) => {
		await delay(640)
		const rec = db.recommendations.find((r) => r.recommendation_id === id)
		if (rec) {
			rec.status = "APPROVED"
			const block = db.schedule.blocks.find(
				(b) => b.block_section === rec.block_section && rec.task_ids.every((t) => b.tasks.includes(t)),
			)
			if (block) {
				block.start_time = rec.recommended_window.start
				block.end_time = rec.recommended_window.end
				block.status = "APPROVED"
				block.requires_approval = false
				block.conflict_reason = undefined
				recomputeSummary(db.schedule)
			}
		}
		return { ok: true, recommendation_id: id }
	},
}

/** Exposed only for the simulated live-update layer. */
export const mockDb = db
