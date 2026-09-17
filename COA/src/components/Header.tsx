import { useEffect, useState } from "react"
import { ChevronDown, PlayCircle, Radio, TrainFront, User } from "lucide-react"
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
		systemStatus === "OPERATIONAL" ? "#1E7D45" : systemStatus === "DEGRADED" ? "#C2610F" : "#C0392B"

	return (
		<header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-line bg-canvas/90 px-6 py-3 backdrop-blur">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accentSoft text-accent shadow-xs">
					<TrainFront size={22} />
				</span>
				<div className="min-w-0">
					<h1 className="truncate text-[16px] font-bold tracking-tight text-ink">
						Railway Operations Control Center
					</h1>
					<div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-muted">
						<span className="inline-flex items-center gap-1.5 font-medium text-ink">
							<span aria-hidden className="h-2 w-2 animate-pulseDot rounded-full" style={{ background: statusColor }} />
							System operational
						</span>
						<span aria-hidden className="text-slate-300 dark:text-slate-600">|</span>
						<span className="mono">
							{now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short" })}{" "}
							{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
						</span>
						<span aria-hidden className="text-slate-300 dark:text-slate-600">|</span>
						<span>
							Last successful update{" "}
							<span className="mono">
								{lastUpdated
									? new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
									: "08:12 AM"}
							</span>
						</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2.5">
				<span className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink shadow-xs lg:inline-flex">
					<Radio size={13} className="text-accent" /> Northern Div · 6 sections
					<ChevronDown size={13} className="text-muted" />
				</span>

				<button
					type="button"
					onClick={toggleDemoMode}
					title="Guided walkthrough of the full pipeline"
					className={cx(
						"inline-flex min-h-[36px] items-center gap-2 rounded-lg border px-3 text-[12.5px] font-medium shadow-xs transition-colors",
						demoMode
							? "border-accent bg-accentSoft text-accent"
							: "border-line bg-surface text-ink hover:bg-accentSoft",
					)}
				>
					<PlayCircle size={15} className="text-accent" /> Demo Mode
				</button>

				<label className="relative inline-flex items-center">
					<span className="sr-only">Select role</span>
					<User size={14} className="pointer-events-none absolute left-3 text-accent" />
					<select
						value={role}
						onChange={(e) => setRole(e.target.value as Role)}
						className="h-[36px] min-w-[150px] appearance-none rounded-lg border border-line bg-surface pl-8 pr-8 text-[12.5px] font-medium text-ink shadow-xs outline-none cursor-pointer hover:bg-accentSoft"
					>
						{ROLES.map((r) => (
							<option key={r} value={r} className="bg-surface text-ink">
								{r}
							</option>
						))}
					</select>
					<ChevronDown size={13} className="pointer-events-none absolute right-3 text-muted" />
				</label>
			</div>
		</header>
	)
}
