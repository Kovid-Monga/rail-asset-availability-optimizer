import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import type { KPI } from "@/types"
import { cx } from "@/utils/display"

const INTENT: Record<NonNullable<KPI["intent"]>, string> = {
	neutral: "text-ink",
	positive: "text-[#72BC8F]",
	attention: "text-[#DE9255]",
	danger: "text-[#E97366]",
}

export function KPIGrid({ kpis }: { kpis: KPI[] }) {
	return (
		<div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-[var(--border)] sm:grid-cols-3 xl:grid-cols-6">
			{kpis.map((k) => {
				const up = (k.delta ?? 0) > 0
				return (
					<div key={k.id} className="bg-surface px-4 py-4" title={k.hint}>
						<p className="label-xs leading-tight">{k.label}</p>
						<p className={cx("mono mt-2 text-[26px] font-semibold leading-none", INTENT[k.intent ?? "neutral"])}>
							{k.value}
							{k.unit ? <span className="ml-1 text-[13px] font-medium opacity-70">{k.unit}</span> : null}
						</p>
						<p className="mt-2 flex items-center gap-1 text-[11.5px] text-muted">
							{!k.delta ? <Minus size={12} /> : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
							{!k.delta ? "no change" : `${up ? "+" : ""}${k.delta} vs yesterday`}
						</p>
					</div>
				)
			})}
		</div>
	)
}
