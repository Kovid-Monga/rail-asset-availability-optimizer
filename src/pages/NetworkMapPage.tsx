import { Suspense, lazy, useState } from "react"
import { Boxes, Map as MapIcon } from "lucide-react"
import { AsyncBoundary, Button, LoadingState, Panel, PageHeader, SectionHeader } from "@/components/ui"
import { NetworkMap } from "@/components/NetworkMap"
import { useNetwork, useSchedule } from "@/hooks/useApi"
import { useApp } from "@/store/AppContext"
import { LEVEL_STYLE, pct } from "@/utils/display"

const Railway3DScene = lazy(() => import("@/3d/Railway3DScene"))

export function NetworkMapPage() {
	const network = useNetwork()
	const schedule = useSchedule()
	const { focusedSection, focusSection } = useApp()
	const [mode, setMode] = useState<"2d" | "3d">("2d")

	return (
		<div className="space-y-6">
			<PageHeader
				title="Network map"
				subtitle="Stations, block sections, traffic density, active blocks and train positions for the division."
				action={
					<div className="flex gap-2">
						<Button size="sm" variant={mode === "2d" ? "primary" : "ghost"} onClick={() => setMode("2d")}>
							<MapIcon size={14} /> Schematic
						</Button>
						<Button size="sm" variant={mode === "3d" ? "primary" : "ghost"} onClick={() => setMode("3d")}>
							<Boxes size={14} /> Isometric 3D
						</Button>
					</div>
				}
			/>

			<Panel>
				<AsyncBoundary state={network} loadingMessage="Loading corridor state…">
					{(n) =>
						mode === "3d" ? (
							<Suspense fallback={<LoadingState message="Preparing 3D scene…" />}>
								<Railway3DScene network={n} focusedSection={focusedSection} />
								<p className="mt-2 text-[11.5px] text-muted">
									Drag to orbit, scroll to zoom. The glowing span marks an active block; the moving car is a scheduled
									train path.
								</p>
							</Suspense>
						) : (
							<NetworkMap network={n} focusedSection={focusedSection} onFocusSection={focusSection} height={300} />
						)
					}
				</AsyncBoundary>
			</Panel>

			<div className="grid gap-6 lg:grid-cols-2">
				<Panel>
					<SectionHeader eyebrow="Sections" title="Section health" />
					<AsyncBoundary state={network} loadingMessage="Loading…">
						{(n) => (
							<table className="w-full text-[12.5px]">
								<thead>
									<tr className="text-left text-muted">
										<th className="pb-2 font-medium">Section</th>
										<th className="pb-2 font-medium">Line</th>
										<th className="pb-2 font-medium">Traffic</th>
										<th className="pb-2 font-medium">Availability</th>
										<th className="pb-2 font-medium">Open tasks</th>
									</tr>
								</thead>
								<tbody>
									{n.sections.map((s) => (
										<tr
											key={s.id}
											onMouseEnter={() => focusSection(s.id)}
											onMouseLeave={() => focusSection(null)}
											className={focusedSection === s.id ? "bg-white/[0.05]" : ""}
										>
											<td className="mono py-1.5">{s.id}</td>
											<td className="py-1.5 text-muted">{s.line}</td>
											<td className={`py-1.5 ${LEVEL_STYLE[s.traffic]}`}>{s.traffic}</td>
											<td className="mono py-1.5">{pct(s.asset_availability)}</td>
											<td className="mono py-1.5">{s.open_tasks}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</AsyncBoundary>
				</Panel>

				<Panel>
					<SectionHeader eyebrow="Blocks" title="Active and upcoming blocks on the corridor" />
					<AsyncBoundary state={schedule} loadingMessage="Loading…">
						{(s) => (
							<ul className="space-y-2 text-[12.5px]">
								{s.blocks.map((b) => (
									<li
										key={b.block_id}
										onMouseEnter={() => focusSection(b.block_section)}
										onMouseLeave={() => focusSection(null)}
										className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
									>
										<span className="mono">
											{b.block_id} · {b.block_section}
										</span>
										<span className="mono text-muted">
											{b.start_time}–{b.end_time}
										</span>
									</li>
								))}
							</ul>
						)}
					</AsyncBoundary>
				</Panel>
			</div>
		</div>
	)
}
