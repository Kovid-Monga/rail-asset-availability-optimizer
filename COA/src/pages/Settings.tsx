import { useState } from "react"
import { API_BASE_URL, isMockMode } from "@/api"
import { ENDPOINTS } from "@/api/endpoints"
import { Panel, PageHeader, SectionHeader } from "@/components/ui"
import { ROLE_CAPABILITIES, useApp } from "@/store/AppContext"
import type { Role } from "@/types"
import { cx } from "@/utils/display"

const ROLES: Role[] = ["Supervisor", "Maintenance Crew", "Auditor", "Management"]

export function Settings() {
	const { role, setRole } = useApp()
	const caps = ROLE_CAPABILITIES[role]

	type ThemeChoice = "light" | "dark" | "system"
	const [theme, setThemeState] = useState<ThemeChoice>(
		() => (localStorage.getItem("theme") as ThemeChoice | null) ?? "light",
	)

	function setTheme(choice: ThemeChoice) {
		setThemeState(choice)
		localStorage.setItem("theme", choice)
		const isDark =
			choice === "dark" ||
			(choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
		document.documentElement.classList.toggle("dark", isDark)
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Settings"
				subtitle="Development controls: role simulation and the single place where the frontend is pointed at a backend."
			/>

			<div className="grid gap-6 xl:grid-cols-2">
				<Panel>
					<SectionHeader
						eyebrow="Role simulation"
						title="View the console as a different role"
						subtitle="Changes which pages and actions are available. Replace with real auth claims when the backend is wired."
					/>
					<div className="grid gap-2 sm:grid-cols-2">
						{ROLES.map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => setRole(r)}
								className={cx(
									"rounded-lg border px-3.5 py-3 text-left text-[13px] transition-colors",
									role === r ? "border-accent bg-accentSoft font-medium text-govNavy" : "border-line hover:bg-accentSoft",
								)}
							>
								{r}
							</button>
						))}
					</div>
					<ul className="mt-4 space-y-1 text-[12.5px] text-muted">
						<li>Approve blocks: {caps.approve ? "yes" : "no"}</li>
						<li>Override / modify plan: {caps.override ? "yes" : "no"}</li>
						<li>Run simulations: {caps.simulate ? "yes" : "no"}</li>
						<li>Division reports: {caps.report ? "yes" : "no"}</li>
						<li>See all tasks: {caps.seeAllTasks ? "yes" : "only own team"}</li>
					</ul>
				</Panel>

				<Panel>
					<SectionHeader
						eyebrow="Backend"
						title="API connection"
						subtitle="Set VITE_DATA_SOURCE=live and VITE_API_BASE_URL in .env to leave mock mode. No component changes are needed."
					/>
					<dl className="divide-y divide-line text-[13px]">
						<div className="flex justify-between gap-4 py-2">
							<dt className="text-muted">Data source</dt>
							<dd className="mono">{isMockMode ? "mock (bundled fixtures)" : "live backend"}</dd>
						</div>
						<div className="flex justify-between gap-4 py-2">
							<dt className="text-muted">API base URL</dt>
							<dd className="mono">{API_BASE_URL}</dd>
						</div>
					</dl>
					<p className="label-xs mt-4 mb-2">Endpoints consumed</p>
					<ul className="mono space-y-1 text-[12px] text-muted">
						<li>GET {ENDPOINTS.tasks}</li>
						<li>GET {ENDPOINTS.taskById(":id")}</li>
						<li>GET {ENDPOINTS.schedule}</li>
						<li>GET {ENDPOINTS.dashboard}</li>
						<li>GET {ENDPOINTS.recommendations}</li>
						<li>GET {ENDPOINTS.network}</li>
						<li>GET / POST {ENDPOINTS.incidents}</li>
						<li>POST {ENDPOINTS.whatIf}</li>
						<li>POST {ENDPOINTS.approve}</li>
						<li>POST {ENDPOINTS.override}</li>
						<li>POST {ENDPOINTS.applyRecommendation(":id")}</li>
					</ul>
				</Panel>

				<Panel>
					<SectionHeader
						eyebrow="Appearance"
						title="Night shift mode"
						subtitle="Applies immediately and persists across sessions. Night shift dims the interface for low-light environments."
					/>
					<div className="grid gap-2 sm:grid-cols-3">
						{(
							[
								{ value: "light", label: "Light", desc: "Default portal theme" },
								{ value: "dark", label: "Night Shift", desc: "Low-light dark palette" },
								{ value: "system", label: "System", desc: "Follows OS preference" },
							] as const
						).map(({ value, label, desc }) => (
							<button
								key={value}
								type="button"
								onClick={() => setTheme(value)}
								className={cx(
									"rounded-lg border px-3.5 py-3 text-left text-[13px] transition-colors",
									theme === value
										? "border-accent bg-accentSoft font-medium text-govNavy"
										: "border-line hover:bg-accentSoft",
								)}
							>
								<span className="block font-medium">{label}</span>
								<span className="block text-[11.5px] text-muted">{desc}</span>
							</button>
						))}
					</div>
				</Panel>
			</div>
		</div>
	)
}
