/* ==========================================================================
 * FRONTEND ↔ BACKEND CONTRACT
 * --------------------------------------------------------------------------
 * These types describe exactly what the frontend expects from your
 * teammates' API. If a field name differs on the backend, change it HERE
 * (and in the api/ mappers) — no component needs to be touched.
 * ========================================================================== */

export type Department = "Engineering" | "S&T" | "OHE"
export type SourceSystem = "TMS" | "SMMS" | "TDMS" | "COA"
export type Level = "Low" | "Medium" | "High"

/** Returned by the Priority Model. Never computed in the frontend. */
export type PriorityCategory = "Critical" | "Urgent" | "Moderate" | "Normal"
/** Derived on the backend from reason_code + reason_description. */
export type ReasonSeverity = "Critical" | "Major" | "Moderate" | "Minor"

export type TaskStatus = "Pending" | "Scheduled" | "In Progress" | "Completed" | "Delayed"

export type BlockStatus =
	| "AI_RECOMMENDED"
	| "PENDING_REVIEW"
	| "APPROVED"
	| "CONFLICT"
	| "IN_PROGRESS"
	| "COMPLETED"
	| "DELAYED"

export type Role = "Supervisor" | "Maintenance Crew" | "Auditor" | "Management"

/* ------------------------------ priority --------------------------------- */

export interface PriorityFactor {
	/** e.g. "Asset Impact" */
	label: string
	/** points awarded by the model, e.g. 30 */
	score: number
	/** maximum points for this factor, e.g. 30 */
	max: number
	/** the underlying value, e.g. "High" or "3–7 days" */
	value: string
}

export interface PriorityExplanation {
	score: number
	category: PriorityCategory
	factors: PriorityFactor[]
	/** human readable "why" sentence produced by the backend */
	reasoning: string
	derived_reason_severity: ReasonSeverity
	model_version?: string
}

/* ---------------------------- compatibility ------------------------------ */

export interface CompatibilityInfo {
	compatible_task_ids: string[]
	/** 0–1 */
	confidence: number
	reason: string
	model_version?: string
}

/* -------------------------------- tasks ---------------------------------- */

/** GET /api/tasks  → MaintenanceTask[] */
export interface MaintenanceTask {
	task_id: string
	source_system: SourceSystem
	department: Department
	block_section: string
	line: string
	work_location: string
	reason_code: string
	reason_description: string
	asset_impact: Level
	due_date: string // ISO date
	traffic: Level // from COA
	duration_min: number
	status: TaskStatus
	assigned_team?: string

	/* model outputs */
	priority: PriorityCategory
	priority_score: number
	priority_explanation?: PriorityExplanation
	compatibility?: CompatibilityInfo
}

/* ------------------------------ schedule --------------------------------- */

export interface PlannerOverride {
	by: string
	at: string
	original_start: string
	original_end: string
	new_start: string
	new_end: string
	reason: string
}

export interface ScheduleBlock {
	block_id: string
	block_section: string
	line: string
	start_time: string // "10:30"
	end_time: string // "12:15"
	tasks: string[] // task_ids
	departments: Department[]
	assigned_team: string
	estimated_delay_min: number
	/** 0–1, from the Compatibility Model */
	compatibility_score: number
	status: BlockStatus
	requires_approval: boolean
	/** true when several departments share one synchronized window */
	is_combined: boolean
	conflict_reason?: string
	planner_override?: PlannerOverride
}

/** GET /api/schedule */
export interface ScheduleResponse {
	plan_date: string
	optimization_run_id: string
	generated_at: string
	engine_version: string
	blocks: ScheduleBlock[]
	summary: {
		total_blocks: number
		combined_blocks: number
		total_estimated_delay_min: number
		conflicts: number
		awaiting_approval: number
	}
}

/* --------------------------- recommendations ----------------------------- */

export interface AIRecommendation {
	recommendation_id: string
	title: string
	block_section: string
	task_ids: string[]
	recommended_window: { start: string; end: string }
	benefits: Array<{ label: string; delta: string; direction: "up" | "down" }>
	/** 0–1 */
	confidence: number
	explanation: string
	status: "PENDING" | "APPROVED" | "REJECTED"
}

/* ------------------------------ dashboard -------------------------------- */

export interface KPI {
	id: string
	label: string
	value: string | number
	unit?: string
	delta?: number
	intent?: "neutral" | "positive" | "attention" | "danger"
	hint?: string
}

export interface TrendPoint {
	label: string
	value: number
	secondary?: number
}

export interface PipelineStage {
	id: string
	label: string
	group: "source" | "tasks" | "models" | "constraints" | "optimization" | "output" | "planner"
	inputs: string[]
	processing: string[]
	outputs: string[]
	status: "OK" | "RUNNING" | "STALE"
	metric?: string
}

/** GET /api/dashboard */
export interface DashboardResponse {
	system_status: "OPERATIONAL" | "DEGRADED" | "OFFLINE"
	last_updated: string
	kpis: KPI[]
	delay_trend: TrendPoint[]
	availability_trend: TrendPoint[]
	backlog_by_department: TrendPoint[]
	pipeline: PipelineStage[]
}

/* ------------------------------- network --------------------------------- */

export interface Station {
	id: string
	name: string
	/** 0–1 position along the corridor */
	x: number
	y: number
}

export interface BlockSectionGeo {
	id: string // "A-B"
	from: string
	to: string
	line: string
	length_km: number
	traffic: Level
	asset_availability: number // 0–1
	active_block?: boolean
	open_tasks: number
}

export interface TrainPosition {
	train_no: string
	name: string
	/** 0–1 progress across the corridor */
	progress: number
	delay_min: number
	direction: "UP" | "DN"
}

/** GET /api/network */
export interface NetworkResponse {
	stations: Station[]
	sections: BlockSectionGeo[]
	trains: TrainPosition[]
}

/* ------------------------------- what-if --------------------------------- */

export interface WhatIfRequest {
	scenario: "ASSET_FAILURE" | "TRAFFIC_SURGE" | "FACILITY_UNAVAILABLE" | "CREW_SHORTAGE"
	block_section: string
	severity: Level
	notes?: string
}

export interface WhatIfResponse {
	simulation_id: string
	scenario: WhatIfRequest["scenario"]
	affected_tasks: number
	estimated_delay_delta_min: number
	conflicts_resolved: number
	conflicts_introduced: number
	narrative: string
	comparison: Array<{
		block_id: string
		block_section: string
		original: { start: string; end: string }
		revised: { start: string; end: string }
	}>
	revised_blocks: ScheduleBlock[]
}

/* ------------------------- approval / override --------------------------- */

export interface ApprovalRequest {
	block_id: string
	decision: "APPROVE" | "REJECT"
	planner: string
	note?: string
}

export interface OverrideRequest {
	block_id: string
	new_start: string
	new_end: string
	assigned_team?: string
	remove_task_ids?: string[]
	reason: string
	planner: string
}

/* ------------------------------ incidents -------------------------------- */

export interface Incident {
	incident_id: string
	issue_type: string
	description: string
	block_section: string
	work_location: string
	photo_name?: string
	reported_by: string
	reported_at: string
	stage: "SUBMITTED" | "SUPERVISOR_REVIEW" | "AI_PRIORITIZATION" | "SCHEDULED"
	priority?: PriorityCategory
	priority_score?: number
}

/* -------------------------------- shared --------------------------------- */

export interface AsyncState<T> {
	data: T | undefined
	loading: boolean
	error: string | undefined
	lastUpdated: string | undefined
	refetch: () => void
}
