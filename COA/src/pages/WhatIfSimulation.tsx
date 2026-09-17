import { useState } from "react"
import { AlertTriangle, PlayCircle } from "lucide-react"
import { api } from "@/api"
import { Button, ErrorState, LoadingState, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { GanttChart } from "@/components/GanttChart"
import { useSchedule, useTasks } from "@/hooks/useApi"
import { useApp } from "@/store/AppContext"
import type { WhatIfRequest, WhatIfResponse } from "@/types"

const SCENARIOS: Array<{ value: WhatIfRequest["scenario"]; label: string }> = [
	{ value: "ASSET_FAILURE", label: "Sudden asset failure" },
	{ value: "TRAFFIC_SURGE", label: "Traffic surge" },
	{ value: "FACILITY_UNAVAILABLE", label: "Maintenance facility unavailable" },
	{ value: "CREW_SHORTAGE", label: "Crew shortage" },
]
const SECTIONS = ["A-B", "B-C", "C-D", "D-E", "E-F", "F-G"]
const SEVERITIES: Array<WhatIfRequest["severity"]> = ["Low", "Medium", "High"]

export function WhatIfSimulation() {
	const schedule = useSchedule()
	const tasks = useTasks()
	const { focusedSection, focusSection, selectBlock } = useApp()
	const [scenario, setScenario] = useState<WhatIfRequest["scenario"]>("ASSET_FAILURE")
	const [section, setSection] = useState(focusedSection ?? "E-F")
	const [severity, setSeverity] = useState<WhatIfRequest["severity"]>("High")
	const [result, setResult] = useState<WhatIfResponse | null>(null)
	const [running, setRunning] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const run = async () => {
		setRunning(true)
		setError(null)
		try {
			const res = await api.runWhatIf({ scenario, block_section: section, severity })
			setResult(res)
			focusSection(section)
		} catch (e) {
			setError(e instanceof Error ? e.message : "Simulation failed")
		} finally {
			setRunning(false)
		}
	}

	const selectClass = "mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] outline-none"

	return (
		<div className="space-y-6">
			<PageHeader
				title="What-if simulation"
				subtitle="Ask the optimization engine how today's plan would change under a disruption. Simulations never modify the live plan."
			/>

			<div className="grid gap-6 xl:grid-cols-[320px_1fr]">
				<Panel>
					<SectionHeader eyebrow="Inputs" title="Scenario" />
					<div className="space-y-3">
						<label className="block">
							<span className="label-xs">Scenario</span>
							<select
								value={scenario}
								onChange={(e) => setScenario(e.target.value as WhatIfRequest["scenario"])}
								className={selectClass}
							>
								{SCENARIOS.map((s) => (
									<option key={s.value} value={s.value}>
										{s.label}
									</option>
								))}
							</select>
						</label>
						<label className="block">
							<span className="label-xs">Affected section</span>
							<select value={section} onChange={(e) => setSection(e.target.value)} className={selectClass}>
								{SECTIONS.map((s) => (
									<option key={s}>{s}</option>
								))}
							</select>
						</label>
						<label className="block">
							<span className="label-xs">Severity</span>
							<select
								value={severity}
								onChange={(e) => setSeverity(e.target.value as WhatIfRequest["severity"])}
								className={selectClass}
							>
								{SEVERITIES.map((s) => (
									<option key={s}>{s}</option>
								))}
							</select>
						</label>
						<Button variant="primary" onClick={run} disabled={running} className="w-full">
							<PlayCircle size={15} /> {running ? "Running simulation…" : "Run simulation"}
						</Button>
						<p className="text-[11.5px] text-muted">Sends POST /api/what-if to the optimization engine.</p>
					</div>
				</Panel>

				<Panel>
					<SectionHeader eyebrow="Result" title="Original vs revised plan" />
					{running ? (
						<LoadingState message="Re-optimizing schedule under the scenario…" />
					) : error ? (
						<ErrorState message={error} onRetry={run} />
					) : !result ? (
						<p className="text-[13px] text-muted">
							Choose a scenario and run the simulation to compare it against today's approved plan.
						</p>
					) : (
						<div className="space-y-4">
							<div className="grid gap-3 sm:grid-cols-4">
								{[
									{ label: "Affected tasks", value: String(result.affected_tasks) },
									{
										label: "Delay change",
										value: `${result.estimated_delay_delta_min > 0 ? "+" : ""}${result.estimated_delay_delta_min} min`,
									},
									{ label: "Conflicts resolved", value: String(result.conflicts_resolved) },
									{ label: "Conflicts introduced", value: String(result.conflicts_introduced) },
								].map((m) => (
									<div key={m.label} className="rounded-lg border border-line px-3 py-2.5">
										<p className="label-xs">{m.label}</p>
										<p className="mono mt-1 text-[16px] font-semibold">{m.value}</p>
									</div>
								))}
							</div>

							<p className="flex items-start gap-2 rounded-lg border border-[#DE9255]/35 bg-[#DE9255]/[0.08] px-3 py-2.5 text-[12.5px] leading-relaxed">
								<AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#DE9255]" />
								{result.narrative}
							</p>

							<table className="w-full text-[12.5px]">
								<thead>
									<tr className="text-left text-muted">
										<th className="pb-2 font-medium">Block</th>
										<th className="pb-2 font-medium">Original</th>
										<th className="pb-2 font-medium">Revised</th>
										<th className="pb-2 font-medium">Section</th>
									</tr>
								</thead>
								<tbody>
									{result.comparison.map((c) => (
										<tr key={c.block_id} className="border-t border-line">
											<td className="mono py-1.5">{c.block_id}</td>
											<td className="mono py-1.5 text-muted">
												{c.original.start}–{c.original.end}
											</td>
											<td className="mono py-1.5">
												{c.revised.start}–{c.revised.end}
											</td>
											<td className="mono py-1.5 text-muted">{c.block_section}</td>
										</tr>
									))}
								</tbody>
							</table>

							<div>
								<p className="label-xs mb-2">Revised Gantt (simulation only)</p>
								<GanttChart
									blocks={result.revised_blocks}
									tasks={tasks.data ?? []}
									focusedSection={focusedSection}
									onFocusSection={focusSection}
									onSelectBlock={selectBlock}
								/>
							</div>
						</div>
					)}
				</Panel>
			</div>

			<Panel>
				<SectionHeader eyebrow="Baseline" title="Today's live plan for comparison" />
				{schedule.data ? (
					<GanttChart
						blocks={schedule.data.blocks}
						tasks={tasks.data ?? []}
						focusedSection={focusedSection}
						onFocusSection={focusSection}
					/>
				) : (
					<LoadingState message="Loading baseline plan…" />
				)}
			</Panel>
		</div>
	)
}
