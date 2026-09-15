/* ==========================================================================
 * APP SHELL
 * Sidebar + Header + routed page + global task drawer + demo overlay.
 * The drawer and section focus live above the router, which is what makes
 * the product feel like one system rather than nine separate pages.
 * ========================================================================== */

import { Navigate, Route, Routes } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer"
import { DemoMode } from "@/components/DemoMode"
import { AppProvider, ROLE_NAV, useApp } from "@/store/AppContext"
import { useDashboard, useTasks } from "@/hooks/useApi"
import { Dashboard } from "@/pages/Dashboard"
import { MaintenanceTasks } from "@/pages/MaintenanceTasks"
import { BlockSchedule } from "@/pages/BlockSchedule"
import { NetworkMapPage } from "@/pages/NetworkMapPage"
import { GanttPlanner } from "@/pages/GanttPlanner"
import { AIRecommendations } from "@/pages/AIRecommendations"
import { WhatIfSimulation } from "@/pages/WhatIfSimulation"
import { Incidents } from "@/pages/Incidents"
import { Reports } from "@/pages/Reports"
import { Settings } from "@/pages/Settings"

function Shell() {
	const dashboard = useDashboard()
	const tasks = useTasks()
	const { role, selectedTaskId, selectTask } = useApp()
	const allowed = ROLE_NAV[role]
	const selectedTask = (tasks.data ?? []).find((t) => t.task_id === selectedTaskId) ?? null

	/** Routes hidden for a role fall back to the overview. */
	const guard = (path: string, element: JSX.Element) =>
		allowed.includes(path) ? element : <Navigate to="/" replace />

	return (
		<div className="flex min-h-screen bg-canvas text-ink">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<Header
					systemStatus={dashboard.data?.system_status ?? "OPERATIONAL"}
					lastUpdated={dashboard.data?.last_updated ?? dashboard.lastUpdated}
				/>
				<main className="flex-1 px-6 py-6">
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/tasks" element={guard("/tasks", <MaintenanceTasks />)} />
						<Route path="/schedule" element={guard("/schedule", <BlockSchedule />)} />
						<Route path="/map" element={guard("/map", <NetworkMapPage />)} />
						<Route path="/gantt" element={guard("/gantt", <GanttPlanner />)} />
						<Route path="/recommendations" element={guard("/recommendations", <AIRecommendations />)} />
						<Route path="/what-if" element={guard("/what-if", <WhatIfSimulation />)} />
						<Route path="/incidents" element={guard("/incidents", <Incidents />)} />
						<Route path="/reports" element={guard("/reports", <Reports />)} />
						<Route path="/settings" element={<Settings />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</main>
			</div>

			<TaskDetailDrawer
				task={selectedTask}
				tasks={tasks.data ?? []}
				onClose={() => selectTask(null)}
				onSelectTask={selectTask}
			/>
			<DemoMode />
		</div>
	)
}

export function App() {
	return (
		<AppProvider>
			<Shell />
		</AppProvider>
	)
}
