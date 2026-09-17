import { Link2, Link2Off } from "lucide-react"
import type { CompatibilityInfo, MaintenanceTask } from "@/types"
import { pct } from "@/utils/display"
import { DepartmentChip } from "./PriorityBadge"

/** Renders the compatibility model's output for one task. */
export function CompatibilityPanel({
	compatibility,
	tasks,
	onSelectTask,
}: {
	compatibility: CompatibilityInfo
	tasks: MaintenanceTask[]
	onSelectTask?: (id: string) => void
}) {
	const compatible = compatibility.compatible_task_ids
		.map((id) => tasks.find((t) => t.task_id === id))
		.filter((t): t is MaintenanceTask => Boolean(t))

	return (
		<div>
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="label-xs">Compatibility</p>
				<span className="mono text-[11px] text-muted">{compatibility.model_version}</span>
			</div>

			<div className="flex items-center gap-2 text-[13px]">
				{compatible.length ? (
					<Link2 size={14} className="text-[#1E7D45]" />
				) : (
					<Link2Off size={14} className="text-muted" />
				)}
				<span>
					{compatible.length
						? `${compatible.length} compatible task${compatible.length > 1 ? "s" : ""} in this section`
						: "No compatible tasks found"}
				</span>
				<span className="mono ml-auto text-[12px] text-muted">confidence {pct(compatibility.confidence)}</span>
			</div>

			{compatible.length ? (
				<ul className="mt-3 space-y-1.5">
					{compatible.map((t) => (
						<li key={t.task_id}>
							<button
								type="button"
								onClick={() => onSelectTask?.(t.task_id)}
								className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-raised px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-accentSoft"
							>
								<span className="mono font-semibold">{t.task_id}</span>
								<DepartmentChip department={t.department} />
								<span className="truncate text-muted">{t.reason_description}</span>
							</button>
						</li>
					))}
				</ul>
			) : null}

			<p className="mt-3 text-[12.5px] leading-relaxed text-muted">{compatibility.reason}</p>
		</div>
	)
}
