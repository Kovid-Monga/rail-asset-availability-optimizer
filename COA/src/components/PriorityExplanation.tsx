import { Info } from "lucide-react"
import type { PriorityExplanation as Explanation } from "@/types"
import { PRIORITY_STYLE } from "@/utils/display"
import { PriorityBadge } from "./PriorityBadge"

/**
 * Renders the priority model's OUTPUT. The score and factor scores are read
 * straight from the backend payload — the frontend does not add them up.
 */
export function PriorityExplanation({ explanation }: { explanation: Explanation }) {
	const hex = PRIORITY_STYLE[explanation.category].hex

	return (
		<div>
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="label-xs">AI Priority</p>
				<span className="mono text-[11px] text-muted">{explanation.model_version}</span>
			</div>

			<div className="flex items-center gap-4">
				<div className="flex items-baseline gap-1">
					<span className="mono text-[34px] font-semibold leading-none" style={{ color: hex }}>
						{explanation.score}
					</span>
					<span className="text-[13px] text-muted">/ 100</span>
				</div>
				<PriorityBadge priority={explanation.category} score={explanation.score} size="lg" />
			</div>

			<ul className="mt-4 space-y-2.5">
				{explanation.factors.map((f) => (
					<li key={f.label}>
						<div className="flex items-center justify-between gap-3 text-[12.5px]">
							<span>
								{f.label}
								{f.value ? <span className="ml-1.5 text-muted">({f.value})</span> : null}
							</span>
							<span className="mono text-muted">
								<span className="text-ink">{f.score}</span>/{f.max}
							</span>
						</div>
						<div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-accentSoft">
							<div
								className="h-full animate-grow rounded-full"
								style={{ width: `${(f.score / f.max) * 100}%`, background: hex, transformOrigin: "left" }}
							/>
						</div>
					</li>
				))}
			</ul>

			<div className="mt-4 rounded-lg border border-line bg-raised p-3.5">
				<p className="label-xs mb-1.5 flex items-center gap-1.5">
					<Info size={12} /> Why this task was prioritized
				</p>
				<p className="text-[13px] leading-relaxed text-muted">{explanation.reasoning}</p>
				<p className="mt-2 text-[11.5px] text-muted">
					Reason severity derived from reason code + description:{" "}
					<span className="font-medium text-ink">{explanation.derived_reason_severity}</span>
				</p>
			</div>
		</div>
	)
}
