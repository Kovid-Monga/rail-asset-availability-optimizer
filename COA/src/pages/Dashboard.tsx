import { useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowUpRight, Layers, Sparkles } from "lucide-react"
import { AsyncBoundary, Panel, SectionHeader } from "@/components/ui"
import { KPIGrid } from "@/components/KPIGrid"

function TrackIcon({ size = 12 }: { size?: number | string }) {
	return (
		<svg viewBox="0 0 16 16" width={size} height={size} className="fill-none stroke-current" strokeWidth="1.8">
			<line x1="4" y1="2" x2="4" y2="14" />
			<line x1="12" y1="2" x2="12" y2="14" />
			<line x1="4" y1="5" x2="12" y2="5" />
			<line x1="4" y1="8.5" x2="12" y2="8.5" />
			<line x1="4" y1="12" x2="12" y2="12" />
		</svg>
	)
}
import { NetworkMap } from "@/components/NetworkMap"
import { GanttChart } from "@/components/GanttChart"
import { AIRecommendationCard } from "@/components/AIRecommendation"
import { TaskCard } from "@/components/TaskCard"
import { LiveFeed } from "@/components/LiveFeed"
import { SystemFlow } from "@/components/SystemFlow"
import { useDashboard, useNetwork, useRecommendations, useSchedule, useTasks } from "@/hooks/useApi"
import { useLiveUpdates } from "@/hooks/useLiveUpdates"
import { ROLE_CAPABILITIES, useApp } from "@/store/AppContext"
import { formatClock } from "@/utils/display"

export function Dashboard() {
	const dashboard = useDashboard()
	const schedule = useSchedule()
	const tasks = useTasks()
	const network = useNetwork()
	const recommendations = useRecommendations()
	const { events, enabled } = useLiveUpdates()
	const { role, selectTask, selectedTaskId, focusedSection, focusSection, selectBlock } = useApp()
	const caps = ROLE_CAPABILITIES[role]

	const upcoming = useMemo(
		() =>
			(tasks.data ?? [])
				.filter((t) => t.status === "Pending")
				.sort((a, b) => b.priority_score - a.priority_score)
				.slice(0, 4),
		[tasks.data],
	)

	const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

	return (
		<div className="space-y-6">
			<AsyncBoundary state={dashboard} loadingMessage="Connecting to optimization engine…">
				{(d) => <KPIGrid kpis={d.kpis} />}
			</AsyncBoundary>

			<div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
				<Panel>
					<SectionHeader
						icon={TrackIcon}
						eyebrow="Corridor"
						title="Network & block planning"
						subtitle="Traffic density, active blocks and live train positions across the division."
						action={
							<Link to="/map" className="inline-flex items-center gap-1 text-[12.5px] text-accent">
								Full map <ArrowUpRight size={13} />
							</Link>
						}
					/>
					<AsyncBoundary state={network} loadingMessage="Loading corridor state…">
						{(n) => <NetworkMap network={n} focusedSection={focusedSection} onFocusSection={focusSection} />}
					</AsyncBoundary>
				</Panel>

				<div className="space-y-6">
					<Panel>
						<SectionHeader
							icon={Sparkles}
							eyebrow="Decision support"
							title="AI recommendations & alerts"
						/>
						<AsyncBoundary
							state={recommendations}
							loadingMessage="Requesting recommendations…"
							emptyMessage="No recommendations right now."
							isEmpty={(r) => r.length === 0}
						>
							{(recs) => (
								<AIRecommendationCard recommendation={recs[0]} canApprove={false} onSelectTask={selectTask} />
							)}
						</AsyncBoundary>
						<p className="mt-3 text-[11.5px] text-muted">
							{caps.approve
								? "Open AI Recommendations to review and approve."
								: "Your role can view recommendations; approval is reserved for supervisors."}
						</p>
					</Panel>

					<Panel>
						<LiveFeed events={events} enabled={enabled} />
					</Panel>
				</div>
			</div>

			<Panel>
				<SectionHeader
					eyebrow="Today"
					title="Optimized block schedule"
					subtitle="Compatible tasks in the same track section are merged into a single combined block."
					action={
						<Link to="/gantt" className="inline-flex items-center gap-1 text-[12.5px] text-accent">
							Gantt planner <ArrowUpRight size={13} />
						</Link>
					}
				/>
				<AsyncBoundary state={schedule} loadingMessage="Retrieving latest schedule…">
					{(s) => (
						<>
							<div className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted">
								<span>
									Run <span className="mono text-ink">{s.optimization_run_id}</span>
								</span>
								<span>
									Generated <span className="mono text-ink">{formatClock(s.generated_at)}</span>
								</span>
								<span className="inline-flex items-center gap-1.5">
									<Layers size={12} /> {s.summary.combined_blocks} combined of {s.summary.total_blocks} blocks
								</span>
								<span>{s.summary.total_estimated_delay_min} min total estimated delay</span>
								<span>{s.summary.awaiting_approval} awaiting planner approval</span>
							</div>
							<GanttChart
								blocks={s.blocks}
								tasks={tasks.data ?? []}
								focusedSection={focusedSection}
								onFocusSection={focusSection}
								onSelectBlock={selectBlock}
								nowMinutes={nowMinutes}
							/>
						</>
					)}
				</AsyncBoundary>
			</Panel>

			<div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
				<Panel>
					<SectionHeader
						eyebrow="Queue"
						title="Upcoming maintenance"
						subtitle="Highest priority pending work, as scored by the priority model."
					/>
					<AsyncBoundary state={tasks} loadingMessage="Loading tasks…" isEmpty={() => upcoming.length === 0}>
						{() => (
							<div className="space-y-2.5">
								{upcoming.map((t) => (
									<TaskCard
										key={t.task_id}
										task={t}
										onSelect={selectTask}
										onHoverSection={focusSection}
										selected={selectedTaskId === t.task_id}
									/>
								))}
							</div>
						)}
					</AsyncBoundary>
				</Panel>

				<Panel>
					<SectionHeader
						eyebrow="System intelligence"
						title="How a maintenance need becomes an approved block"
						subtitle="Select any stage to see what data enters it, how it is processed and what it produces."
					/>
					<AsyncBoundary state={dashboard} loadingMessage="Loading pipeline state…">
						{(d) => <SystemFlow stages={d.pipeline} />}
					</AsyncBoundary>
				</Panel>
			</div>
		</div>
	)
}
