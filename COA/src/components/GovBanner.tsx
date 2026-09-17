import { Menu } from "lucide-react"

export function GovBanner({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
	return (
		<div className="relative isolate flex h-[88px] w-full items-center justify-between overflow-hidden border-b border-line bg-gradient-to-r from-white via-[#F3F8FD] to-[#E5EFFE] px-4 sm:px-6">
			{/* Train photograph bleeding from the right with smooth fading gradient */}
			<div className="pointer-events-none absolute right-0 top-0 h-full w-[48%] max-w-[650px] overflow-hidden">
				<img
					src="/vande-bharat.jpg"
					alt=""
					aria-hidden
					className="h-full w-full object-cover object-center opacity-85"
				/>
				<div className="absolute inset-0 bg-gradient-to-r from-[#F3F8FD] via-[#F3F8FD]/50 to-transparent" />
			</div>

			{/* Left section: Hamburger, Railway badge + lockup */}
			<div className="relative z-10 flex items-center gap-3 sm:gap-4">
				<button
					type="button"
					onClick={onToggleSidebar}
					aria-label="Toggle navigation"
					className="flex h-9 w-9 items-center justify-center rounded-lg text-govNavy hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors"
				>
					<Menu size={22} />
				</button>

				<div className="h-8 w-px bg-[#CFDFEF]" aria-hidden />

				{/* Indian Railways circular seal + bilingual lockup */}
				<div className="flex items-center gap-2.5">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-govNavy text-white shadow-sm ring-2 ring-accent/20">
						<svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.6" aria-hidden>
							<circle cx="12" cy="12" r="9" />
							<path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" strokeWidth="1" opacity="0.6" />
							<circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
							<rect x="8.5" y="8.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
						</svg>
					</div>
					<div className="flex flex-col leading-tight">
						<span className="text-[13px] font-semibold text-govNavy">भारतीय रेल</span>
						<span className="text-[10px] font-bold tracking-wider text-govNavy uppercase">INDIAN RAILWAYS</span>
					</div>
				</div>

				<div className="hidden lg:block h-8 w-px bg-[#CFDFEF]" aria-hidden />
			</div>

			{/* Center: Title & Government of India */}
			<div className="relative z-10 hidden md:flex flex-1 flex-col items-center justify-center px-4 text-center">
				<h1 className="font-gov text-[17px] lg:text-[20px] xl:text-[22px] font-bold tracking-wide text-govNavy whitespace-nowrap">
					INDIAN RAILWAY CONTROL OFFICE APPLICATION
				</h1>
				<div className="mt-0.5 flex items-center justify-center gap-2">
					<span className="h-px w-6 bg-slate-300" aria-hidden />
					<span className="text-[11.5px] font-medium tracking-wider text-muted uppercase">Government of India</span>
					<span className="h-px w-6 bg-slate-300" aria-hidden />
				</div>
			</div>

			{/* Right: State Emblem of India */}
			<div className="relative z-10 flex shrink-0 items-center justify-end pl-2">
				<img
					src="/emblem.png"
					alt="State Emblem of India"
					className="h-[64px] w-auto object-contain drop-shadow-sm"
				/>
			</div>
		</div>
	)
}
