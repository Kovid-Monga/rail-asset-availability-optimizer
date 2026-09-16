import { Activity } from "lucide-react"
import type { LiveEvent } from "@/hooks/useLiveUpdates"
import { SectionHeader } from "./ui"
import { formatClock } from "@/utils/display"

const SEVERITY = {
	info: { hex: "#5E9FE8", label: "INFO" },
	warn: { hex: "#DE9255", label: "WARN" },
	critical: { hex: "#E97366", label: "CRIT" },
} as const

export function LiveFeed({ events, enabled }: { events: LiveEvent[]; enabled: boolean }) {
	return (
		<div>
			<SectionHeader
				eyebrow="Operations feed"
				title="Live activity"
				action={
					<span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted">
						<span
							aria-hidden
							className="h-1.5 w-1.5 animate-pulseDot rounded-full"
							style={{ background: enabled ? "#72BC8F" : "#8b8b8b" }}
						/>
						{enabled ? "streaming" : "idle"}
					</span>
				}
			/>
			{events.length === 0 ? (
				<p className="flex items-center gap-2 text-[12.5px] text-muted">
					<Activity size={13} />
					{enabled ? "Waiting for the next operational event…" : "Live updates are disabled."}
				</p>
			) : (
				<ul className="space-y-2">
					{events.map((e) => {
						const s = SEVERITY[e.severity]
						return (
							<li
								key={e.id}
								className="animate-fadeUp rounded-lg border border-line bg-white/[0.02] px-3 py-2"
								style={{ borderLeft: `2px solid ${s.hex}` }}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="label-xs" style={{ color: s.hex }}>
										{s.label}
									</span>
									<span className="mono text-[11px] text-muted">{formatClock(e.at)}</span>
								</div>
								<p className="mt-1 text-[12.5px] leading-snug">{e.message}</p>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
