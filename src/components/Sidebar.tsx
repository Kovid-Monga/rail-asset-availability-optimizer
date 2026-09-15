import { NavLink } from "react-router-dom"
import {
	Activity,
	BrainCircuit,
	CalendarRange,
	FlaskConical,
	GanttChartSquare,
	LayoutDashboard,
	Map,
	Settings,
	Siren,
	TrainFront,
	Wrench,
} from "lucide-react"
import { ROLE_NAV, useApp } from "@/store/AppContext"
import { cx } from "@/utils/display"
import { isMockMode } from "@/api"

const NAV = [
	{ to: "/", label: "Overview", icon: LayoutDashboard },
	{ to: "/tasks", label: "Maintenance Tasks", icon: Wrench },
	{ to: "/schedule", label: "Block Schedule", icon: CalendarRange },
	{ to: "/map", label: "Network Map", icon: Map },
	{ to: "/gantt", label: "Gantt Planner", icon: GanttChartSquare },
	{ to: "/recommendations", label: "AI Recommendations", icon: BrainCircuit },
	{ to: "/what-if", label: "What-If Simulation", icon: FlaskConical },
	{ to: "/incidents", label: "Incidents", icon: Siren },
	{ to: "/reports", label: "Reports", icon: Activity },
	{ to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
	const { role } = useApp()
	const allowed = ROLE_NAV[role]

	return (
		<aside className="hidden w-[236px] shrink-0 flex-col border-r border-line bg-surface md:flex">
			<div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
				<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f6fb8]/18 text-accent">
					<TrainFront size={17} />
				</span>
				<div className="leading-tight">
					<p className="text-[13px] font-semibold tracking-tight">RailBlock OS</p>
					<p className="text-[11px] text-muted">Division Control</p>
				</div>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4">
				<ul className="space-y-0.5">
					{NAV.filter((n) => allowed.includes(n.to)).map(({ to, label, icon: Icon }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={to === "/"}
								className={({ isActive }) =>
									cx(
										"flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 text-[13.5px] transition-colors",
										isActive
											? "bg-white/[0.07] font-medium text-ink"
											: "text-muted hover:bg-white/[0.04] hover:text-ink",
									)
								}
							>
								{({ isActive }) => (
									<>
										<Icon size={16} className={isActive ? "text-accent" : ""} />
										{label}
									</>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			<div className="border-t border-line px-5 py-4">
				<p className="label-xs">Data source</p>
				<p className="mt-1 flex items-center gap-2 text-[12.5px]">
					<span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: isMockMode ? "#EAC26B" : "#72BC8F" }} />
					{isMockMode ? "Mock API" : "Live backend"}
				</p>
				<p className="mt-1 text-[11px] leading-snug text-muted">
					{isMockMode ? "Set VITE_DATA_SOURCE=live in .env" : "Connected to optimization engine"}
				</p>
			</div>
		</aside>
	)
}
