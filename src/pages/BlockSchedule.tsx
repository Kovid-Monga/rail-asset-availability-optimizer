import { useEffect, useState } from "react"
import { api } from "@/api"
import { AsyncBoundary, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { ApprovalPanel } from "@/components/ApprovalPanel"
import { BlockStatusBadge } from "@/components/PriorityBadge"
import { useSchedule, useTasks } from "@/hooks/useApi"
import { ROLE_CAPABILITIES, useApp } from "@/store/AppContext"
import { cx, durationOf, formatDuration, pct } from "@/utils/display"

export function BlockSchedule() {
	const schedule = useSchedule()
	const tasks = useTasks()
	const { role, selectedBlockId, selectBlock, selectTask, focusSection } = useApp()
	const caps = ROLE_CAPABILITIES[role]
	const [busy, setBusy] = useState(false)

	useEffect(() => {
		if (!selectedBlockId && schedule.data?.blocks.length) selectBlock(schedule.data.blocks[0].block_id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [schedule.data])

	const act = async (fn: () => Promise<unknown>) => {
		setBusy(true)
		try {
			await fn()
			schedule.refetch()
		} finally {
			setBusy(false)
		}
	}

	return (
		<div>
			<PageHeader
				title="Block schedule"
				subtitle="Every block produced by the optimization engine, with the planner decision it is waiting on."
			/>

			<AsyncBoundary state={schedule} loadingMessage="Unable to retrieve latest schedule…">
				{(s) => {
					const selected = s.blocks.find((b) => b.block_id === selectedBlockId) ?? s.blocks[0]
					return (
						<div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
							<Panel>
								<SectionHeader
									eyebrow={`Plan ${s.plan_date}`}
									title={`${s.summary.total_blocks} blocks · ${s.summary.awaiting_approval} awaiting approval`}
								/>
								<ul className="space-y-2">
									{s.blocks.map((b) => (
										<li key={b.block_id}>
											<button
												type="button"
												onClick={() => {
													selectBlock(b.block_id)
													focusSection(b.block_section)
												}}
												className={cx(
													"w-full rounded-lg border px-3.5 py-3 text-left transition-colors",
													selected?.block_id === b.block_id
														? "border-[#5E9FE8]/55 bg-[#5E9FE8]/[0.07]"
														: "border-line hover:bg-white/[0.04]",
												)}
											>
												<div className="flex items-center justify-between gap-2">
													<span className="mono text-[12.5px] font-semibold">{b.block_id}</span>
													<BlockStatusBadge status={b.status} />
												</div>
												<p className="mono mt-1.5 text-[11.5px] text-muted">
													{b.block_section} · {b.start_time}–{b.end_time} ·{" "}
													{formatDuration(durationOf(b.start_time, b.end_time))} · {b.tasks.length} task
													{b.tasks.length > 1 ? "s" : ""} · compat {pct(b.compatibility_score)}
												</p>
											</button>
										</li>
									))}
								</ul>
							</Panel>

							<Panel>
								<SectionHeader eyebrow="Planner review" title="Approve, modify or reject" />
								{selected ? (
									<ApprovalPanel
										block={selected}
										tasks={tasks.data ?? []}
										canApprove={caps.approve}
										canOverride={caps.override}
										busy={busy}
										onSelectTask={selectTask}
										onApprove={(id) =>
											act(() => api.approveBlock({ block_id: id, decision: "APPROVE", planner: `${role} · Div Control` }))
										}
										onReject={(id) =>
											act(() => api.approveBlock({ block_id: id, decision: "REJECT", planner: `${role} · Div Control` }))
										}
										onOverride={(input) => act(() => api.overrideBlock({ ...input, planner: `${role} · Div Control` }))}
									/>
								) : null}
							</Panel>
						</div>
					)
				}}
			</AsyncBoundary>
		</div>
	)
}
