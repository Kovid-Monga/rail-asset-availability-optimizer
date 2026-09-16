/* ==========================================================================
 * SCHEMATIC CORRIDOR MAP
 * Stations, block sections coloured by traffic, active-block glow and live
 * train positions. Purely a renderer of GET /api/network.
 * ========================================================================== */

import { TrainFront } from "lucide-react"
import type { NetworkResponse } from "@/types"
import { cx, pct } from "@/utils/display"

const TRAFFIC_HEX = { High: "#E97366", Medium: "#DE9255", Low: "#72BC8F" } as const

export function NetworkMap({
	network,
	focusedSection,
	onFocusSection,
	height = 240,
}: {
	network: NetworkResponse
	focusedSection?: string | null
	onFocusSection?: (section: string | null) => void
	height?: number
}) {
	const W = 1000
	const H = 260
	const px = (x: number) => 60 + x * (W - 120)
	const py = (y: number) => 60 + y * (H - 120)
	const stationOf = (id: string) => network.stations.find((s) => s.id === id)

	return (
		<div>
			<svg
				viewBox={`0 0 ${W} ${H}`}
				style={{ height, width: "100%" }}
				role="img"
				aria-label="Schematic map of the division corridor"
			>
				<defs>
					<filter id="activeGlow" x="-50%" y="-200%" width="200%" height="500%">
						<feGaussianBlur stdDeviation="4" result="b" />
						<feMerge>
							<feMergeNode in="b" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* sections */}
				{network.sections.map((sec) => {
					const a = stationOf(sec.from)
					const b = stationOf(sec.to)
					if (!a || !b) return null
					const dim = Boolean(focusedSection) && focusedSection !== sec.id
					const focused = focusedSection === sec.id
					return (
						<g
							key={sec.id}
							onMouseEnter={() => onFocusSection?.(sec.id)}
							onMouseLeave={() => onFocusSection?.(null)}
							style={{ cursor: onFocusSection ? "pointer" : "default", opacity: dim ? 0.32 : 1 }}
						>
							{/* track bed */}
							<line
								x1={px(a.x)}
								y1={py(a.y)}
								x2={px(b.x)}
								y2={py(b.y)}
								stroke="rgba(255,255,255,0.10)"
								strokeWidth={focused ? 16 : 13}
								strokeLinecap="round"
							/>
							{/* traffic-coloured rail */}
							<line
								x1={px(a.x)}
								y1={py(a.y)}
								x2={px(b.x)}
								y2={py(b.y)}
								stroke={TRAFFIC_HEX[sec.traffic]}
								strokeWidth={focused ? 6 : 4}
								strokeLinecap="round"
								strokeDasharray={sec.active_block ? undefined : "1 0"}
								filter={sec.active_block ? "url(#activeGlow)" : undefined}
							/>
							{/* active block marker */}
							{sec.active_block ? (
								<rect
									x={(px(a.x) + px(b.x)) / 2 - 26}
									y={(py(a.y) + py(b.y)) / 2 - 26}
									width={52}
									height={15}
									rx={4}
									fill="#4FB9C9"
									fillOpacity={0.22}
									stroke="#4FB9C9"
									strokeOpacity={0.6}
								/>
							) : null}
							{sec.active_block ? (
								<text
									x={(px(a.x) + px(b.x)) / 2}
									y={(py(a.y) + py(b.y)) / 2 - 15}
									textAnchor="middle"
									fontSize={9}
									fill="#4FB9C9"
								>
									BLOCK LIVE
								</text>
							) : null}
							{/* section label */}
							<text
								x={(px(a.x) + px(b.x)) / 2}
								y={(py(a.y) + py(b.y)) / 2 + 30}
								textAnchor="middle"
								fontSize={10}
								fill="rgba(255,255,255,0.62)"
							>
								{sec.id} · {sec.open_tasks} open · {pct(sec.asset_availability)}
							</text>
						</g>
					)
				})}

				{/* stations */}
				{network.stations.map((s) => (
					<g key={s.id}>
						<circle cx={px(s.x)} cy={py(s.y)} r={7} fill="#1a1c1f" stroke="rgba(255,255,255,0.55)" strokeWidth={2} />
						<text x={px(s.x)} y={py(s.y) - 16} textAnchor="middle" fontSize={11} fill="#fff">
							{s.id}
						</text>
						<text x={px(s.x)} y={py(s.y) - 28} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.45)">
							{s.name}
						</text>
					</g>
				))}

				{/* trains */}
				{network.trains.map((t, i) => {
					const x = px(t.progress)
					const y = py(0.5) + (t.direction === "UP" ? -20 : 20) + i * 2
					const hex = t.delay_min > 5 ? "#E97366" : t.delay_min > 0 ? "#DE9255" : "#72BC8F"
					return (
						<g key={t.train_no}>
							<rect x={x - 12} y={y - 6} width={24} height={12} rx={3} fill={hex} fillOpacity={0.9} />
							<text x={x} y={y - 11} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.75)">
								{t.train_no} {t.delay_min > 0 ? `+${t.delay_min}` : "RT"}
							</text>
						</g>
					)
				})}
			</svg>

			<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
				{(Object.keys(TRAFFIC_HEX) as Array<keyof typeof TRAFFIC_HEX>).map((k) => (
					<span key={k} className="inline-flex items-center gap-1.5">
						<span className="h-[3px] w-5 rounded-full" style={{ background: TRAFFIC_HEX[k] }} /> {k} traffic
					</span>
				))}
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-sm border border-[#4FB9C9]/60 bg-[#4FB9C9]/25" /> Active block
				</span>
				<span className={cx("inline-flex items-center gap-1.5")}>
					<TrainFront size={12} /> Train (late shown in amber / red)
				</span>
			</div>
		</div>
	)
}
