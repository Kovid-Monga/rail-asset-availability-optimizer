import { useState } from "react"
import { ArrowDown, ArrowUp, BrainCircuit, Check, ChevronRight, Clock } from "lucide-react"
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
		<article className="overflow-hidden rounded-[10px] border border-[#5E9FE8]/35 bg-[#5E9FE8]/[0.045]">
			<div className="flex items-start justify-between gap-3 border-b border-[#5E9FE8]/20 px-4 py-3">
				<div className="flex items-start gap-2.5">
					<span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[#5E9FE8]/15 text-accent">
						<BrainCircuit size={15} />
					</span>
					<div>
						<p className="label-xs text-accent">AI Recommended · Planner approval required</p>
						<h3 className="mt-1 text-[14.5px] font-semibold tracking-tight">{r.title}</h3>
					</div>
				</div>
				<div className="text-right">
					<p className="mono text-[17px] font-semibold text-accent">{pct(r.confidence)}</p>
					<p className="label-xs">confidence</p>
				</div>
			</div>

			<div className="grid gap-4 px-4 py-4 lg:grid-cols-[1.1fr_1fr]">
				<div>
					<p className="label-xs mb-2">Tasks in this recommendation</p>
					<ul className="flex flex-wrap gap-1.5">
						{r.task_ids.map((id) => (
							<li key={id}>
								<button
									type="button"
									onClick={() => onSelectTask?.(id)}
									className="mono rounded-md border border-line bg-white/[0.04] px-2 py-1 text-[11.5px] transition-colors hover:bg-white/[0.09]"
								>
									{id}
								</button>
							</li>
						))}
					</ul>
					<p className="mt-3 flex items-center gap-2 text-[13px]">
						<Clock size={13} className="text-muted" />
						Recommended window{" "}
						<span className="mono font-semibold">
							{r.recommended_window.start}–{r.recommended_window.end}
						</span>
						<span className="mono text-muted">· {r.block_section}</span>
					</p>
				</div>

				<div>
					<p className="label-xs mb-2">Expected benefits</p>
					<ul className="space-y-1.5">
						{r.benefits.map((b) => (
							<li key={b.label} className="flex items-center gap-2 text-[12.5px]">
								{b.direction === "down" ? (
									<ArrowDown size={13} className="text-[#72BC8F]" />
								) : (
									<ArrowUp size={13} className="text-[#72BC8F]" />
								)}
								<span className="mono font-semibold text-[#72BC8F]">{b.delta}</span>
								<span className="text-muted">{b.label}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{showWhy ? (
				<div className="mx-4 mb-4 rounded-lg border border-line bg-white/[0.03] p-3.5">
					<p className="label-xs mb-1.5">Explanation from the models</p>
					<p className="text-[13px] leading-relaxed text-muted">{r.explanation}</p>
				</div>
			) : null}

			<footer className="flex flex-wrap items-center gap-2 border-t border-[#5E9FE8]/20 px-4 py-3">
				<Button size="sm" onClick={() => setShowWhy((v) => !v)}>
					{showWhy ? "Hide explanation" : "View explanation"}
					<ChevronRight size={13} className={cx("transition-transform", showWhy && "rotate-90")} />
				</Button>
				{applied ? (
					<span className="inline-flex items-center gap-1.5 rounded-lg border border-[#72BC8F]/35 bg-[#72BC8F]/12 px-3 py-2 text-[12.5px] font-medium text-[#72BC8F]">
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
