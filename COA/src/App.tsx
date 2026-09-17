import { useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { TopNav } from "@/components/TopNav"
import { Sidebar } from "@/components/Sidebar"
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer"
import { AppProvider, ROLE_NAV, useApp } from "@/store/AppContext"
import { useTasks } from "@/hooks/useApi"
import { Dashboard } from "@/pages/Dashboard"
import { MaintenanceTasks } from "@/pages/MaintenanceTasks"
import { BlockSchedule } from "@/pages/BlockSchedule"
import { AIRecommendations } from "@/pages/AIRecommendations"
import { Reports } from "@/pages/Reports"
import { Settings } from "@/pages/Settings"

function Shell() {
	const tasks = useTasks()
	const { role, selectedTaskId, selectTask } = useApp()
	const allowed = ROLE_NAV[role] ?? []
	const selectedTask = (tasks.data ?? []).find((t) => t.task_id === selectedTaskId) ?? null
	const [sidebarOpen, setSidebarOpen] = useState(true)

	/** Routes hidden for a role fall back to the overview. */
	const guard = (path: string, element: JSX.Element) =>
		allowed.includes(path) ? element : <Navigate to="/" replace />

	return (
		<div className="flex h-screen flex-col bg-[#F4F7FB] text-slate-800 antialiased overflow-hidden">
			{/* Unified Government / Control Office Top Header */}
			<TopNav onToggleSidebar={() => setSidebarOpen((v) => !v)} />

			{/* Main Application Frame */}
			<div className="flex flex-1 min-h-0 overflow-hidden">
				{/* Sidebar Navigation (Exactly 6 items) */}
				<Sidebar open={sidebarOpen} />

				{/* Primary Content View */}
				<main className="flex-1 min-w-0 px-5 sm:px-7 py-6 overflow-y-auto bg-[#F4F7FB]">
					<Routes>
						<Route path="/" element={<Dashboard />} />
						<Route path="/tasks" element={guard("/tasks", <MaintenanceTasks />)} />
						<Route path="/schedule" element={guard("/schedule", <BlockSchedule />)} />
						<Route path="/recommendations" element={guard("/recommendations", <AIRecommendations />)} />
						<Route path="/reports" element={guard("/reports", <Reports />)} />
						<Route path="/settings" element={<Settings />} />
						<Route path="*" element={<Navigate to="/schedule" replace />} />
					</Routes>
				</main>
			</div>

			{/* Task Drawer */}
			<TaskDetailDrawer
				task={selectedTask}
				tasks={tasks.data ?? []}
				onClose={() => selectTask(null)}
				onSelectTask={selectTask}
			/>
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
