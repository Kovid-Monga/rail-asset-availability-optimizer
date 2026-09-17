/* ==========================================================================
 * DISPLAY HELPERS ONLY
 * --------------------------------------------------------------------------
 * Nothing here computes priority, compatibility or a schedule — those come
 * from the backend models. These helpers map backend values to colors,
 * labels and Gantt geometry.
 * ========================================================================== */

import type { BlockStatus, Department, Level, PriorityCategory, TaskStatus } from "@/types"

export const PRIORITY_STYLE: Record<
	PriorityCategory,
	{ text: string; bg: string; border: string; hex: string; icon: string; label: string }
> = {
	Critical: { text: "text-[#C0392B]", bg: "bg-[#C0392B]/10", border: "border-[#C0392B]/45", hex: "#C0392B", icon: "◆", label: "CRITICAL" },
	Urgent: { text: "text-[#C2610F]", bg: "bg-[#C2610F]/10", border: "border-[#C2610F]/45", hex: "#C2610F", icon: "▲", label: "URGENT" },
	Moderate: { text: "text-[#A9790B]", bg: "bg-[#A9790B]/10", border: "border-[#A9790B]/45", hex: "#A9790B", icon: "■", label: "MODERATE" },
	Normal: { text: "text-[#1E7D45]", bg: "bg-[#1E7D45]/10", border: "border-[#1E7D45]/45", hex: "#1E7D45", icon: "●", label: "NORMAL" },
}

export const BLOCK_STATUS_STYLE: Record<
	BlockStatus,
	{ label: string; text: string; bg: string; border: string; hex: string }
> = {
	AI_RECOMMENDED: { label: "AI Recommended", text: "text-[#1D4ED8]", bg: "bg-[#1D4ED8]/10", border: "border-[#1D4ED8]/45", hex: "#1D4ED8" },
	PENDING_REVIEW: { label: "Pending Review", text: "text-[#A9790B]", bg: "bg-[#A9790B]/10", border: "border-[#A9790B]/45", hex: "#A9790B" },
	APPROVED: { label: "Approved", text: "text-[#1E7D45]", bg: "bg-[#1E7D45]/10", border: "border-[#1E7D45]/45", hex: "#1E7D45" },
	CONFLICT: { label: "Conflict", text: "text-[#C0392B]", bg: "bg-[#C0392B]/10", border: "border-[#C0392B]/45", hex: "#C0392B" },
	IN_PROGRESS: { label: "In Progress", text: "text-[#0E7C86]", bg: "bg-[#0E7C86]/10", border: "border-[#0E7C86]/45", hex: "#0E7C86" },
	COMPLETED: { label: "Completed", text: "text-muted", bg: "bg-accentSoft", border: "border-line", hex: "#5B6B80" },
	DELAYED: { label: "Delayed", text: "text-[#C2610F]", bg: "bg-[#C2610F]/10", border: "border-[#C2610F]/45", hex: "#C2610F" },
}

export const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
	Pending: "text-[#A9790B]",
	Scheduled: "text-[#1D4ED8]",
	"In Progress": "text-[#0E7C86]",
	Completed: "text-muted",
	Delayed: "text-[#C2610F]",
}

export const DEPARTMENT_STYLE: Record<Department, { short: string; hex: string; system: string }> = {
	Engineering: { short: "ENG", hex: "#1D4ED8", system: "TMS" },
	"S&T": { short: "S&T", hex: "#6B3FA0", system: "SMMS" },
	OHE: { short: "OHE", hex: "#A9790B", system: "TDMS" },
}

export const LEVEL_STYLE: Record<Level, string> = {
	High: "text-[#C0392B]",
	Medium: "text-[#C2610F]",
	Low: "text-[#1E7D45]",
}

/* ------------------------------ time helpers ----------------------------- */

export const toMinutes = (hhmm: string): number => {
	const [h, m] = hhmm.split(":").map(Number)
	return h * 60 + m
}

export const durationOf = (start: string, end: string): number => {
	const d = toMinutes(end) - toMinutes(start)
	return d < 0 ? d + 1440 : d
}

export const formatDuration = (min: number): string =>
	min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim()

export const formatDate = (iso: string): string =>
	new Date(iso).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })

export const formatClock = (iso: string): string =>
	new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export const relativeDays = (iso: string): string => {
	const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000)
	if (days < 0) return `${Math.abs(days)} d overdue`
	if (days === 0) return "due today"
	if (days === 1) return "due tomorrow"
	return `in ${days} d`
}

export const pct = (v: number): string => `${Math.round(v * 100)}%`

export const cx = (...parts: Array<string | false | null | undefined>): string =>
	parts.filter(Boolean).join(" ")
