import { useMemo, useState } from "react"
import { Filter } from "lucide-react"
import { AsyncBoundary, Panel, PageHeader } from "@/components/ui"
import { TaskCard } from "@/components/TaskCard"
import { useTasks } from "@/hooks/useApi"
import { CREW_TEAM, ROLE_CAPABILITIES, useApp } from "@/store/AppContext"
import type { PriorityCategory } from "@/types"
import { cx } from "@/utils/display"

const FILTERS: Array<PriorityCategory | "All"> = ["All", "Critical", "Urgent", "Moderate", "Normal"]

export function MaintenanceTasks() {
	const tasks = useTasks()
	const { role, selectTask, selectedTaskId, focusedSection, focusSection } = useApp()
	const caps = ROLE_CAPABILITIES[role]
	const [filter, setFilter] = useState<PriorityCategory | "All">("All")

	const visible = useMemo(() => {
		let list = tasks.data ?? []
		if (!caps.seeAllTasks) list = list.filter((t) => t.assigned_team === CREW_TEAM)
		if (filter !== "All") list = list.filter((t) => t.priority === filter)
		return [...list].sort((a, b) => b.priority_score - a.priority_score)
	}, [tasks.data, filter, caps.seeAllTasks])

	return (
		<div>
			<PageHeader
				title="Maintenance tasks"
				subtitle={
					caps.seeAllTasks
						? "Needs aggregated from TMS, SMMS and TDMS, each scored by the priority model on the backend."
						: `Showing work assigned to ${CREW_TEAM}. Open a task for its priority explanation.`
				}
				action={
					<div className="flex items-center gap-1.5">
						<Filter size={13} className="text-muted" />
						{FILTERS.map((f) => (
							<button
								key={f}
								type="button"
								onClick={() => setFilter(f)}
								className={cx(
									"h-8 rounded-lg border px-2.5 text-[12px] transition-colors",
									filter === f ? "border-accent bg-accentSoft font-medium text-govNavy" : "border-line text-muted hover:bg-accentSoft hover:text-ink",
								)}
							>
								{f}
							</button>
						))}
					</div>
				}
			/>

			<Panel padded={false} className="p-5">
				<AsyncBoundary
					state={tasks}
					loadingMessage="Loading maintenance tasks…"
					emptyMessage="No tasks match this filter."
					isEmpty={() => visible.length === 0}
				>
					{() => (
						<div className="grid gap-2.5 lg:grid-cols-2">
							{visible.map((t) => (
								<TaskCard
									key={t.task_id}
									task={t}
									onSelect={selectTask}
									onHoverSection={focusSection}
									selected={selectedTaskId === t.task_id}
									dimmed={Boolean(focusedSection) && focusedSection !== t.block_section}
								/>
							))}
						</div>
					)}
				</AsyncBoundary>
			</Panel>
		</div>
	)
}
