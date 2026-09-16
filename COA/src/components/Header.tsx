import { useEffect, useState } from "react"
import { ChevronDown, PlayCircle, Radio, ShieldCheck } from "lucide-react"
import { useApp } from "@/store/AppContext"
import type { Role } from "@/types"
import { cx } from "@/utils/display"

const ROLES: Role[] = ["Supervisor", "Maintenance Crew", "Auditor", "Management"]

export function Header({
	systemStatus = "OPERATIONAL",
	lastUpdated,
}: {
	systemStatus?: "OPERATIONAL" | "DEGRADED" | "OFFLINE"
	lastUpdated?: string
}) {
	const { role, setRole, demoMode, toggleDemoMode } = useApp()
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 30_000)
		return () => clearInterval(id)
	}, [])

	const statusColor =
		systemStatus === "OPERATIONAL" ? "#72BC8F" : systemStatus === "DEGRADED" ? "#DE9255" : "#E97366"

	return (
		<header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-line bg-canvas/85 px-6 py-3 backdrop-blur">
			<div className="min-w-0">
				<h1 className="truncate text-[15px] font-semibold tracking-tight">Railway Operations Control Center</h1>
				<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
					<span className="inline-flex items-center gap-1.5">
						<span aria-hidden className="h-1.5 w-1.5 animate-pulseDot rounded-full" style={{ background: statusColor }} />
						System {systemStatus.toLowerCase()}
					</span>
					<span aria-hidden>·</span>
					<span className="mono">
						{now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" })}{" "}
						{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>
					{lastUpdated ? (
						<>
							<span aria-hidden>·</span>
							<span>
								Last successful update{" "}
								<span className="mono">
									{new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</span>
							</span>
						</>
					) : null}
				</div>
			</div>

			<div className="flex items-center gap-2">
				<span className="hidden items-center gap-1.5 rounded-lg border border-line bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-muted lg:inline-flex">
					<Radio size={13} className="text-accent" /> Northern Div · 6 sections
				</span>

				<button
					type="button"
					onClick={toggleDemoMode}
					title="Guided walkthrough of the full pipeline"
					className={cx(
						"inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition-colors",
						demoMode
							? "border-[#5E9FE8]/45 bg-[#5E9FE8]/14 text-accent"
							: "border-line bg-white/[0.03] text-muted hover:text-ink",
					)}
				>
					<PlayCircle size={14} /> Demo Mode
				</button>

				<label className="relative inline-flex items-center">
					<span className="sr-only">Select role</span>
					<ShieldCheck size={14} className="pointer-events-none absolute left-3 text-muted" />
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as Role)}
						className="h-[38px] min-w-[170px] appearance-none rounded-lg border border-line bg-white/[0.03] pl-8 pr-8 text-[12.5px] font-medium text-ink outline-none"
					>
						{ROLES.map((r) => (
							<option key={r} value={r} className="bg-[#1a1c1f]">
								{r}
							</option>
						))}
					</select>
					<ChevronDown size={14} className="pointer-events-none absolute right-3 text-muted" />
				</label>
			</div>
		</header>
	)
}
