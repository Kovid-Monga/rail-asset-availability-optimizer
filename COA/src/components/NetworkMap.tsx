/* ==========================================================================
 * SCHEMATIC CORRIDOR MAP
 * Stations, block sections coloured by traffic, active-block glow and live
 * train positions. Purely a renderer of GET /api/network.
 * ========================================================================== */

import { TrainFront, Wrench } from "lucide-react"
import type { NetworkResponse } from "@/types"
import { cx, pct } from "@/utils/display"

const TRAFFIC_HEX = { High: "#C0392B", Medium: "#C2610F", Low: "#1E7D45" } as const

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
		<div className="relative overflow-hidden">
			{/* Faint train watermark illustration at the bottom right */}
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-2 -right-4 h-28 w-80 opacity-[0.08] dark:opacity-[0.04] overflow-hidden"
			>
				<svg viewBox="0 0 300 100" className="h-full w-full stroke-govNavy fill-none" strokeWidth="1.2">
					<path d="M0 80 L300 80" />
					<path d="M0 88 L300 88" />
					<line x1="20" y1="78" x2="20" y2="90" />
					<line x1="60" y1="78" x2="60" y2="90" />
					<line x1="100" y1="78" x2="100" y2="90" />
					<line x1="140" y1="78" x2="140" y2="90" />
					<line x1="180" y1="78" x2="180" y2="90" />
					<line x1="220" y1="78" x2="220" y2="90" />
					<line x1="260" y1="78" x2="260" y2="90" />
					{/* Train shape */}
					<path d="M50 78 C 80 75, 140 45, 200 40 L 260 50 L 250 65 L 290 70 L 270 78 Z" fill="currentColor" fillOpacity="0.1" />
					<path d="M150 50 L 190 48 L 180 56 L 150 58 Z" fill="currentColor" fillOpacity="0.25" />
				</svg>
			</div>

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
								stroke="var(--border)"
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
									fill="#0E7C86"
									fillOpacity={0.22}
									stroke="#0E7C86"
									strokeOpacity={0.6}
								/>
							) : null}
							{sec.active_block ? (
								<text
									x={(px(a.x) + px(b.x)) / 2}
									y={(py(a.y) + py(b.y)) / 2 - 15}
									textAnchor="middle"
									fontSize={9}
									fill="#0E7C86"
								>
									BLOCK LIVE
								</text>
							) : null}
							{/* status pill marker below segment */}
							<rect
								x={(px(a.x) + px(b.x)) / 2 - 9}
								y={(py(a.y) + py(b.y)) / 2 + 16}
								width={18}
								height={9}
								rx={2.5}
								fill={TRAFFIC_HEX[sec.traffic]}
							/>
						</g>
					)
				})}

				{/* stations */}
				{network.stations.map((s) => (
					<g key={s.id}>
						<circle cx={px(s.x)} cy={py(s.y)} r={6.5} fill="#FFFFFF" stroke="#1D4ED8" strokeWidth={2.5} />
						<text
							x={px(s.x)}
							y={py(s.y) - 16}
							textAnchor="middle"
							fontSize={11.5}
							fontWeight="600"
							fill="var(--text)"
						>
							{s.name}
						</text>
					</g>
				))}

				{/* trains */}
				{network.trains.map((t, i) => {
					const x = px(t.progress)
					const y = py(0.5) + (t.direction === "UP" ? -20 : 20) + i * 2
					const hex = t.delay_min > 5 ? "#C0392B" : t.delay_min > 0 ? "#C2610F" : "#1E7D45"
					return (
						<g key={t.train_no}>
							<rect x={x - 12} y={y - 6} width={24} height={12} rx={3} fill={hex} fillOpacity={0.9} />
							<text x={x} y={y - 11} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
								{t.train_no} {t.delay_min > 0 ? `+${t.delay_min}` : "RT"}
							</text>
						</g>
					)
				})}
			</svg>

			{/* Legend */}
			<div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11.5px] font-medium text-muted">
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-[#1E7D45]" /> Normal
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-[#C2610F]" /> Block
				</span>
				<span className="inline-flex items-center gap-1.5">
					<span className="h-2 w-2 rounded-full bg-[#C0392B]" /> Delay
				</span>
				<span className="inline-flex items-center gap-1.5">
					<Wrench size={12} className="text-accent" /> Maintenance
				</span>
			</div>
		</div>
	)
}
