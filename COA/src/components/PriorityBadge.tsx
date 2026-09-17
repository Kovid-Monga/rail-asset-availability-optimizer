import type { BlockStatus, Department, PriorityCategory } from "@/types"
import { BLOCK_STATUS_STYLE, DEPARTMENT_STYLE, PRIORITY_STYLE, cx } from "@/utils/display"

/** Priority is never computed here — this renders the model's category. */
export function PriorityBadge({
	priority = "Normal",
	score,
	size = "sm",
}: {
	priority?: PriorityCategory
	score?: number
	size?: "sm" | "lg"
}) {
	if (!score || score <= 0) {
		return (
			<span
				className={cx(
					"inline-flex shrink-0 items-center gap-1.5 rounded-md border font-semibold tracking-wide border-slate-200 bg-slate-100 text-slate-600",
					size === "lg" ? "px-3 py-1.5 text-[13px]" : "px-2 py-0.5 text-[11px]",
				)}
			>
				<span aria-hidden className="text-[9px] leading-none">
					⏳
				</span>
				Pending AI classification
			</span>
		)
	}

	const s = PRIORITY_STYLE[priority]
	return (
		<span
			className={cx(
				"inline-flex shrink-0 items-center gap-1.5 rounded-md border font-semibold tracking-wide",
				s.text,
				s.bg,
				s.border,
				size === "lg" ? "px-3 py-1.5 text-[13px]" : "px-2 py-0.5 text-[11px]",
			)}
		>
			<span aria-hidden className="text-[9px] leading-none">
				{s.icon}
			</span>
			{s.label}
			{score !== undefined ? <span className="mono opacity-80">{score}</span> : null}
		</span>
	)
}

export function BlockStatusBadge({ status }: { status: BlockStatus }) {
	const s = BLOCK_STATUS_STYLE[status]
	return (
		<span
			className={cx(
				"inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
				s.text,
				s.bg,
				s.border,
			)}
		>
			<span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: s.hex }} />
			{s.label}
		</span>
	)
}

export function DepartmentChip({ department, withSystem }: { department: Department; withSystem?: boolean }) {
	const d = DEPARTMENT_STYLE[department]
	return (
		<span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-raised px-2 py-0.5 text-[11px]">
			<span aria-hidden className="h-2 w-2 rounded-[2px]" style={{ background: d.hex }} />
			<span className="font-medium">{department}</span>
			{withSystem ? <span className="mono text-muted">{d.system}</span> : null}
		</span>
	)
}
