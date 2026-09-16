/* ==========================================================================
 * HUMAN-IN-THE-LOOP APPROVAL
 * AI Recommendation → Planner Review → Approve / Modify / Reject
 * Overrides are recorded and displayed (AI suggested X → Planner changed Y).
 * ========================================================================== */

import { useState } from "react"
import { AlertTriangle, Check, PencilLine, ShieldAlert, X } from "lucide-react"
import type { MaintenanceTask, ScheduleBlock } from "@/types"
import { Button } from "./ui"
import { BlockStatusBadge, DepartmentChip } from "./PriorityBadge"
import { cx, durationOf, formatDuration, pct } from "@/utils/display"

export function ApprovalPanel({
	block,
	tasks,
	canApprove,
	canOverride,
	busy,
	onApprove,
	onReject,
	onOverride,
	onSelectTask,
}: {
	block: ScheduleBlock
	tasks: MaintenanceTask[]
	canApprove: boolean
	canOverride: boolean
	busy?: boolean
	onApprove: (blockId: string) => void
	onReject: (blockId: string) => void
	onOverride: (input: {
		block_id: string
		new_start: string
		new_end: string
		assigned_team?: string
		remove_task_ids?: string[]
		reason: string
	}) => void
	onSelectTask?: (id: string) => void
}) {
	const [editing, setEditing] = useState(false)
	const [start, setStart] = useState(block.start_time)
	const [end, setEnd] = useState(block.end_time)
	const [team, setTeam] = useState(block.assigned_team)
	const [removed, setRemoved] = useState<string[]>([])
	const [reason, setReason] = useState("")

	const members = block.tasks
		.map((id) => tasks.find((t) => t.task_id === id))
		.filter((t): t is MaintenanceTask => Boolean(t))

	const toggleRemove = (id: string) =>
		setRemoved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<span className="mono text-[15px] font-semibold">{block.block_id}</span>
						<BlockStatusBadge status={block.status} />
						{block.is_combined ? (
							<span className="rounded-md border border-line bg-white/[0.04] px-2 py-0.5 text-[11px]">
								Combined ×{block.tasks.length}
							</span>
						) : null}
					</div>
					<p className="mono mt-1.5 text-[12.5px] text-muted">
						{block.block_section} · {block.line} · {block.start_time}–{block.end_time} (
						{formatDuration(durationOf(block.start_time, block.end_time))})
					</p>
				</div>
				<div className="flex gap-5 text-right">
					<div>
						<p className="mono text-[17px] font-semibold">{block.estimated_delay_min}<span className="ml-0.5 text-[11px] font-normal text-muted">min</span></p>
						<p className="label-xs">est. delay</p>
					</div>
					<div>
						<p className="mono text-[17px] font-semibold">{pct(block.compatibility_score)}</p>
						<p className="label-xs">compatibility</p>
					</div>
				</div>
			</div>

			{block.conflict_reason ? (
				<div className="flex gap-2.5 rounded-lg border border-[#E97366]/40 bg-[#E97366]/10 p-3.5">
					<AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#E97366]" />
					<div>
						<p className="text-[12.5px] font-semibold text-[#E97366]">Conflict detected</p>
						<p className="mt-1 text-[12.5px] leading-relaxed text-muted">{block.conflict_reason}</p>
					</div>
				</div>
			) : null}

			{block.planner_override ? (
				<div className="rounded-lg border border-[#DE9255]/35 bg-[#DE9255]/10 p-3.5">
					<p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#DE9255]">
						<ShieldAlert size={13} /> Manual override recorded
					</p>
					<p className="mono mt-1.5 text-[12.5px]">
						AI suggested {block.planner_override.original_start}–{block.planner_override.original_end}{" "}
						<span className="text-muted">→</span> Planner changed {block.planner_override.new_start}–
						{block.planner_override.new_end}
					</p>
					<p className="mt-1 text-[12px] text-muted">
						Reason: “{block.planner_override.reason}” · {block.planner_override.by}
					</p>
				</div>
			) : null}

			<div>
				<p className="label-xs mb-2">Tasks in this block</p>
				<ul className="space-y-1.5">
					{members.map((t) => (
						<li
							key={t.task_id}
							className={cx(
								"flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[12.5px]",
								removed.includes(t.task_id) && "opacity-45 line-through",
							)}
						>
							<button type="button" className="mono font-semibold" onClick={() => onSelectTask?.(t.task_id)}>
								{t.task_id}
							</button>
							<DepartmentChip department={t.department} />
							<span className="truncate text-muted">{t.reason_description}</span>
							{editing ? (
								<button
									type="button"
									onClick={() => toggleRemove(t.task_id)}
									className="ml-auto shrink-0 rounded border border-line px-2 py-0.5 text-[11px] text-muted hover:text-ink"
								>
									{removed.includes(t.task_id) ? "keep" : "remove"}
								</button>
							) : null}
						</li>
					))}
				</ul>
			</div>

			{editing ? (
				<div className="space-y-3 rounded-lg border border-line bg-white/[0.03] p-3.5">
					<p className="label-xs">Planner modification</p>
					<div className="grid gap-3 sm:grid-cols-3">
						<label className="block">
							<span className="label-xs">Start</span>
							<input
								type="time"
								value={start}
								onChange={(e) => setStart(e.target.value)}
								className="mono mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] outline-none"
							/>
						</label>
						<label className="block">
							<span className="label-xs">End</span>
							<input
								type="time"
								value={end}
								onChange={(e) => setEnd(e.target.value)}
								className="mono mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] outline-none"
							/>
						</label>
						<label className="block">
							<span className="label-xs">Assigned team</span>
							<input
								value={team}
								onChange={(e) => setTeam(e.target.value)}
								className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] outline-none"
							/>
						</label>
					</div>
					<label className="block">
						<span className="label-xs">Reason for override (recorded in the audit trail)</span>
						<input
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="e.g. Train movement conflict with 12951 UP"
							className="mt-1 h-10 w-full rounded-lg border border-line bg-canvas px-3 text-[13px] outline-none placeholder:text-muted"
						/>
					</label>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="primary"
							disabled={!reason.trim() || busy}
							onClick={() =>
								onOverride({
									block_id: block.block_id,
									new_start: start,
									new_end: end,
									assigned_team: team,
									remove_task_ids: removed,
									reason: reason.trim(),
								})
							}
						>
							Save override & approve
						</Button>
						<Button size="sm" onClick={() => setEditing(false)}>
							Cancel
						</Button>
					</div>
				</div>
			) : null}

			<div className="flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
				{block.requires_approval ? (
					<>
						<Button
							size="sm"
							variant="positive"
							disabled={!canApprove || busy}
							title={canApprove ? undefined : "Your role cannot approve blocks"}
							onClick={() => onApprove(block.block_id)}
						>
							<Check size={14} /> Approve
						</Button>
						<Button size="sm" disabled={!canOverride || busy} onClick={() => setEditing((v) => !v)}>
							<PencilLine size={14} /> Modify
						</Button>
						<Button size="sm" variant="danger" disabled={!canApprove || busy} onClick={() => onReject(block.block_id)}>
							<X size={14} /> Reject
						</Button>
						<span className="ml-auto text-[11.5px] text-muted">Waiting for planner approval.</span>
					</>
				) : (
					<span className="text-[12.5px] text-muted">
						No approval pending — this block is {block.status.replace("_", " ").toLowerCase()}.
					</span>
				)}
			</div>
		</div>
	)
}
