import { NavLink } from "react-router-dom"
import {
	Activity,
	BrainCircuit,
	CalendarRange,
	FileText,
	FlaskConical,
	GanttChartSquare,
	Home,
	LayoutDashboard,
	Map,
	Settings,
	Siren,
	User,
	Wrench,
} from "lucide-react"
import { ROLE_NAV, useApp } from "@/store/AppContext"
import { cx } from "@/utils/display"
import { isMockMode } from "@/api"

const NAV = [
	{ to: "/", label: "Overview", icon: Home },
	{ to: "/tasks", label: "Maintenance Tasks", icon: Wrench },
	{ to: "/schedule", label: "Block Schedule", icon: CalendarRange },
	{ to: "/map", label: "Network Map", icon: Map },
	{ to: "/gantt", label: "Gantt Planner", icon: GanttChartSquare },
	{ to: "/recommendations", label: "AI Recommendations", icon: BrainCircuit },
	{ to: "/what-if", label: "What-If Simulation", icon: FlaskConical },
	{ to: "/incidents", label: "Incidents", icon: Siren },
	{ to: "/reports", label: "Reports", icon: FileText },
	{ to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ open = true }: { open?: boolean }) {
	const { role } = useApp()
	const allowed = ROLE_NAV[role]

	return (
		<aside
			className={cx(
				"flex-col bg-gradient-to-b from-govNavy via-[#12336D] to-govNavy2 text-white shadow-lg select-none transition-[width] duration-200 overflow-hidden",
				open ? "w-[240px] flex" : "w-0",
			)}
		>
			{/* Profile-style header card — no dropdown arrow */}
			<div className="mx-3 mt-3 mb-2 flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2.5 shadow-sm">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
					<User size={18} />
				</div>
				<div className="min-w-0 flex-1 leading-tight">
					<p className="truncate text-[13px] font-semibold text-white">RailBlock OS</p>
					<p className="truncate text-[11px] text-blue-200/75">Division Control</p>
				</div>
			</div>

			{/* Navigation items */}
			<nav className="flex-1 overflow-y-auto px-3 py-2">
				<ul className="space-y-1">
					{NAV.filter((n) => allowed.includes(n.to)).map(({ to, label, icon: Icon }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={to === "/"}
								className={({ isActive }) =>
									cx(
										"flex min-h-[40px] items-center gap-3 rounded-lg px-3 text-[13px] transition-all duration-150",
										isActive
											? "border border-white/25 bg-white/[0.18] font-semibold text-white shadow-sm"
											: "text-blue-100/75 hover:bg-white/[0.08] hover:text-white",
									)
								}
							>
								{({ isActive }) => (
									<>
										<Icon size={16} className={isActive ? "text-white" : "text-blue-200/75"} />
										<span className="truncate">{label}</span>
									</>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Bottom illustration, tricolour flag and tagline */}
			<div className="mt-auto px-4 pb-4 pt-1">
				{/* Faint decorative train + rail-track illustration */}
				<div className="relative mb-2 h-14 w-full opacity-15 overflow-hidden" aria-hidden>
					<svg viewBox="0 0 200 56" className="h-full w-full stroke-white fill-none" strokeWidth="1.4">
						{/* Curved tracks */}
						<path d="M-10 42 C 50 42, 110 38, 210 20" />
						<path d="M-10 49 C 50 49, 110 45, 210 27" />
						{/* Sleepers */}
						<line x1="10" y1="38" x2="10" y2="53" />
						<line x1="35" y1="38" x2="35" y2="53" />
						<line x1="60" y1="37" x2="60" y2="52" />
						<line x1="85" y1="36" x2="85" y2="51" />
						<line x1="110" y1="34" x2="110" y2="49" />
						<line x1="135" y1="31" x2="135" y2="46" />
						<line x1="160" y1="27" x2="160" y2="42" />
						<line x1="185" y1="23" x2="185" y2="38" />
						{/* Stylized train nose */}
						<path d="M 60 37 C 90 35, 120 18, 160 16 L 190 22 L 180 27 C 140 30, 100 39, 60 37 Z" fill="white" fillOpacity="0.25" />
						<path d="M 120 22 L 145 20 L 140 24 L 120 25 Z" fill="white" fillOpacity="0.5" />
					</svg>
				</div>

				{/* Tricolour flag strip */}
				<div className="mb-2 flex h-1 w-12 overflow-hidden rounded-full shadow-sm" aria-hidden>
					<span className="w-1/3 bg-[#F5821F]" />
					<span className="w-1/3 bg-white" />
					<span className="w-1/3 bg-[#1E7D45]" />
				</div>

				{/* Safe Railways / Stronger India tagline */}
				<p className="text-[12px] italic tracking-wide text-blue-100/85 font-medium leading-tight">
					Safe Railways
					<br />
					Stronger India
				</p>

				{/* Data source status */}
				<div className="mt-3 border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-blue-200/60">
					<span>{isMockMode ? "Mock Data" : "Live Feed"}</span>
					<span className="h-1.5 w-1.5 rounded-full" style={{ background: isMockMode ? "#EAC26B" : "#72BC8F" }} />
				</div>
			</div>
		</aside>
	)
}
