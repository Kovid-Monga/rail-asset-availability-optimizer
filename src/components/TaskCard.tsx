import { Clock, MapPin, Timer } from "lucide-react"
import type { MaintenanceTask } from "@/types"
import { PriorityBadge, DepartmentChip } from "./PriorityBadge"
import { TASK_STATUS_STYLE, cx, formatDuration, relativeDays } from "@/utils/display"

export function TaskCard({
	task,
	onSelect,
	onHoverSection,
	selected,
	dimmed,
}: {
	task: MaintenanceTask
	onSelect: (id: string) => void
	onHoverSection?: (section: string | null) => void
	selected?: boolean
	dimmed?: boolean
}) {
	return (
		<button
			type="button"
			onClick={() => onSelect(task.task_id)}
			onMouseEnter={() => onHoverSection?.(task.block_section)}
			onMouseLeave={() => onHoverSection?.(null)}
			className={cx(
				"w-full rounded-[10px] border bg-surface px-4 py-3.5 text-left transition-all",
				selected ? "border-[#5E9FE8]/60 ring-1 ring-[#5E9FE8]/25" : "border-line hover:border-white/20",
				dimmed && "opacity-45",
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="mono text-[12.5px] font-semibold">{task.task_id}</span>
						<DepartmentChip department={task.department} />
					</div>
					<p className="mt-1.5 truncate text-[13.5px]">{task.reason_description}</p>
				</div>
				<PriorityBadge priority={task.priority} score={task.priority_score} />
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted">
				<span className="inline-flex items-center gap-1.5">
					<MapPin size={12} />
					<span className="mono">{task.block_section}</span> · {task.line} · <span className="mono">{task.work_location}</span>
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Timer size={12} /> {formatDuration(task.duration_min)}
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Clock size={12} /> {relativeDays(task.due_date)}
				</span>
				<span className={cx("font-medium", TASK_STATUS_STYLE[task.status])}>{task.status}</span>
			</div>
		</button>
	)
}
