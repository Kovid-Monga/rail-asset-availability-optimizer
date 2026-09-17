import { NavLink } from "react-router-dom"
import {
	Calendar,
	ClipboardList,
	FileText,
	Home,
	Lightbulb,
	Settings,
	TrainFront,
} from "lucide-react"
import { ROLE_NAV, useApp } from "@/store/AppContext"
import { cx } from "@/utils/display"

const NAV = [
	{ to: "/", label: "Overview", icon: Home },
	{ to: "/tasks", label: "Maintenance Tasks", icon: ClipboardList },
	{ to: "/recommendations", label: "AI Recommendations", icon: Lightbulb },
	{ to: "/schedule", label: "Block Schedule", icon: Calendar },
	{ to: "/reports", label: "Reports", icon: FileText },
	{ to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ open = true }: { open?: boolean }) {
	const { role } = useApp()
	const allowed = ROLE_NAV[role] ?? []

	return (
		<aside
			className={cx(
				"flex-col bg-[#0B1E38] text-white shadow-xl select-none transition-[width] duration-200 overflow-hidden shrink-0",
				open ? "w-[240px] flex" : "w-0 hidden",
			)}
		>
			{/* Top: Control Office / Operations Division */}
			<div className="mx-3 mt-4 mb-3 flex items-center gap-3 px-2 py-2">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white shadow-inner">
					<TrainFront size={20} />
				</div>
				<div className="min-w-0 flex-1 leading-tight">
					<p className="truncate text-[14px] font-semibold text-white tracking-wide">Control Office</p>
					<p className="truncate text-[12px] text-blue-200/70">Operations Division</p>
				</div>
			</div>

			{/* Navigation items: only 6 items */}
			<nav className="flex-1 overflow-y-auto px-3 py-2">
				<ul className="space-y-1.5">
					{NAV.filter((n) => allowed.includes(n.to)).map(({ to, label, icon: Icon }) => (
						<li key={to}>
							<NavLink
								to={to}
								end={to === "/"}
								className={({ isActive }) =>
									cx(
										"flex min-h-[42px] items-center gap-3.5 rounded-lg px-3.5 text-[13.5px] transition-all duration-150",
										isActive
											? "bg-[#1E3A63] font-medium text-white shadow-sm border border-blue-400/20"
											: "text-blue-100/75 hover:bg-white/[0.08] hover:text-white",
									)
								}
							>
								{({ isActive }) => (
									<>
										<Icon size={18} className={isActive ? "text-white" : "text-blue-200/70"} />
										<span className="truncate">{label}</span>
									</>
								)}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Bottom illustration & tagline */}
			<div className="mt-auto px-4 pb-5 pt-3 border-t border-white/10 relative flex items-end justify-between overflow-hidden">
				{/* Tagline */}
				<div className="z-10 leading-tight">
					<p className="text-[12.5px] font-medium text-blue-100/90">Safe Railways</p>
					<p className="text-[12.5px] font-medium text-blue-200/75">Better Tomorrow</p>
				</div>

				{/* Railroad track graphic */}
				<div className="w-16 h-16 opacity-30 pointer-events-none" aria-hidden>
					<svg viewBox="0 0 64 64" className="w-full h-full stroke-white fill-none" strokeWidth="2">
						{/* Left and right rails with perspective */}
						<line x1="22" y1="4" x2="6" y2="60" strokeWidth="2.5" />
						<line x1="42" y1="4" x2="58" y2="60" strokeWidth="2.5" />
						{/* Ties / sleepers */}
						<line x1="20" y1="12" x2="44" y2="12" strokeWidth="2" />
						<line x1="17" y1="22" x2="47" y2="22" strokeWidth="2" />
						<line x1="14" y1="34" x2="50" y2="34" strokeWidth="2.2" />
						<line x1="10" y1="46" x2="54" y2="46" strokeWidth="2.4" />
						<line x1="6" y1="58" x2="58" y2="58" strokeWidth="2.5" />
					</svg>
				</div>
			</div>
		</aside>
	)
}
