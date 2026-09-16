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
									role === r ? "border-[#5E9FE8]/55 bg-[#5E9FE8]/[0.08]" : "border-line hover:bg-white/[0.05]",
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
			</div>
		</div>
	)
}
