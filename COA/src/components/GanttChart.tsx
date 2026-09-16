/* ==========================================================================
 * GANTT / BLOCK SCHEDULE
 * --------------------------------------------------------------------------
 * Y axis = block section, X axis = time of day.
 * Combined blocks (multiple compatible tasks in the same physical section)
 * render as ONE wide bar with per-department stripes, a "COMBINED" tag and
 * the member task IDs, so the merge is visually obvious.
 * ========================================================================== */

import { useMemo, useState } from "react"
import { Layers, Users } from "lucide-react"
import type { MaintenanceTask, ScheduleBlock } from "@/types"
import { BLOCK_STATUS_STYLE, DEPARTMENT_STYLE, cx, durationOf, formatDuration, pct, toMinutes } from "@/utils/display"
import { BlockStatusBadge } from "./PriorityBadge"

const DAY_START = 6 * 60
const DAY_END = 20 * 60
const SPAN = DAY_END - DAY_START
const ROW_H = 62
const LABEL_W = 92

const ticks = Array.from({ length: 8 }, (_, i) => DAY_START + i * 120)
const fmtTick = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

export function GanttChart({
	blocks,
	tasks,
	onSelectBlock,
	selectedBlockId,
	focusedSection,
	onFocusSection,
	nowMinutes,
}: {
	blocks: ScheduleBlock[]
	tasks: MaintenanceTask[]
	onSelectBlock?: (blockId: string) => void
	selectedBlockId?: string | null
	focusedSection?: string | null
	onFocusSection?: (section: string | null) => void
	nowMinutes?: number
}) {
	const [hovered, setHovered] = useState<ScheduleBlock | null>(null)

	const sections = useMemo(
		() => Array.from(new Set(blocks.map((b) => b.block_section))).sort(),
		[blocks],
	)

	const left = (start: string) => ((toMinutes(start) - DAY_START) / SPAN) * 100
	const width = (start: string, end: string) => (durationOf(start, end) / SPAN) * 100

	return (
		<div className="relative">
			{/* time axis */}
			<div className="flex" style={{ paddingLeft: LABEL_W }}>
				<div className="relative h-6 flex-1">
					{ticks.map((t) => (
						<span
							key={t}
							className="mono absolute -translate-x-1/2 text-[10.5px] text-muted"
							style={{ left: `${((t - DAY_START) / SPAN) * 100}%` }}
						>
							{fmtTick(t)}
						</span>
					))}
				</div>
			</div>

			<div className="flex">
				{/* section labels */}
				<div className="shrink-0" style={{ width: LABEL_W }}>
					{sections.map((s) => (
						<div
							key={s}
							style={{ height: ROW_H }}
							onMouseEnter={() => onFocusSection?.(s)}
							onMouseLeave={() => onFocusSection?.(null)}
							className={cx(
								"flex items-center border-b border-line pr-3 text-right",
								focusedSection === s && "bg-white/[0.03]",
							)}
						>
							<div className="w-full">
								<p className="mono text-[12.5px] font-semibold">{s}</p>
								<p className="text-[10.5px] text-muted">section</p>
							</div>
						</div>
					))}
				</div>

				{/* rows */}
				<div className="relative flex-1 border-l border-line">
					{/* vertical grid */}
					{ticks.map((t) => (
						<span
							key={t}
							aria-hidden
							className="absolute top-0 h-full w-px"
							style={{ left: `${((t - DAY_START) / SPAN) * 100}%`, background: "var(--grid)" }}
						/>
					))}

					{/* now marker */}
					{nowMinutes !== undefined && nowMinutes > DAY_START && nowMinutes < DAY_END ? (
						<span
							aria-hidden
							className="absolute top-0 z-20 h-full w-px bg-[#E97366]/70"
							style={{ left: `${((nowMinutes - DAY_START) / SPAN) * 100}%` }}
						/>
					) : null}

					{sections.map((s) => (
						<div
							key={s}
							style={{ height: ROW_H }}
							onMouseEnter={() => onFocusSection?.(s)}
							onMouseLeave={() => onFocusSection?.(null)}
							className={cx("relative border-b border-line", focusedSection === s && "bg-white/[0.03]")}
						>
							{blocks
								.filter((b) => b.block_section === s)
								.map((b) => {
									const style = BLOCK_STATUS_STYLE[b.status]
									const selected = selectedBlockId === b.block_id
									return (
										<button
											key={b.block_id}
											type="button"
											onClick={() => onSelectBlock?.(b.block_id)}
											onMouseEnter={() => setHovered(b)}
											onMouseLeave={() => setHovered(null)}
											className={cx(
												"group absolute top-2 flex h-[46px] animate-fadeUp flex-col justify-center overflow-hidden rounded-lg border px-2.5 text-left transition-all",
												style.bg,
												selected ? "z-10 ring-2 ring-white/25" : "hover:brightness-110",
											)}
											style={{
												left: `${left(b.start_time)}%`,
												width: `calc(${width(b.start_time, b.end_time)}% - 4px)`,
												borderColor: style.hex,
												borderStyle: b.status === "CONFLICT" ? "dashed" : "solid",
												boxShadow: selected ? `0 0 0 1px ${style.hex}` : undefined,
											}}
											title={`${b.block_id} · ${b.start_time}–${b.end_time}`}
										>
											{/* department stripes make a combined block obvious */}
											<span aria-hidden className="absolute inset-y-0 left-0 flex w-1.5 flex-col">
												{b.departments.map((d) => (
													<span key={d} className="flex-1" style={{ background: DEPARTMENT_STYLE[d].hex }} />
												))}
											</span>

											<span className="ml-1.5 flex items-center gap-1.5 truncate text-[11.5px] font-semibold">
												{b.is_combined ? <Layers size={11} style={{ color: style.hex }} /> : null}
												<span className="mono">{b.block_id}</span>
												<span className="truncate opacity-75">
													{b.start_time}–{b.end_time}
												</span>
												{b.is_combined ? (
													<span className="hidden rounded border border-current/40 px-1 text-[9px] uppercase tracking-wider opacity-90 lg:inline">
														combined ×{b.tasks.length}
													</span>
												) : null}
											</span>
											<span className="mono ml-1.5 truncate text-[10.5px] text-muted">
												{b.tasks.join(" + ")} · {b.line}
											</span>
										</button>
									)
								})}
						</div>
					))}
				</div>
			</div>

			{/* hover card */}
			{hovered ? (
				<div className="pointer-events-none absolute bottom-2 right-2 z-30 w-[290px] rounded-lg border border-line bg-raised/95 p-3.5 shadow-soft backdrop-blur">
					<div className="flex items-center justify-between gap-2">
						<span className="mono text-[12.5px] font-semibold">{hovered.block_id}</span>
						<BlockStatusBadge status={hovered.status} />
					</div>
					<p className="mono mt-2 text-[12px] text-muted">
						{hovered.block_section} · {hovered.line} · {hovered.start_time}–{hovered.end_time} (
						{formatDuration(durationOf(hovered.start_time, hovered.end_time))})
					</p>
					<p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
						<Users size={12} /> {hovered.assigned_team}
					</p>
					<div className="mt-2 flex flex-wrap gap-x-3 text-[11.5px] text-muted">
						<span>tasks {hovered.tasks.length}</span>
						<span>delay {hovered.estimated_delay_min} min</span>
						<span>compat {pct(hovered.compatibility_score)}</span>
					</div>
					<p className="mt-2 text-[11px] text-muted">
						{hovered.tasks
							.map((id) => tasks.find((t) => t.task_id === id))
							.filter(Boolean)
							.map((t) => `${t!.task_id} ${t!.department}`)
							.join(" · ")}
					</p>
					<p className="mt-2 text-[11px] text-muted">Click the block for the full plan and approval actions.</p>
				</div>
			) : null}

			{/* legend */}
			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
				{Object.entries(BLOCK_STATUS_STYLE).map(([k, v]) => (
					<span key={k} className="inline-flex items-center gap-1.5">
						<span aria-hidden className="h-2 w-2 rounded-[2px]" style={{ background: v.hex }} />
						{v.label}
					</span>
				))}
				<span className="inline-flex items-center gap-1.5">
					<Layers size={11} /> combined block
				</span>
			</div>
		</div>
	)
}
