import {
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Clock,
	Cog,
	Layers,
	Minus,
	ShieldCheck,
	TrainFront,
	Wrench,
} from "lucide-react"
import type { KPI } from "@/types"
import { cx } from "@/utils/display"

const INTENT: Record<NonNullable<KPI["intent"]>, string> = {
	neutral: "text-ink",
	positive: "text-[#1E7D45]",
	attention: "text-[#C2610F]",
	danger: "text-[#C0392B]",
}

function getKpiIcons(id: string) {
	switch (id) {
		case "tasks_active":
			return { BadgeIcon: Wrench, WatermarkIcon: TrainFront }
		case "tasks_critical":
			return { BadgeIcon: AlertTriangle, WatermarkIcon: AlertTriangle }
		case "blocks_scheduled":
			return { BadgeIcon: Layers, WatermarkIcon: Layers }
		case "train_delay_est":
			return { BadgeIcon: TrainFront, WatermarkIcon: Clock }
		case "asset_availability":
			return { BadgeIcon: ShieldCheck, WatermarkIcon: Cog }
		case "conflicts_detected":
			return { BadgeIcon: AlertTriangle, WatermarkIcon: AlertTriangle }
		default:
			return { BadgeIcon: Wrench, WatermarkIcon: Cog }
	}
}

export function KPIGrid({ kpis }: { kpis: KPI[] }) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
			{kpis.map((k) => {
				const up = (k.delta ?? 0) > 0
				const { BadgeIcon, WatermarkIcon } = getKpiIcons(k.id)

				// Delta color: for delay & conflicts, down is good (positive), up is bad (attention/danger)
				const isInverseMetric = k.id === "train_delay_est" || k.id === "conflicts_detected"
				const deltaPositive = isInverseMetric ? (k.delta ?? 0) < 0 : (k.delta ?? 0) > 0
				const deltaColor = !k.delta
					? "text-muted"
					: deltaPositive
					? "text-[#1E7D45]"
					: "text-[#C2610F]"

				return (
					<div
						key={k.id}
						className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface p-3.5 shadow-soft transition-all duration-150 hover:shadow-md"
						title={k.hint}
					>
						{/* Large faint background watermark icon in bottom right */}
						<div
							aria-hidden
							className="pointer-events-none absolute -bottom-1 -right-1 text-slate-300/[0.35] dark:text-white/[0.06]"
						>
							<WatermarkIcon size={64} strokeWidth={1.2} />
						</div>

						{/* Top row: Circular icon badge + label */}
						<div className="flex items-start gap-2.5">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accentSoft text-accent shadow-xs">
								<BadgeIcon size={16} />
							</div>
							<p className="pt-0.5 text-[10.5px] font-bold uppercase tracking-wider text-muted leading-tight">
								{k.label}
							</p>
						</div>

						{/* Metric value */}
						<div className="mt-3">
							<p className={cx("mono text-[26px] font-bold leading-none tracking-tight", INTENT[k.intent ?? "neutral"])}>
								{k.value}
								{k.unit ? <span className="ml-1 text-[13px] font-medium text-muted">{k.unit}</span> : null}
							</p>

							{/* Delta indicator */}
							<p className={cx("mt-2 flex items-center gap-1 text-[11.5px] font-medium", deltaColor)}>
								{!k.delta ? (
									<Minus size={12} />
								) : up ? (
									<ArrowUpRight size={13} />
								) : (
									<ArrowDownRight size={13} />
								)}
								{!k.delta ? "no change" : `${up ? "+" : ""}${k.delta} vs yesterday`}
							</p>
						</div>
					</div>
				)
			})}
		</div>
	)
}
