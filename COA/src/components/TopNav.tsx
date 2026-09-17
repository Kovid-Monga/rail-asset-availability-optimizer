import { Bell, ChevronDown, Menu, User } from "lucide-react"
import { useApp } from "@/store/AppContext"
import type { Role } from "@/types"

const ROLES: Role[] = ["Supervisor", "Maintenance Crew", "Auditor", "Management"]

export function TopNav({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
	const { role, setRole } = useApp()

	return (
		<header className="relative isolate flex h-[66px] w-full items-center justify-between overflow-hidden border-b border-slate-200 bg-gradient-to-r from-white via-[#F4F8FD] to-[#E9F1FC] px-4 sm:px-6 shadow-xs z-30">
			{/* Train background watermark bleeding from the right with smooth fade */}
			<div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] max-w-[620px] overflow-hidden">
				<img
					src="/vande-bharat.jpg"
					alt=""
					aria-hidden
					className="h-full w-full object-cover object-center opacity-70"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-[#F4F8FD] via-[#F4F8FD]/60 to-transparent" />
			</div>

			{/* Left: Hamburger & Indian Railways Logo */}
			<div className="relative z-10 flex items-center gap-3 sm:gap-4">
				<button
					type="button"
					onClick={onToggleSidebar}
					aria-label="Toggle navigation"
					className="flex h-9 w-9 items-center justify-center rounded-lg text-[#0F2A5C] hover:bg-black/[0.05] active:bg-black/[0.08] transition-colors"
				>
					<Menu size={22} />
				</button>

				<div className="flex items-center gap-2.5">
					{/* Indian Railways circular seal */}
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F2A5C] text-white shadow-sm ring-1 ring-[#0F2A5C]/20">
						<svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden>
							<circle cx="12" cy="12" r="9" />
							<path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" strokeWidth="1" opacity="0.6" />
							<circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
							<rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
						</svg>
					</div>
					<div className="flex flex-col leading-tight select-none">
						<span className="text-[13px] font-bold text-[#0F2A5C]">भारतीय रेल</span>
						<span className="text-[9.5px] font-bold tracking-wider text-[#0F2A5C] uppercase">INDIAN RAILWAYS</span>
					</div>
				</div>
			</div>

			{/* Center: Title & Government of India */}
			<div className="relative z-10 hidden md:flex flex-1 flex-col items-center justify-center px-4 text-center select-none">
				<h1 className="font-gov text-[18px] lg:text-[20px] font-bold tracking-wide text-[#0B1E38] whitespace-nowrap">
					INDIAN RAILWAY CONTROL OFFICE
				</h1>
				<p className="text-[10.5px] font-medium tracking-[0.18em] text-slate-500 uppercase mt-0.5">
					GOVERNMENT OF INDIA
				</p>
			</div>

			{/* Right: Notification bell + User profile */}
			<div className="relative z-10 flex shrink-0 items-center gap-3 sm:gap-4 pl-2">
				{/* Notification Bell with Badge 3 */}
				<button
					type="button"
					className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white shadow-xs transition-colors"
					title="3 new notifications"
				>
					<Bell size={18} />
					<span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
						3
					</span>
				</button>

				{/* User Profile Pill with Role Dropdown */}
				<div className="relative flex items-center">
					<div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 shadow-xs hover:bg-white transition-colors cursor-pointer">
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E3A8A] text-white">
							<User size={15} />
						</div>
						<select
							value={role}
							onChange={(e) => setRole(e.target.value as Role)}
							className="bg-transparent text-[13px] font-semibold text-slate-800 outline-none cursor-pointer pr-4 appearance-none"
						>
							{ROLES.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
						<ChevronDown size={14} className="pointer-events-none -ml-3 text-slate-500" />
					</div>
				</div>
			</div>
		</header>
	)
}
