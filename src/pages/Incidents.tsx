import { useState } from "react"
import { api } from "@/api"
import { AsyncBoundary, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { IncidentForm, IncidentStages } from "@/components/IncidentForm"
import { PriorityBadge } from "@/components/PriorityBadge"
import { useIncidents } from "@/hooks/useApi"
import { formatClock } from "@/utils/display"

export function Incidents() {
	const incidents = useIncidents()
	const [submitting, setSubmitting] = useState(false)
	const [submitted, setSubmitted] = useState<string | null>(null)

	return (
		<div>
			<PageHeader
				title="Incident reporting"
				subtitle="Anyone on the ground can raise a defect. Reports join the same prioritization and scheduling pipeline as system-generated needs."
			/>
			<div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
				<Panel>
					<SectionHeader eyebrow="Report" title="Raise a new issue" />
					<IncidentForm
						submitting={submitting}
						submitted={submitted}
						onSubmit={async (input) => {
							setSubmitting(true)
							try {
								const created = await api.createIncident(input)
								setSubmitted(created.incident_id)
								incidents.refetch()
							} finally {
								setSubmitting(false)
							}
						}}
					/>
				</Panel>

				<Panel>
					<SectionHeader eyebrow="Pipeline" title="Reported issues" />
					<AsyncBoundary
						state={incidents}
						loadingMessage="Loading reported issues…"
						emptyMessage="No issues reported today."
						isEmpty={(list) => list.length === 0}
					>
						{(list) => (
							<ul className="space-y-2.5">
								{list.map((i) => (
									<li key={i.incident_id} className="rounded-[10px] border border-line px-4 py-3">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="mono text-[12.5px] font-semibold">
													{i.incident_id} · {i.issue_type}
												</p>
												<p className="mt-1 text-[13px]">{i.description}</p>
												<p className="mono mt-1 text-[11.5px] text-muted">
													{i.block_section} · {i.work_location} · {i.reported_by} · {formatClock(i.reported_at)}
												</p>
											</div>
											{i.priority ? <PriorityBadge priority={i.priority} /> : null}
										</div>
										<div className="mt-2.5 border-t border-line pt-2.5">
											<IncidentStages stage={i.stage} />
										</div>
									</li>
								))}
							</ul>
						)}
					</AsyncBoundary>
				</Panel>
			</div>
		</div>
	)
}
