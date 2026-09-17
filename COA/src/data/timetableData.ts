/* ==========================================================================
 * TIMETABLE DYNAMIC HELPERS & DATA
 * Connects Week and Month views to live PostgreSQL blocks and maintenance requests
 * ========================================================================== */

export interface WeekDay {
	name: string
	date: number
	isoDate?: string
}

export interface TimelineDisplayItem {
	id: string
	type: "block" | "request"
	day: number
	section: string
	title: string
	time: string
	duration: string
	status: string
	department?: string
	workType?: string
}

export interface MonthCalendarItem {
	id: string
	type: "block" | "request"
	section: string
	department?: string
	title: string
	status: string
	detail: string
}

export interface MonthDay {
	day: number
	isCurrentMonth: boolean
	blocksCount: number
	items?: MonthCalendarItem[]
}

export const WEEK_DAYS: WeekDay[] = [
	{ name: "MON", date: 14, isoDate: "2026-09-14" },
	{ name: "TUE", date: 15, isoDate: "2026-09-15" },
	{ name: "WED", date: 16, isoDate: "2026-09-16" },
	{ name: "THU", date: 17, isoDate: "2026-09-17" },
	{ name: "FRI", date: 18, isoDate: "2026-09-18" },
	{ name: "SAT", date: 19, isoDate: "2026-09-19" },
	{ name: "SUN", date: 20, isoDate: "2026-09-20" },
]

export const BASE_SECTIONS = ["A - B", "B - C", "C - D", "D - E", "E - F", "F - G"]

export function parseDayFromDateString(dateStr?: string): number | null {
	if (!dateStr) return null
	// Match YYYY-MM-DD
	const matchIso = dateStr.match(/\d{4}-\d{2}-(\d{2})/)
	if (matchIso) return parseInt(matchIso[1], 10)

	// Match "Sun, 14 Sep 2026" or "14 Sep 2026"
	const matchDay = dateStr.match(/(\d{1,2})\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i)
	if (matchDay) return parseInt(matchDay[1], 10)

	const parsed = new Date(dateStr)
	if (!isNaN(parsed.getDate())) return parsed.getDate()
	return null
}

export function normalizeSection(sec?: string): string {
	if (!sec) return ""
	return sec.replace(/\s+/g, "").toLowerCase()
}

/**
 * Returns all distinct sections that exist in the standard list plus any real blocks or requests.
 */
export function getDisplaySections(blocks: any[] = [], tasks: any[] = []): string[] {
	const set = new Set<string>(BASE_SECTIONS)
	blocks.forEach((b) => {
		if (b.section) set.add(b.section)
	})
	tasks.forEach((t) => {
		if (t.block_section) set.add(t.block_section)
	})
	return Array.from(set)
}

/**
 * Builds dynamic timeline items for the Week view from live blocks and live department requests.
 */
export function buildWeekTimelineItems(blocks: any[] = [], tasks: any[] = []): TimelineDisplayItem[] {
	const items: TimelineDisplayItem[] = []

	// Map real block schedules
	blocks.forEach((b) => {
		const day = parseDayFromDateString(b.date || b.block_date)
		if (day !== null) {
			items.push({
				id: b.id || b.block_id,
				type: "block",
				day,
				section: b.section,
				title: b.workType || b.work_type || "Maintenance Block",
				time: `${b.startTime || b.start_time || "10:00"} - ${b.endTime || b.end_time || "12:00"}`,
				duration: b.duration || `${b.durationMinutes || b.duration_min || 120} min`,
				status: b.status || "Pending Approval",
				workType: b.workType || b.work_type || "Maintenance",
			})
		}
	})

	// Map real maintenance requests
	tasks.forEach((t) => {
		const day = parseDayFromDateString(t.due_date)
		if (day !== null) {
			items.push({
				id: t.task_id,
				type: "request",
				day,
				section: t.block_section,
				title: t.reason_description || "Department Request",
				time: `${t.duration_min} min window requested`,
				duration: `${t.duration_min} min`,
				status: t.status === "Scheduled" ? "Scheduled" : "Pending Block",
				department: t.department || t.source_system || "TMS",
				workType: `${t.department || t.source_system || "TMS"} Request`,
			})
		}
	})

	return items
}

/**
 * Dynamically builds 5-week calendar days for September 2026, populating each day
 * with live counts and item lists of real scheduled blocks and maintenance requests.
 */
export function buildMonthDaysData(blocks: any[] = [], tasks: any[] = []): MonthDay[] {
	// Pre-group items by day of month (1 to 30)
	const itemsByDay = new Map<number, MonthCalendarItem[]>()
	for (let d = 1; d <= 30; d++) {
		itemsByDay.set(d, [])
	}

	blocks.forEach((b) => {
		const d = parseDayFromDateString(b.date || b.block_date)
		if (d && d >= 1 && d <= 30) {
			itemsByDay.get(d)!.push({
				id: b.id || b.block_id,
				type: "block",
				section: b.section,
				title: b.workType || b.work_type || "Maintenance Block",
				status: b.status || "Pending Approval",
				detail: `${b.startTime || b.start_time}–${b.endTime || b.end_time} (${b.section})`,
			})
		}
	})

	tasks.forEach((t) => {
		const d = parseDayFromDateString(t.due_date)
		if (d && d >= 1 && d <= 30) {
			itemsByDay.get(d)!.push({
				id: t.task_id,
				type: "request",
				section: t.block_section,
				department: t.department || t.source_system || "TMS",
				title: t.reason_description || "Maintenance Request",
				status: t.status === "Scheduled" ? "Scheduled" : "Pending Block",
				detail: `${t.department || t.source_system} · ${t.block_section} (${t.duration_min}m)`,
			})
		}
	})

	const days: MonthDay[] = []

	// Padding day: 31 August 2026 (Monday)
	days.push({ day: 31, isCurrentMonth: false, blocksCount: 0, items: [] })

	// Days 1 through 30 September 2026
	for (let d = 1; d <= 30; d++) {
		const list = itemsByDay.get(d) || []
		days.push({
			day: d,
			isCurrentMonth: true,
			blocksCount: list.length,
			items: list,
		})
	}

	// Trailing padding days: 1 to 4 October 2026
	for (let d = 1; d <= 4; d++) {
		days.push({ day: d, isCurrentMonth: false, blocksCount: 0, items: [] })
	}

	return days
}
