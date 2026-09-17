import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
	AlertTriangle,
	ArrowRight,
	Calendar,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	Home,
	Layers,
	ListOrdered,
	Sparkles,
	TrendingUp,
	Wrench,
} from "lucide-react"
import { cx } from "@/utils/display"

interface ScheduleBlockItem {
	id: string
	section: string
	startTime: string
	endTime: string
	startMinutes: number
	durationMinutes: number
	tasks: string
	workType: string
	status: "AI Recommended" | "Approved" | "Pending Review" | "Pending Approval" | "In Progress" | "Conflict"
}

const DAY_BLOCKS_DATA: ScheduleBlockItem[] = [
	{
		id: "BLK-07",
		section: "A - B",
		startTime: "10:00",
		endTime: "12:00",
		startMinutes: 10 * 60,
		durationMinutes: 120,
		tasks: "MT-102 + MT-108",
		workType: "Track Maintenance",
		status: "AI Recommended",
	},
	{
		id: "BLK-09",
		section: "B - C",
		startTime: "08:00",
		endTime: "11:00",
		startMinutes: 8 * 60,
		durationMinutes: 180,
		tasks: "MT-121 + MT-124",
		workType: "OHE Work",
		status: "Approved",
	},
	{
		id: "BLK-11",
		section: "C - D",
		startTime: "13:00",
		endTime: "14:30",
		startMinutes: 13 * 60,
		durationMinutes: 90,
		tasks: "MT-115",
		workType: "Signal Maintenance",
		status: "Pending Review",
	},
	{
		id: "BLK-13",
		section: "D - E",
		startTime: "15:30",
		endTime: "17:30",
		startMinutes: 15 * 60 + 30,
		durationMinutes: 120,
		tasks: "MT-134 + MT-138",
		workType: "Track Renewal",
		status: "Approved",
	},
	{
		id: "BLK-16",
		section: "E - F",
		startTime: "09:00",
		endTime: "11:00",
		startMinutes: 9 * 60,
		durationMinutes: 120,
		tasks: "MT-141",
		workType: "Bridge Inspection",
		status: "In Progress",
	},
	{
		id: "BLK-18",
		section: "E - F",
		startTime: "11:30",
		endTime: "12:30",
		startMinutes: 11 * 60 + 30,
		durationMinutes: 60,
		tasks: "MT-145",
		workType: "Track Maintenance",
		status: "Pending Approval",
	},
	{
		id: "BLK-20",
		section: "F - G",
		startTime: "16:00",
		endTime: "18:30",
		startMinutes: 16 * 60,
		durationMinutes: 150,
		tasks: "MT-150 + MT-153",
		workType: "Track Maintenance",
		status: "Approved",
	},
]

const SECTIONS = ["A - B", "B - C", "C - D", "D - E", "E - F", "F - G"]
const TIMELINE_START = 6 * 60 // 06:00
const TIMELINE_END = 21 * 60 // 21:00
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START
const TIME_TICKS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

interface WeekBlock {
	id: string
	day: number
	section: string
	workType: string
	status: "AI Recommended" | "Approved" | "Pending Review" | "Pending Approval" | "In Progress"
	time: string
}

const WEEK_DAYS = [
	{ name: "MON", date: 14 },
	{ name: "TUE", date: 15 },
	{ name: "WED", date: 16 },
	{ name: "THU", date: 17 },
	{ name: "FRI", date: 18 },
	{ name: "SAT", date: 19 },
	{ name: "SUN", date: 20 },
]

const WEEK_BLOCKS_DATA: WeekBlock[] = [
	// A-B
	{ id: "BLK-01", day: 14, section: "A - B", workType: "Track Maintenance", status: "AI Recommended", time: "10:00 - 12:00" },
	{ id: "BLK-07", day: 17, section: "A - B", workType: "Track Maintenance", status: "Approved", time: "10:00 - 12:00" },
	// B-C
	{ id: "BLK-04", day: 15, section: "B - C", workType: "OHE Work", status: "Approved", time: "08:30 - 11:30" },
	{ id: "BLK-09", day: 18, section: "B - C", workType: "OHE Work", status: "Approved", time: "08:00 - 11:00" },
	// C-D
	{ id: "BLK-06", day: 16, section: "C - D", workType: "Signal Maintenance", status: "Pending Review", time: "13:00 - 15:00" },
	{ id: "BLK-11", day: 19, section: "C - D", workType: "Signal Maintenance", status: "Approved", time: "13:00 - 14:30" },
	// D-E
	{ id: "BLK-02", day: 14, section: "D - E", workType: "Track Renewal", status: "Approved", time: "14:00 - 16:30" },
	{ id: "BLK-13", day: 18, section: "D - E", workType: "Track Renewal", status: "Approved", time: "15:30 - 17:30" },
	// E-F
	{ id: "BLK-03", day: 15, section: "E - F", workType: "Bridge Inspection", status: "In Progress", time: "09:30 - 11:30" },
	{ id: "BLK-16", day: 17, section: "E - F", workType: "Bridge Inspection", status: "In Progress", time: "09:00 - 11:00" },
	// F-G
	{ id: "BLK-20", day: 18, section: "F - G", workType: "Track Maintenance", status: "Approved", time: "16:00 - 18:30" },
	{ id: "BLK-22", day: 20, section: "F - G", workType: "Track Maintenance", status: "Pending Approval", time: "15:00 - 17:30" },
]

interface MonthDay {
	day: number
	isCurrentMonth: boolean
	blocksCount: number
	blocks?: string[]
	isSelected?: boolean
}

const MONTH_DAYS_DATA: MonthDay[] = [
	// Week 1
	{ day: 31, isCurrentMonth: false, blocksCount: 0 },
	{ day: 1, isCurrentMonth: true, blocksCount: 2, blocks: ["BLK-01", "BLK-02"] },
	{ day: 2, isCurrentMonth: true, blocksCount: 0 },
	{ day: 3, isCurrentMonth: true, blocksCount: 0 },
	{ day: 4, isCurrentMonth: true, blocksCount: 0 },
	{ day: 5, isCurrentMonth: true, blocksCount: 0 },
	{ day: 6, isCurrentMonth: true, blocksCount: 0 },
	// Week 2
	{ day: 7, isCurrentMonth: true, blocksCount: 0 },
	{ day: 8, isCurrentMonth: true, blocksCount: 0 },
	{ day: 9, isCurrentMonth: true, blocksCount: 1, blocks: ["BLK-05"] },
	{ day: 10, isCurrentMonth: true, blocksCount: 0 },
	{ day: 11, isCurrentMonth: true, blocksCount: 3, blocks: ["BLK-08", "BLK-09", "BLK-10"] },
	{ day: 12, isCurrentMonth: true, blocksCount: 0 },
	{ day: 13, isCurrentMonth: true, blocksCount: 0 },
	// Week 3
	{ day: 14, isCurrentMonth: true, blocksCount: 2, blocks: ["BLK-01", "BLK-02"], isSelected: true },
	{ day: 15, isCurrentMonth: true, blocksCount: 1, blocks: ["BLK-04"] },
	{ day: 16, isCurrentMonth: true, blocksCount: 3, blocks: ["BLK-03", "BLK-06", "BLK-07"] },
	{ day: 17, isCurrentMonth: true, blocksCount: 4, blocks: ["BLK-07", "BLK-12", "BLK-16", "BLK-18"] },
	{ day: 18, isCurrentMonth: true, blocksCount: 2, blocks: ["BLK-09", "BLK-13"] },
	{ day: 19, isCurrentMonth: true, blocksCount: 1, blocks: ["BLK-11"] },
	{ day: 20, isCurrentMonth: true, blocksCount: 0 },
	// Week 4
	{ day: 21, isCurrentMonth: true, blocksCount: 1, blocks: ["BLK-19"] },
	{ day: 22, isCurrentMonth: true, blocksCount: 2, blocks: ["BLK-20", "BLK-21"] },
	{ day: 23, isCurrentMonth: true, blocksCount: 0 },
	{ day: 24, isCurrentMonth: true, blocksCount: 0 },
	{ day: 25, isCurrentMonth: true, blocksCount: 0 },
	{ day: 26, isCurrentMonth: true, blocksCount: 0 },
	{ day: 27, isCurrentMonth: true, blocksCount: 0 },
	// Week 5
	{ day: 28, isCurrentMonth: true, blocksCount: 0 },
	{ day: 29, isCurrentMonth: true, blocksCount: 0 },
	{ day: 30, isCurrentMonth: true, blocksCount: 0 },
	{ day: 1, isCurrentMonth: false, blocksCount: 0 },
	{ day: 2, isCurrentMonth: false, blocksCount: 0 },
	{ day: 3, isCurrentMonth: false, blocksCount: 0 },
	{ day: 4, isCurrentMonth: false, blocksCount: 0 },
]

export function Dashboard() {
	const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day")
	const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
	const [selectedMonthDay, setSelectedMonthDay] = useState<number | null>(14)

	const getBlockStyle = (status: string, id?: string) => {
		switch (status) {
			case "AI Recommended":
				return "bg-[#D8E6FD] border-[#8CB3F8] text-[#1E3A8A]"
			case "Approved":
				if (id === "BLK-09" || id === "BLK-04") return "bg-[#D2F4D3] border-[#70D478] text-[#115E20]"
				if (id === "BLK-13" || id === "BLK-02") return "bg-[#DCE7FD] border-[#93B8FB] text-[#1E40AF]"
				return "bg-[#E6DDF8] border-[#B799EC] text-[#581C87]"
			case "Pending Review":
				return "bg-[#FEEBC8] border-[#FBD38D] text-[#975A16]"
			case "Pending Approval":
				return "bg-[#FED7D7]/90 border-[#FEB2B2] text-[#9B2C2C] border-dashed border-2"
			case "In Progress":
				return "bg-[#D6F5EE] border-[#7AE2CE] text-[#0D6E57]"
			default:
				return "bg-blue-100 border-blue-300 text-blue-900"
		}
	}

	const datePillLabel = useMemo(() => {
		if (viewMode === "Day") return "Sun, 14 Sep 2026"
		if (viewMode === "Week") return "14–20 Sep 2026"
		return "September 2026"
	}, [viewMode])

	return (
		<div className="space-y-6 pb-12">
			{/* Page Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3.5">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EFF5] border border-[#CBD8E5] text-[#1B4E8C] shadow-xs">
						<Home size={22} />
					</div>
					<div>
						<h1 className="text-[22px] font-bold tracking-tight text-[#172B3A] leading-tight font-heading">
							Operations Overview
						</h1>
						<p className="text-[13px] text-[#5A6D80] mt-0.5">
							Live division status, asset availability, and active maintenance schedule
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2.5">
					{/* Date picker pill */}
					<button
						type="button"
						className="flex items-center gap-2 rounded-lg border border-[#DDE3EA] bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#172B3A] shadow-xs hover:bg-[#F8FAFC] transition-colors"
					>
						<Calendar size={15} className="text-[#1B4E8C]" />
						<span>{datePillLabel}</span>
						<ChevronDown size={14} className="text-slate-400" />
					</button>

					{/* Step buttons */}
					<div className="flex items-center rounded-lg border border-[#DDE3EA] bg-white shadow-xs">
						<button
							type="button"
							aria-label="Previous"
							className="flex h-[34px] w-[34px] items-center justify-center border-r border-[#DDE3EA] text-[#5A6D80] hover:bg-[#F8FAFC] rounded-l-lg transition-colors"
						>
							<ChevronLeft size={16} />
						</button>
						<button
							type="button"
							aria-label="Next"
							className="flex h-[34px] w-[34px] items-center justify-center text-[#5A6D80] hover:bg-[#F8FAFC] rounded-r-lg transition-colors"
						>
							<ChevronRight size={16} />
						</button>
					</div>

					{/* View toggle (Day / Week / Month) */}
					<div className="flex items-center rounded-lg border border-[#DDE3EA] bg-[#F4F6F9] p-0.5 shadow-xs">
						{(["Day", "Week", "Month"] as const).map((mode) => (
							<button
								key={mode}
								type="button"
								onClick={() => setViewMode(mode)}
								className={cx(
									"rounded-md px-3 py-1 text-[13px] font-medium transition-all",
									viewMode === mode
										? "bg-[#1B4E8C] text-white shadow-xs"
										: "text-[#5A6D80] hover:text-[#172B3A]",
								)}
							>
								{mode}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* 4 Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Total Blocks */}
				<div className="flex items-center gap-4 rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-xs">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E8EFF5] text-[#1B4E8C] border border-[#CBD8E5]">
						<Calendar size={22} />
					</div>
					<div>
						<p className="text-[12.5px] font-medium text-[#5A6D80]">
							{viewMode === "Day" ? "Total Blocks" : viewMode === "Week" ? "Week Blocks" : "Month Blocks"}
						</p>
						<p className="text-[26px] font-bold text-[#172B3A] leading-tight font-heading">
							{viewMode === "Day" ? "7" : viewMode === "Week" ? "12" : "22"}
						</p>
						<p className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600 mt-0.5">
							<TrendingUp size={12} /> +2 from last period
						</p>
					</div>
				</div>

				{/* Approved */}
				<div className="flex items-center gap-4 rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-xs">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#D1FAE5]">
						<CheckCircle2 size={24} />
					</div>
					<div>
						<p className="text-[12.5px] font-medium text-[#5A6D80]">Approved</p>
						<p className="text-[26px] font-bold text-[#172B3A] leading-tight font-heading">
							{viewMode === "Day" ? "4" : viewMode === "Week" ? "7" : "14"}
						</p>
						<p className="text-[11.5px] text-[#5A6D80] mt-0.5">
							{viewMode === "Day" ? "57% of total" : viewMode === "Week" ? "58% of total" : "64% of total"}
						</p>
					</div>
				</div>

				{/* Pending Approval */}
				<div className="flex items-center gap-4 rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-xs">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
						<Clock size={22} />
					</div>
					<div>
						<p className="text-[12.5px] font-medium text-[#5A6D80]">Pending Approval</p>
						<p className="text-[26px] font-bold text-[#172B3A] leading-tight font-heading">
							{viewMode === "Day" ? "2" : viewMode === "Week" ? "4" : "6"}
						</p>
						<p className="text-[11.5px] text-[#5A6D80] mt-0.5">Awaiting review</p>
					</div>
				</div>

				{/* Conflicts */}
				<div className="flex items-center gap-4 rounded-xl border border-[#DDE3EA] bg-white p-4 shadow-xs">
					<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FEE2E2]">
						<AlertTriangle size={22} />
					</div>
					<div>
						<p className="text-[12.5px] font-medium text-[#5A6D80]">Conflicts</p>
						<p className="text-[26px] font-bold text-[#172B3A] leading-tight font-heading">
							{viewMode === "Day" ? "1" : viewMode === "Week" ? "1" : "2"}
						</p>
						<p className="text-[11.5px] font-semibold text-red-600 mt-0.5">Requires attention</p>
					</div>
				</div>
			</div>

			{/* =========================================================
			    TIMETABLE SECTION: DAY / WEEK / MONTH VIEW SWITCHER
			   ========================================================= */}
			<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs">
				{/* Section Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
					<div>
						<h2 className="text-[16px] font-bold text-[#172B3A] tracking-tight font-heading">
							{viewMode === "Day" && "Optimized block schedule"}
							{viewMode === "Week" && "WEEK: 14–20 SEP 2026"}
							{viewMode === "Month" && "September 2026 Timetable"}
						</h2>
						<p className="text-[12.5px] text-[#5A6D80] mt-0.5">
							{viewMode === "Day" && "Compatible tasks in the same track section are merged into a single combined block."}
							{viewMode === "Week" && "Multi-section maintenance blocks scheduled across the division for the week of 14–20 September."}
							{viewMode === "Month" && "Monthly block density across division corridors. Select any date to inspect scheduled block counts."}
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Link
							to="/schedule"
							className="text-[12.5px] font-semibold text-[#1B4E8C] hover:text-[#0F2A5C] inline-flex items-center gap-1"
						>
							Detailed Schedule View <ArrowRight size={13} />
						</Link>
					</div>
				</div>

				{/* -------------------------------------------------------------
				    1. DAY TIMELINE VIEW
				   ------------------------------------------------------------- */}
				{viewMode === "Day" && (
					<div className="overflow-x-auto pt-4 pb-2">
						<div className="min-w-[780px]">
							{/* Time Axis Header */}
							<div className="flex items-center pb-2 border-b border-slate-200 text-[11px] font-semibold text-[#5A6D80]">
								<div className="w-24 shrink-0 font-bold text-[#172B3A] uppercase tracking-wider pl-1 font-heading">
									Section
								</div>
								<div className="relative flex-1 h-5">
									{TIME_TICKS.map((tick) => {
										const [h] = tick.split(":").map(Number)
										const m = h * 60
										const leftPct = ((m - TIMELINE_START) / TIMELINE_SPAN) * 100
										return (
											<span
												key={tick}
												className="absolute -translate-x-1/2 font-mono text-[11px] text-[#5A6D80]"
												style={{ left: `${leftPct}%` }}
											>
												{tick}
											</span>
										)
									})}
								</div>
							</div>

							{/* Section Rows */}
							<div className="relative divide-y divide-slate-100">
								{/* Vertical Grid lines */}
								<div className="absolute inset-y-0 left-24 right-0 pointer-events-none" aria-hidden>
									{TIME_TICKS.map((tick) => {
										const [h] = tick.split(":").map(Number)
										const m = h * 60
										const leftPct = ((m - TIMELINE_START) / TIMELINE_SPAN) * 100
										return (
											<span
												key={tick}
												className="absolute top-0 bottom-0 w-px bg-slate-100"
												style={{ left: `${leftPct}%` }}
											/>
										)
									})}
								</div>

								{SECTIONS.map((sec) => {
									const secBlocks = DAY_BLOCKS_DATA.filter((b) => b.section === sec)
									return (
										<div key={sec} className="relative flex items-center h-[52px]">
											<div className="w-24 shrink-0 font-bold text-[13px] text-[#172B3A] pl-1 font-heading">
												{sec}
											</div>

											<div className="relative flex-1 h-full">
												{secBlocks.map((b) => {
													const leftPct = ((b.startMinutes - TIMELINE_START) / TIMELINE_SPAN) * 100
													const widthPct = (b.durationMinutes / TIMELINE_SPAN) * 100
													const isSelected = selectedBlock === b.id

													return (
														<div
															key={b.id}
															onClick={() => setSelectedBlock(isSelected ? null : b.id)}
															style={{
																left: `${leftPct}%`,
																width: `${widthPct}%`,
															}}
															className={cx(
																"absolute top-1.5 bottom-1.5 rounded-lg px-2 py-0.5 flex flex-col justify-center cursor-pointer select-none transition-all shadow-xs overflow-hidden",
																getBlockStyle(b.status, b.id),
																isSelected && "ring-2 ring-[#0F2A5C] shadow-md z-20 scale-[1.01]",
															)}
															title={`${b.id} (${b.startTime} - ${b.endTime}): ${b.tasks}`}
														>
															<div className="flex items-center gap-1.5 leading-tight truncate">
																<span className="font-bold text-[11px] font-mono">{b.id}</span>
																<span className="text-[10.5px] opacity-80 truncate">
																	{b.startTime} - {b.endTime}
																</span>
															</div>
															<div className="text-[10px] opacity-90 truncate leading-tight mt-0.5">
																{b.status === "Pending Approval"
																	? "Pending Approval"
																	: b.id === "BLK-11"
																	? "Signal Maintenance"
																	: `${b.tasks} | ${b.workType}`}
															</div>
														</div>
													)
												})}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				)}

				{/* -------------------------------------------------------------
				    2. WEEK TIMETABLE VIEW (WEEK: 14–20 SEP 2026)
				   ------------------------------------------------------------- */}
				{viewMode === "Week" && (
					<div className="overflow-x-auto pt-4 pb-2">
						<div className="min-w-[820px]">
							{/* Week Days Table Header */}
							<div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 pb-3 border-b border-slate-200 text-center font-heading">
								<div className="text-left font-bold text-[12px] uppercase text-[#172B3A] pl-2 pt-1">
									Section
								</div>
								{WEEK_DAYS.map((d) => (
									<div
										key={d.name}
										className={cx(
											"py-1.5 px-1 rounded-lg transition-colors",
											d.date === 14 ? "bg-[#E8EFF5] text-[#1B4E8C] font-bold" : "text-[#5A6D80]",
										)}
									>
										<span className="block text-[11px] uppercase tracking-wider">{d.name}</span>
										<span className="block text-[14px] font-bold text-[#172B3A]">{d.date}</span>
									</div>
								))}
							</div>

							{/* Week Section Rows */}
							<div className="divide-y divide-slate-100 mt-1">
								{SECTIONS.map((sec) => {
									const secClean = sec.replace(/\s+/g, "")
									return (
										<div key={sec} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 py-3 items-center min-h-[64px]">
											{/* Section Label */}
											<div className="font-bold text-[13px] text-[#172B3A] pl-2 font-heading">
												{sec}
											</div>

											{/* Days 14 to 20 */}
											{WEEK_DAYS.map((d) => {
												const block = WEEK_BLOCKS_DATA.find(
													(b) => b.day === d.date && b.section.replace(/\s+/g, "") === secClean,
												)

												return (
													<div key={d.date} className="min-h-[46px] flex items-center justify-center">
														{block ? (
															<div
																onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
																className={cx(
																	"w-full rounded-lg px-2.5 py-1.5 flex flex-col justify-center cursor-pointer transition-all shadow-xs border text-left",
																	getBlockStyle(block.status, block.id),
																	selectedBlock === block.id && "ring-2 ring-[#0F2A5C] shadow-md scale-[1.02]",
																)}
																title={`${block.id} (${block.time}): ${block.workType}`}
															>
																<div className="flex items-center justify-between gap-1 leading-tight">
																	<span className="font-mono font-bold text-[11.5px]">{block.id}</span>
																	<span className="text-[9.5px] opacity-75">{d.name}</span>
																</div>
																<p className="text-[10px] font-medium truncate mt-0.5 opacity-90">
																	{block.workType}
																</p>
															</div>
														) : (
															<div className="w-full h-8 rounded border border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-[11px]">
																—
															</div>
														)}
													</div>
												)
											})}
										</div>
									)
								})}
							</div>
						</div>
					</div>
				)}

				{/* -------------------------------------------------------------
				    3. MONTH TIMETABLE VIEW (September 2026)
				   ------------------------------------------------------------- */}
				{viewMode === "Month" && (
					<div className="pt-4 pb-2">
						{/* Calendar Days Header */}
						<div className="grid grid-cols-7 gap-2 pb-2 text-center text-[12px] font-bold text-[#5A6D80] uppercase tracking-wider font-heading border-b border-slate-200">
							<div>MON</div>
							<div>TUE</div>
							<div>WED</div>
							<div>THU</div>
							<div>FRI</div>
							<div>SAT</div>
							<div>SUN</div>
						</div>

						{/* 5-Week Calendar Grid */}
						<div className="grid grid-cols-7 gap-2 mt-2">
							{MONTH_DAYS_DATA.map((item, idx) => {
								const isSelected = selectedMonthDay === item.day && item.isCurrentMonth
								return (
									<div
										key={idx}
										onClick={() => item.isCurrentMonth && setSelectedMonthDay(item.day)}
										className={cx(
											"min-h-[76px] rounded-xl border p-2 flex flex-col justify-between transition-all",
											!item.isCurrentMonth
												? "bg-slate-50/50 border-slate-100 text-slate-300 pointer-events-none"
												: isSelected
												? "border-[#1B4E8C] bg-[#E8EFF5]/50 ring-1 ring-[#1B4E8C] shadow-xs cursor-pointer"
												: "border-[#DDE3EA] bg-white hover:border-blue-300 hover:bg-[#F8FAFC] cursor-pointer shadow-xs",
										)}
									>
										{/* Day Number */}
										<div className="flex items-center justify-between">
											<span
												className={cx(
													"text-[13px] font-mono",
													item.isCurrentMonth ? "font-bold text-[#172B3A]" : "text-slate-300",
													isSelected && "text-[#1B4E8C] font-bold",
												)}
											>
												{item.day}
											</span>
											{isSelected && (
												<span className="h-1.5 w-1.5 rounded-full bg-[#1B4E8C]" />
											)}
										</div>

										{/* Scheduled Blocks Badge */}
										<div>
											{item.blocksCount > 0 ? (
												<div
													className={cx(
														"rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-center mt-1",
														item.blocksCount >= 3
															? "bg-[#D8E6FD] text-[#1E3A8A] border border-[#8CB3F8]"
															: "bg-[#E8EFF5] text-[#1B4E8C] border border-[#CBD8E5]",
													)}
												>
													{item.blocksCount} {item.blocksCount === 1 ? "block" : "blocks"}
												</div>
											) : (
												<div className="h-4" />
											)}
										</div>
									</div>
								)
							})}
						</div>

						{/* Month Selected Day Summary Bar */}
						{selectedMonthDay && (
							<div className="mt-4 p-3 rounded-lg bg-[#F8FAFC] border border-[#DDE3EA] flex items-center justify-between text-[12.5px]">
								<div className="flex items-center gap-2">
									<Calendar size={15} className="text-[#1B4E8C]" />
									<span className="font-semibold text-[#172B3A]">
										September {selectedMonthDay}, 2026:
									</span>
									<span className="text-[#5A6D80]">
										{MONTH_DAYS_DATA.find((d) => d.day === selectedMonthDay && d.isCurrentMonth)?.blocksCount || 0} maintenance blocks planned
									</span>
								</div>
								<button
									type="button"
									onClick={() => setViewMode("Day")}
									className="text-[12px] font-bold text-[#1B4E8C] hover:underline"
								>
									Switch to Day View →
								</button>
							</div>
						)}
					</div>
				)}

				{/* Legend */}
				<div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-[#5A6D80]">
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs bg-[#3B82F6]" /> AI Recommended
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs bg-[#F59E0B]" /> Pending Review
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs bg-[#10B981]" /> Approved
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs bg-[#EF4444]" /> Conflict
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs bg-[#14B8A6]" /> In Progress
					</span>
					<span className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-xs border border-dashed border-red-500 bg-red-100" />{" "}
						Pending Approval
					</span>
				</div>
			</div>

			{/* Secondary Row: AI Recommendation Card & High Priority Tasks */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* AI Recommendation Highlight */}
				<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<Sparkles size={18} className="text-[#1B4E8C]" />
								<h3 className="font-bold text-[15px] text-[#172B3A] font-heading">AI Decision Support</h3>
							</div>
							<span className="inline-flex items-center rounded-full bg-[#E8EFF5] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B4E8C] border border-[#CBD8E5]">
								94% Confidence
							</span>
						</div>

						<div className="mt-4 p-4 rounded-xl bg-[#E8EFF5]/50 border border-[#CBD8E5]">
							<p className="text-[12px] font-bold text-[#1B4E8C] uppercase tracking-wider">
								Recommendation · Planner Approval Required
							</p>
							<h4 className="text-[15px] font-bold text-[#172B3A] mt-1 font-heading">
								Combine 3 maintenance tasks into Block A-B
							</h4>
							<p className="text-[12.5px] text-[#5A6D80] mt-1.5 leading-relaxed">
								Tasks MT-102 (Track), MT-108 (OHE), and MT-117 (Signal) can be bundled together between 10:30–12:15, reducing track possession time by 45 minutes.
							</p>

							<div className="mt-3 flex flex-wrap gap-2 text-[11.5px] text-[#172B3A] font-medium">
								<span className="rounded-md bg-white px-2.5 py-1 border border-[#DDE3EA]">
									✓ Reduced downtime
								</span>
								<span className="rounded-md bg-white px-2.5 py-1 border border-[#DDE3EA]">
									✓ Better resource utilization
								</span>
								<span className="rounded-md bg-white px-2.5 py-1 border border-[#DDE3EA]">
									✓ Improved punctuality
								</span>
							</div>
						</div>
					</div>

					<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
						<span className="text-[12px] text-[#5A6D80]">Advisory engine active</span>
						<Link
							to="/recommendations"
							className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1B4E8C] hover:text-[#0F2A5C] transition-colors"
						>
							View all recommendations <ArrowRight size={14} />
						</Link>
					</div>
				</div>

				{/* High-Priority Maintenance Tasks */}
				<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs flex flex-col justify-between">
					<div>
						<div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<Wrench size={18} className="text-[#1B4E8C]" />
								<h3 className="font-bold text-[15px] text-[#172B3A] font-heading">Priority Maintenance Tasks</h3>
							</div>
							<span className="text-[12px] text-[#5A6D80] font-medium">12 Pending</span>
						</div>

						<div className="mt-3 space-y-2.5">
							{[
								{ id: "MT-102", dept: "TMS", title: "Rail fracture ultrasound testing", sec: "A-B", prio: "Critical", score: 94 },
								{ id: "MT-121", dept: "TDMS", title: "Cantilever insulator replacement", sec: "B-C", prio: "High", score: 88 },
								{ id: "MT-115", dept: "SMMS", title: "Point machine interlocking recalibration", sec: "C-D", prio: "Urgent", score: 82 },
							].map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between p-3 rounded-lg border border-[#DDE3EA] bg-[#F8FAFC] hover:bg-white transition-colors"
								>
									<div className="flex items-center gap-3">
										<span className="font-mono text-[12px] font-bold text-[#172B3A]">{item.id}</span>
										<span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
											{item.dept}
										</span>
										<span className="text-[12.5px] text-[#172B3A] truncate max-w-[200px] sm:max-w-[280px]">
											{item.title}
										</span>
									</div>
									<span
										className={cx(
											"rounded-full px-2 py-0.5 text-[11px] font-bold shrink-0",
											item.prio === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800",
										)}
									>
										{item.prio} ({item.score})
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
						<span className="text-[12px] text-[#5A6D80]">Sorted by priority scoring model</span>
						<Link
							to="/tasks"
							className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1B4E8C] hover:text-[#0F2A5C] transition-colors"
						>
							View task backlog <ArrowRight size={14} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
