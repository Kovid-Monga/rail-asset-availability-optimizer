/* ==========================================================================
 * CROSS-PAGE STATE
 * --------------------------------------------------------------------------
 * This is what makes the app feel like ONE system instead of separate
 * pages: a single selected task / block / section that every view reacts to
 * (Gantt ↔ Map ↔ Task list ↔ Detail drawer), plus role and demo mode.
 * ========================================================================== */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import type { Role } from "@/types"

interface AppState {
	role: Role
	setRole: (r: Role) => void
	demoMode: boolean
	toggleDemoMode: () => void

	/** currently inspected task — opens the right-side detail drawer */
	selectedTaskId: string | null
	selectTask: (id: string | null) => void

	/** focused block section, e.g. "A-B" — highlights map + Gantt + task list */
	focusedSection: string | null
	focusSection: (id: string | null) => void

	selectedBlockId: string | null
	selectBlock: (id: string | null) => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
	const [role, setRole] = useState<Role>("Supervisor")
	const [demoMode, setDemoMode] = useState(false)
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
	const [focusedSection, setFocusedSection] = useState<string | null>(null)
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

	const selectTask = useCallback((id: string | null) => setSelectedTaskId(id), [])
	const focusSection = useCallback((id: string | null) => setFocusedSection(id), [])
	const selectBlock = useCallback((id: string | null) => setSelectedBlockId(id), [])
	const toggleDemoMode = useCallback(() => setDemoMode((v) => !v), [])

	const value = useMemo(
		() => ({
			role,
			setRole,
			demoMode,
			toggleDemoMode,
			selectedTaskId,
			selectTask,
			focusedSection,
			focusSection,
			selectedBlockId,
			selectBlock,
		}),
		[role, demoMode, toggleDemoMode, selectedTaskId, selectTask, focusedSection, focusSection, selectedBlockId, selectBlock],
	)

	return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
	const ctx = useContext(Ctx)
	if (!ctx) throw new Error("useApp must be used inside <AppProvider>")
	return ctx
}

/** Which sidebar destinations each role can see (limited strictly to the 6 navbar items). */
export const ROLE_NAV: Record<Role, string[]> = {
	Supervisor: ["/", "/tasks", "/recommendations", "/schedule", "/reports", "/settings"],
	"Maintenance Crew": ["/", "/tasks", "/schedule", "/reports", "/settings"],
	Auditor: ["/", "/tasks", "/schedule", "/reports", "/settings"],
	Management: ["/", "/tasks", "/recommendations", "/schedule", "/reports", "/settings"],
}

export const ROLE_CAPABILITIES: Record<
	Role,
	{ approve: boolean; override: boolean; simulate: boolean; report: boolean; seeAllTasks: boolean }
> = {
	Supervisor: { approve: true, override: true, simulate: true, report: true, seeAllTasks: true },
	"Maintenance Crew": { approve: false, override: false, simulate: false, report: true, seeAllTasks: false },
	Auditor: { approve: false, override: false, simulate: false, report: true, seeAllTasks: true },
	Management: { approve: false, override: false, simulate: true, report: false, seeAllTasks: true },
}

/** Crew role only sees its own gang's work. */
export const CREW_TEAM = "ENG-Gang 4"
