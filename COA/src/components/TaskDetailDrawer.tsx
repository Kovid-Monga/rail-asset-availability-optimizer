import { useEffect } from "react"
import { X } from "lucide-react"
import type { MaintenanceTask } from "@/types"
import { Field } from "./ui"
import { DepartmentChip } from "./PriorityBadge"
import { PriorityExplanation } from "./PriorityExplanation"
import { CompatibilityPanel } from "./CompatibilityPanel"
import { LEVEL_STYLE, TASK_STATUS_STYLE, cx, formatDate, formatDuration, relativeDays } from "@/utils/display"

export function TaskDetailDrawer({
	task,
	tasks,
	onClose,
	onSelectTask,
}: {
	task: MaintenanceTask | null
	tasks: MaintenanceTask[]
	onClose: () => void
	onSelectTask: (id: string) => void
}) {
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [onClose])

	if (!task) return null

	return (
		<>
			<div
				onClick={onClose}
				className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
				aria-hidden
			/>
			<aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] animate-slideIn flex-col border-l border-line bg-surface">
				<header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
					<div>
						<div className="flex items-center gap-2">
							<span className="mono text-[15px] font-semibold">{task.task_id}</span>
							<DepartmentChip department={task.department} withSystem />
						</div>
						<p className="mt-1.5 max-w-[34ch] text-[13px] text-muted">{task.reason_description}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close task details"
						className="rounded-lg border border-line p-2 text-muted transition-colors hover:text-ink"
					>
						<X size={15} />
					</button>
				</header>

				<div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
					<div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
						<Field label="Block section" value={task.block_section} mono />
						<Field label="Line" value={task.line} />
						<Field label="Work location" value={task.work_location} mono />
						<Field label="Reason code" value={task.reason_code} mono />
						<Field
							label="Asset impact"
							value={<span className={LEVEL_STYLE[task.asset_impact]}>{task.asset_impact}</span>}
						/>
						<Field label="Traffic (COA)" value={<span className={LEVEL_STYLE[task.traffic]}>{task.traffic}</span>} />
						<Field
							label="Due date"
							value={
								<span>
									{formatDate(task.due_date)} <span className="text-muted">· {relativeDays(task.due_date)}</span>
								</span>
							}
						/>
						<Field label="Duration" value={formatDuration(task.duration_min)} />
						<Field
							label="Current status"
							value={<span className={cx("font-medium", TASK_STATUS_STYLE[task.status])}>{task.status}</span>}
						/>
						<Field label="Assigned team" value={task.assigned_team ?? "Unassigned"} />
					</div>

					{task.priority_explanation ? (
						<>
							<div className="h-px bg-line" />
							<PriorityExplanation explanation={task.priority_explanation} />
						</>
					) : null}

					{task.compatibility ? (
						<>
							<div className="h-px bg-line" />
							<CompatibilityPanel compatibility={task.compatibility} tasks={tasks} onSelectTask={onSelectTask} />
						</>
					) : null}
				</div>

				<footer className="border-t border-line px-5 py-3 text-[11.5px] text-muted">
					Priority and compatibility values are produced by the backend models. The planner has final authority over
					scheduling.
				</footer>
			</aside>
		</>
	)
}
