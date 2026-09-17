import { useState } from "react"
import { ArrowDown, ArrowUp, Check, ChevronRight, Clock, Cpu, FileText } from "lucide-react"
import type { AIRecommendation as Rec } from "@/types"
import { Button } from "./ui"
import { cx, pct } from "@/utils/display"

export function AIRecommendationCard({
	recommendation,
	canApprove,
	onApply,
	onSelectTask,
	applying,
}: {
	recommendation: Rec
	canApprove: boolean
	onApply?: (id: string) => void
	onSelectTask?: (id: string) => void
	applying?: boolean
}) {
	const [showWhy, setShowWhy] = useState(false)
	const r = recommendation
	const applied = r.status === "APPROVED"

	return (
		<article className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
			<div className="border-b border-line px-4 py-3.5">
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accentSoft text-accent">
							<Cpu size={13} />
						</span>
						<p className="text-[10px] font-bold tracking-wider text-accent uppercase">
							AI RECOMMENDED · PLANNER APPROVAL REQUIRED
						</p>
					</div>
					<span className="text-[11px] font-bold text-accent uppercase">
						{pct(r.confidence)} CONFIDENCE
					</span>
				</div>
				<h3 className="mt-2 flex items-center justify-between text-[15px] font-bold tracking-tight text-ink">
					<span>{r.title}</span>
					<ChevronRight size={17} className="text-accent shrink-0" />
				</h3>
			</div>

			<div className="grid gap-4 px-4 py-3.5 lg:grid-cols-2">
				<div>
					<p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
						Tasks in this recommendation
					</p>
					<div className="flex items-center gap-2 text-[13px] font-bold text-ink mb-2">
						<FileText size={16} className="text-accent" />
						<span>{r.task_ids.length} tasks</span>
					</div>
					<ul className="flex flex-wrap gap-1.5">
						{r.task_ids.map((id) => (
							<li key={id}>
								<button
									type="button"
									onClick={() => onSelectTask?.(id)}
									className="mono rounded border border-line bg-raised px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-accentSoft text-ink"
								>
									{id}
								</button>
							</li>
						))}
					</ul>
					<p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted">
						<Clock size={12} />
						<span>{r.recommended_window.start}–{r.recommended_window.end} · {r.block_section}</span>
					</p>
				</div>

				<div>
					<p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
						Expected benefits
					</p>
					<ul className="space-y-1 text-[12px] font-medium text-ink">
						<li className="flex items-center gap-1.5">
							<Check size={13} className="text-[#1E7D45] shrink-0" /> Reduced downtime
						</li>
						<li className="flex items-center gap-1.5">
							<Check size={13} className="text-[#1E7D45] shrink-0" /> Better resource utilization
						</li>
						<li className="flex items-center gap-1.5">
							<Check size={13} className="text-[#1E7D45] shrink-0" /> Improved punctuality
						</li>
					</ul>
				</div>
			</div>

			{showWhy ? (
				<div className="mx-4 mb-4 rounded-lg border border-line bg-raised p-3.5">
					<p className="label-xs mb-1.5">Explanation from the models</p>
					<p className="text-[13px] leading-relaxed text-muted">{r.explanation}</p>
				</div>
			) : null}

			<footer className="flex flex-wrap items-center gap-2 border-t border-[#2A5CAA]/20 px-4 py-3">
				<Button size="sm" onClick={() => setShowWhy((v) => !v)}>
					{showWhy ? "Hide explanation" : "View explanation"}
					<ChevronRight size={13} className={cx("transition-transform", showWhy && "rotate-90")} />
				</Button>
				{applied ? (
					<span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E7D45]/45 bg-[#1E7D45]/10 px-3 py-2 text-[12.5px] font-medium text-[#1E7D45]">
						<Check size={13} /> Applied by planner
					</span>
				) : (
					<Button
						size="sm"
						variant="primary"
						disabled={!canApprove || applying}
						title={canApprove ? undefined : "Only a supervisor can apply recommendations"}
						onClick={() => onApply?.(r.recommendation_id)}
					>
						{applying ? "Applying…" : "Apply recommendation"}
					</Button>
				)}
				<span className="ml-auto text-[11px] text-muted">
					Advisory only — no block is published to BDMS without planner approval.
				</span>
			</footer>
		</article>
	)
}
