/* Interactive "System Intelligence" pipeline diagram. Clicking a stage shows
   what data enters it, how it is processed and what it outputs. */

import { useState } from "react"
import { ArrowRight, CircleDot } from "lucide-react"
import type { PipelineStage } from "@/types"
import { cx } from "@/utils/display"

const STATUS_HEX: Record<PipelineStage["status"], string> = {
	OK: "#72BC8F",
	RUNNING: "#5E9FE8",
	STALE: "#EAC26B",
	ERROR: "#E97366",
}

export function SystemFlow({ stages }: { stages: PipelineStage[] }) {
	const [activeId, setActiveId] = useState(stages[0]?.id)
	const active = stages.find((s) => s.id === activeId) ?? stages[0]

	return (
		<div>
			<div className="flex flex-wrap items-center gap-1.5">
				{stages.map((s, i) => (
					<div key={s.id} className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={() => setActiveId(s.id)}
							className={cx(
								"rounded-lg border px-3 py-2 text-left transition-colors",
								s.id === active?.id
									? "border-[#5E9FE8]/50 bg-[#5E9FE8]/10"
									: "border-line bg-white/[0.02] hover:bg-white/[0.06]",
							)}
						>
							<span className="flex items-center gap-1.5 text-[12.5px] font-medium">
								<CircleDot size={11} style={{ color: STATUS_HEX[s.status] }} />
								{s.label}
							</span>
							{s.metric ? <span className="mono mt-0.5 block text-[10.5px] text-muted">{s.metric}</span> : null}
						</button>
						{i < stages.length - 1 ? <ArrowRight size={13} className="text-muted" /> : null}
					</div>
				))}
			</div>

			{active ? (
				<div className="mt-4 grid gap-4 rounded-lg border border-line bg-white/[0.03] p-4 sm:grid-cols-3">
					<Column title="Data in" items={active.inputs} />
					<Column title="Processing" items={active.processing} />
					<Column title="Output" items={active.outputs} />
				</div>
			) : null}
		</div>
	)
}

function Column({ title, items }: { title: string; items: string[] }) {
	return (
		<div>
			<p className="label-xs mb-2">{title}</p>
			<ul className="space-y-1.5">
				{items.map((t) => (
					<li key={t} className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
						<span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--muted)]" />
						{t}
					</li>
				))}
			</ul>
		</div>
	)
}
