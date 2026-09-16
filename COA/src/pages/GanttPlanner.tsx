import { AsyncBoundary, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { GanttChart } from "@/components/GanttChart"
import { NetworkMap } from "@/components/NetworkMap"
import { BlockStatusBadge, DepartmentChip } from "@/components/PriorityBadge"
import { useNetwork, useSchedule, useTasks } from "@/hooks/useApi"
import { useApp } from "@/store/AppContext"
import { durationOf, formatDuration, pct } from "@/utils/display"

export function GanttPlanner() {
	const schedule = useSchedule()
	const tasks = useTasks()
	const network = useNetwork()
	const { focusedSection, focusSection, selectedBlockId, selectBlock, selectTask } = useApp()
	const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

	return (
		<div className="space-y-6">
			<PageHeader
				title="Gantt planner"
				subtitle="Sections on the vertical axis, time of day across the top. Combined blocks show every department working under one protection window."
			/>

			<Panel>
				<AsyncBoundary state={schedule} loadingMessage="Loading optimized plan…">
					{(s) => (
						<GanttChart
							blocks={s.blocks}
							tasks={tasks.data ?? []}
							focusedSection={focusedSection}
							onFocusSection={focusSection}
							selectedBlockId={selectedBlockId}
							onSelectBlock={selectBlock}
							nowMinutes={nowMinutes}
						/>
					)}
				</AsyncBoundary>
			</Panel>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
				<Panel>
					<SectionHeader
						eyebrow="Linked view"
						title="Where this block sits on the corridor"
						subtitle="Selecting a block here highlights the same section on the map, and the reverse."
					/>
					<AsyncBoundary state={network} loadingMessage="Loading corridor…">
						{(n) => (
							<NetworkMap network={n} focusedSection={focusedSection} onFocusSection={focusSection} height={210} />
						)}
					</AsyncBoundary>
				</Panel>

				<Panel>
					<SectionHeader eyebrow="Selected block" title="Block composition" />
					<AsyncBoundary state={schedule} loadingMessage="Loading…">
						{(s) => {
							const b = s.blocks.find((x) => x.block_id === selectedBlockId)
							if (!b)
								return <p className="text-[13px] text-muted">Select a block in the Gantt to inspect its tasks.</p>
							const members = b.tasks
								.map((id) => (tasks.data ?? []).find((t) => t.task_id === id))
								.filter(Boolean)
							return (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<span className="mono text-[14px] font-semibold">{b.block_id}</span>
										<BlockStatusBadge status={b.status} />
									</div>
									<p className="mono text-[12.5px] text-muted">
										{b.block_section} · {b.line} · {b.start_time}–{b.end_time} ·{" "}
										{formatDuration(durationOf(b.start_time, b.end_time))} · delay {b.estimated_delay_min} min · compat{" "}
										{pct(b.compatibility_score)}
									</p>
									<p className="text-[12.5px] text-muted">Team: {b.assigned_team}</p>
									<ul className="space-y-1.5">
										{members.map((t) => (
											<li key={t!.task_id}>
												<button
													type="button"
													onClick={() => selectTask(t!.task_id)}
													className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-left text-[12.5px] hover:bg-white/[0.06]"
												>
													<span className="mono font-semibold">{t!.task_id}</span>
													<DepartmentChip department={t!.department} />
													<span className="truncate text-muted">{t!.reason_description}</span>
												</button>
											</li>
										))}
									</ul>
								</div>
							)
						}}
					</AsyncBoundary>
				</Panel>
			</div>
		</div>
	)
}
