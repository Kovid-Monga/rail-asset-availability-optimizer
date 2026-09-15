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
	Critical: { text: "text-[#E97366]", bg: "bg-[#E97366]/12", border: "border-[#E97366]/40", hex: "#E97366", icon: "◆", label: "CRITICAL" },
	Urgent: { text: "text-[#DE9255]", bg: "bg-[#DE9255]/12", border: "border-[#DE9255]/40", hex: "#DE9255", icon: "▲", label: "URGENT" },
	Moderate: { text: "text-[#EAC26B]", bg: "bg-[#EAC26B]/12", border: "border-[#EAC26B]/40", hex: "#EAC26B", icon: "■", label: "MODERATE" },
	Normal: { text: "text-[#72BC8F]", bg: "bg-[#72BC8F]/12", border: "border-[#72BC8F]/40", hex: "#72BC8F", icon: "●", label: "NORMAL" },
}

export const BLOCK_STATUS_STYLE: Record<
	BlockStatus,
	{ label: string; text: string; bg: string; border: string; hex: string }
> = {
	AI_RECOMMENDED: { label: "AI Recommended", text: "text-[#5E9FE8]", bg: "bg-[#5E9FE8]/12", border: "border-[#5E9FE8]/45", hex: "#5E9FE8" },
	PENDING_REVIEW: { label: "Pending Review", text: "text-[#EAC26B]", bg: "bg-[#EAC26B]/12", border: "border-[#EAC26B]/45", hex: "#EAC26B" },
	APPROVED: { label: "Approved", text: "text-[#72BC8F]", bg: "bg-[#72BC8F]/12", border: "border-[#72BC8F]/45", hex: "#72BC8F" },
	CONFLICT: { label: "Conflict", text: "text-[#E97366]", bg: "bg-[#E97366]/12", border: "border-[#E97366]/50", hex: "#E97366" },
	IN_PROGRESS: { label: "In Progress", text: "text-[#4FB9C9]", bg: "bg-[#4FB9C9]/12", border: "border-[#4FB9C9]/45", hex: "#4FB9C9" },
	COMPLETED: { label: "Completed", text: "text-muted", bg: "bg-white/[0.06]", border: "border-line", hex: "#8b8b8b" },
	DELAYED: { label: "Delayed", text: "text-[#DE9255]", bg: "bg-[#DE9255]/12", border: "border-[#DE9255]/45", hex: "#DE9255" },
}

export const TASK_STATUS_STYLE: Record<TaskStatus, string> = {
	Pending: "text-[#EAC26B]",
	Scheduled: "text-[#5E9FE8]",
	"In Progress": "text-[#4FB9C9]",
	Completed: "text-muted",
	Delayed: "text-[#DE9255]",
}

export const DEPARTMENT_STYLE: Record<Department, { short: string; hex: string; system: string }> = {
	Engineering: { short: "ENG", hex: "#5E9FE8", system: "TMS" },
	"S&T": { short: "S&T", hex: "#BF8EDA", system: "SMMS" },
	OHE: { short: "OHE", hex: "#EAC26B", system: "TDMS" },
}

export const LEVEL_STYLE: Record<Level, string> = {
	High: "text-[#E97366]",
	Medium: "text-[#DE9255]",
	Low: "text-[#72BC8F]",
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
