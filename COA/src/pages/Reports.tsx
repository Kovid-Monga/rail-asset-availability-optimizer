import { AsyncBoundary, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { AvailabilityChart, BacklogChart, DelayTrendChart } from "@/charts/Charts"
import { KPIGrid } from "@/components/KPIGrid"
import { useDashboard, useSchedule } from "@/hooks/useApi"
import { formatClock, pct } from "@/utils/display"

export function Reports() {
	const dashboard = useDashboard()
	const schedule = useSchedule()

	return (
		<div className="space-y-6">
			<PageHeader
				title="Network health & reports"
				subtitle="Each chart answers one operational question: are we losing time, are assets available, and where is the backlog concentrated?"
			/>

			<AsyncBoundary state={dashboard} loadingMessage="Loading division metrics…">
				{(d) => (
					<>
						<KPIGrid kpis={d.kpis} />

						<div className="grid gap-6 xl:grid-cols-2">
							<Panel>
								<SectionHeader
									eyebrow="Punctuality"
									title="Train delay attributable to blocks"
									subtitle="Minutes of delay per day across the division."
								/>
								<DelayTrendChart data={d.delay_trend} />
							</Panel>
							<Panel>
								<SectionHeader
									eyebrow="Assets"
									title="Asset availability"
									subtitle="Share of assets fit for service, day by day."
								/>
								<AvailabilityChart data={d.availability_trend} />
							</Panel>
						</div>

						<div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
							<Panel>
								<SectionHeader
									eyebrow="Backlog"
									title="Open maintenance by department"
									subtitle="Open needs vs those already scheduled into a block."
								/>
								<BacklogChart data={d.backlog_by_department} />
							</Panel>
							<Panel>
								<SectionHeader eyebrow="Plan" title="Optimization run summary" />
								<AsyncBoundary state={schedule} loadingMessage="Loading plan…">
									{(s) => (
										<dl className="divide-y divide-line text-[13px]">
											{[
												["Plan date", s.plan_date],
												["Run", s.optimization_run_id],
												["Engine", s.engine_version],
												["Generated", formatClock(s.generated_at)],
												["Blocks", `${s.summary.total_blocks} (${s.summary.combined_blocks} combined)`],
												["Estimated delay", `${s.summary.total_estimated_delay_min} min`],
												["Conflicts", String(s.summary.conflicts)],
												["Awaiting approval", String(s.summary.awaiting_approval)],
												["System status", `${d.system_status} · updated ${formatClock(d.last_updated)}`],
												[
													"Mean compatibility",
													pct(
														s.blocks.reduce((a, b) => a + b.compatibility_score, 0) / Math.max(1, s.blocks.length),
													),
												],
											].map(([k, v]) => (
												<div key={k} className="flex items-center justify-between gap-4 py-2">
													<dt className="text-muted">{k}</dt>
													<dd className="mono">{v}</dd>
												</div>
											))}
										</dl>
									)}
								</AsyncBoundary>
							</Panel>
						</div>
					</>
				)}
			</AsyncBoundary>
		</div>
	)
}
