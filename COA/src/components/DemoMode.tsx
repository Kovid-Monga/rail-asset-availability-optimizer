/* ==========================================================================
 * GUIDED DEMO
 * Walks a reviewer through the full pipeline: need → priority → compatibility
 * → optimized block → recommendation → what-if → planner approval.
 * It only navigates and selects; it never fakes backend results.
 * ========================================================================== */

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useState } from "react"
import { useApp } from "@/store/AppContext"

interface Step {
	title: string
	body: string
	route: string
	taskId?: string | null
	blockId?: string | null
	section?: string | null
}

const STEPS: Step[] = [
	{
		title: "1 · Control centre overview",
		body: "KPIs answer the first question a controller asks: what needs attention right now?",
		route: "/",
		taskId: null,
	},
	{
		title: "2 · Network status",
		body: "Traffic density, asset availability and live train positions across the division corridor.",
		route: "/map",
		section: null,
	},
	{
		title: "3 · Maintenance needs",
		body: "Needs aggregated from TMS, SMMS and TDMS, ranked by the priority model's score.",
		route: "/tasks",
	},
	{
		title: "4 · A critical task",
		body: "MT-102 scored 86 — the backend classified it Critical. Opening it shows why.",
		route: "/tasks",
		taskId: "MT-102",
		section: "A-B",
	},
	{
		title: "5 · Why it was prioritized",
		body: "Asset Impact 30/30, Reason Severity 18/25, Traffic 25/25, Due Date 13/20 — the model's own breakdown, displayed, not recomputed.",
		route: "/tasks",
		taskId: "MT-102",
	},
	{
		title: "6 · Compatible work",
		body: "The compatibility model found MT-108 and MT-117 on the same section at 92% confidence.",
		route: "/tasks",
		taskId: "MT-102",
	},
	{
		title: "7 · Optimized block schedule",
		body: "The optimization engine turned those needs into blocks, each with an estimated train delay.",
		route: "/schedule",
		taskId: null,
		blockId: "BLK-07",
	},
	{
		title: "8 · One combined block",
		body: "BLK-07 merges three departments into a single 10:30–12:15 protection window on A-B.",
		route: "/gantt",
		blockId: "BLK-07",
		section: "A-B",
	},
	{
		title: "9 · AI recommendation",
		body: "Expected benefits and confidence are stated up front — and approval is still required.",
		route: "/recommendations",
	},
	{
		title: "10 · Run a what-if",
		body: "Ask the engine what happens if an asset fails on E-F at high severity.",
		route: "/what-if",
		section: "E-F",
	},
	{
		title: "11 · Revised schedule",
		body: "Original vs revised windows, delay delta and conflicts — the live plan is untouched.",
		route: "/what-if",
	},
	{
		title: "12 · Planner decides",
		body: "Approve, modify or reject. Any override is recorded with a reason.",
		route: "/schedule",
		blockId: "BLK-07",
	},
	{
		title: "13 · Approved plan",
		body: "Approved blocks are what would be published to BDMS. Nothing reaches the field without a human.",
		route: "/schedule",
	},
]

export function DemoMode() {
	const { demoMode, toggleDemoMode, selectTask, selectBlock, focusSection } = useApp()
	const navigate = useNavigate()
	const [i, setI] = useState(0)

	const step = STEPS[i]

	useEffect(() => {
		if (!demoMode) {
			setI(0)
			return
		}
		navigate(step.route)
		if (step.taskId !== undefined) selectTask(step.taskId)
		if (step.blockId !== undefined) selectBlock(step.blockId)
		if (step.section !== undefined) focusSection(step.section)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [demoMode, i])

	if (!demoMode) return null

	const close = () => {
		selectTask(null)
		focusSection(null)
		toggleDemoMode()
	}

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
			<div className="panel pointer-events-auto flex w-full max-w-[680px] items-start gap-4 border-accent/40 bg-raised/95 px-4 py-3.5 shadow-soft backdrop-blur">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<span className="label-xs text-accent">Guided demo</span>
						<span className="mono text-[11px] text-muted">
							{i + 1}/{STEPS.length}
						</span>
					</div>
					<p className="mt-1 text-[13.5px] font-semibold tracking-tight">{step.title}</p>
					<p className="mt-0.5 text-[12.5px] leading-snug text-muted">{step.body}</p>
					<div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-line">
						<div
							className="h-full rounded-full bg-accent transition-all duration-300"
							style={{ width: `${((i + 1) / STEPS.length) * 100}%` }}
						/>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1.5">
					<button
						type="button"
						onClick={() => setI((v) => Math.max(0, v - 1))}
						disabled={i === 0}
						title="Previous step"
						className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:text-ink disabled:opacity-40"
					>
						<ChevronLeft size={16} />
					</button>
					<button
						type="button"
						onClick={() => (i === STEPS.length - 1 ? close() : setI((v) => v + 1))}
						title="Next step"
						className="flex h-9 items-center gap-1.5 rounded-lg border border-transparent bg-[#2f6fb8] px-3 text-[13px] font-medium text-white hover:bg-[#3a7cc7]"
					>
						{i === STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight size={15} />
					</button>
					<button
						type="button"
						onClick={close}
						title="Exit demo"
						className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:text-ink"
					>
						<X size={15} />
					</button>
				</div>
			</div>
		</div>
	)
}
