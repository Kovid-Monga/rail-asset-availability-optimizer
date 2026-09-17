import { useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import {
	AlertCircle,
	AlertTriangle,
	Calendar,
	Check,
	CheckCircle2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileText,
	MoreVertical,
	RotateCcw,
	Save,
	Search,
	Sparkles,
	X,
	XCircle,
} from "lucide-react"
import { api } from "@/api"
import type { MaintenanceTask } from "@/types"
import {
	WEEK_DAYS,
	buildWeekTimelineItems,
	buildMonthDaysData,
	getDisplaySections,
	normalizeSection,
} from "@/data/timetableData"
import { cx } from "@/utils/display"

interface ScheduleBlockItem {
	id: string
	section: string
	line: string
	date: string
	startTime: string
	endTime: string
	duration: string
	startMinutes: number
	durationMinutes: number
	tasks: string[]
	workType: string
	status: "Approved" | "Pending Approval" | "Rejected"
}

const INITIAL_BLOCKS: ScheduleBlockItem[] = [
	{
		id: "BLK-07",
		section: "A - B",
		line: "UP Main",
		date: "Sun, 14 Sep 2026",
		startTime: "10:00",
		endTime: "12:00",
		duration: "2 h 0 min",
		startMinutes: 10 * 60,
		durationMinutes: 120,
		tasks: ["MT-102", "MT-108"],
		workType: "Track Maintenance",
		status: "Pending Approval",
	},
	{
		id: "BLK-09",
		section: "B - C",
		line: "DN Main",
		date: "Sun, 14 Sep 2026",
		startTime: "08:00",
		endTime: "11:00",
		duration: "3 h 0 min",
		startMinutes: 8 * 60,
		durationMinutes: 180,
		tasks: ["MT-121", "MT-124"],
		workType: "OHE Work",
		status: "Approved",
	},
	{
		id: "BLK-11",
		section: "C - D",
		line: "UP Main",
		date: "Sun, 14 Sep 2026",
		startTime: "13:00",
		endTime: "14:30",
		duration: "1 h 30 min",
		startMinutes: 13 * 60,
		durationMinutes: 90,
		tasks: ["MT-130"],
		workType: "Signal Maintenance",
		status: "Pending Approval",
	},
	{
		id: "BLK-13",
		section: "D - E",
		line: "DN Main",
		date: "Sun, 14 Sep 2026",
		startTime: "15:30",
		endTime: "17:30",
		duration: "2 h 0 min",
		startMinutes: 15 * 60 + 30,
		durationMinutes: 120,
		tasks: ["MT-134", "MT-138"],
		workType: "Track Renewal",
		status: "Pending Approval",
	},
	{
		id: "BLK-16",
		section: "E - F",
		line: "UP Main",
		date: "Sun, 14 Sep 2026",
		startTime: "09:00",
		endTime: "11:00",
		duration: "2 h 0 min",
		startMinutes: 9 * 60,
		durationMinutes: 120,
		tasks: ["MT-141"],
		workType: "Bridge Inspection",
		status: "Approved",
	},
	{
		id: "BLK-18",
		section: "E - F",
		line: "UP Main",
		date: "Sun, 14 Sep 2026",
		startTime: "11:30",
		endTime: "12:30",
		duration: "1 h 0 min",
		startMinutes: 11 * 60 + 30,
		durationMinutes: 60,
		tasks: ["MT-146"],
		workType: "Track Maintenance",
		status: "Pending Approval",
	},
	{
		id: "BLK-20",
		section: "F - G",
		line: "DN Main",
		date: "Sun, 14 Sep 2026",
		startTime: "16:00",
		endTime: "18:30",
		duration: "2 h 30 min",
		startMinutes: 16 * 60,
		durationMinutes: 150,
		tasks: ["MT-150", "MT-153"],
		workType: "Track Maintenance",
		status: "Pending Approval",
	},
]

const SECTIONS_CONFIG = [
	{ name: "A - B", line: "UP Main" },
	{ name: "B - C", line: "DN Main" },
	{ name: "C - D", line: "UP Main" },
	{ name: "D - E", line: "DN Main" },
	{ name: "E - F", line: "UP Main" },
	{ name: "F - G", line: "DN Main" },
]

const TIMELINE_START = 6 * 60 // 06:00
const TIMELINE_END = 21 * 60 // 21:00
const TIMELINE_SPAN = TIMELINE_END - TIMELINE_START
const TIME_TICKS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]

export function BlockSchedule() {
	const location = useLocation()
	const proposalState = location.state?.proposal as
		| { block_id: string; section: string; startTime: string; endTime: string; tasks: string[] }
		| undefined

	const [blocks, setBlocks] = useState<ScheduleBlockItem[]>([])
	const [tasks, setTasks] = useState<MaintenanceTask[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [selectedBlockId, setSelectedBlockId] = useState<string>("")
	const [isEditPanelOpen, setIsEditPanelOpen] = useState<boolean>(false)
	const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day")
	const [searchQuery, setSearchQuery] = useState<string>("")
	const [bannerMessage, setBannerMessage] = useState<string | null>(null)
	const [conflictStatus, setConflictStatus] = useState<"none" | "conflict">("none")
	const [conflictMessage, setConflictMessage] = useState<string | null>(null)
	const [initialProposal, setInitialProposal] = useState<{
		section: string
		line: string
		startTime: string
		endTime: string
	} | null>(null)

	// Fetch real block schedules from PostgreSQL backend
	const loadBlocks = async () => {
		try {
			setLoading(true)
			const raw = api.getRawBlocks ? await api.getRawBlocks() : []
			const rawTasks = api.getTasks ? await api.getTasks() : []
			setTasks(rawTasks)
			if (raw && raw.length > 0) {
				const mapped: ScheduleBlockItem[] = raw.map((b) => {
					const [sH, sM] = b.start_time.split(":").map(Number)
					const [eH, eM] = b.end_time.split(":").map(Number)
					const startMinutes = sH * 60 + sM
					const endMinutes = eH * 60 + eM
					const durationMinutes = endMinutes - startMinutes

					let statusLabel: "Approved" | "Pending Approval" | "Rejected" = "Pending Approval"
					if (b.status === "APPROVED") statusLabel = "Approved"
					else if (b.status === "REJECTED") statusLabel = "Rejected"

					return {
						id: b.block_id,
						section: b.section,
						line: b.line,
						date: b.block_date,
						startTime: b.start_time,
						endTime: b.end_time,
						duration: b.duration || `${Math.floor(durationMinutes / 60)} h ${durationMinutes % 60} min`,
						startMinutes,
						durationMinutes,
						tasks: b.tasks,
						workType: b.work_type || "Maintenance",
						status: statusLabel,
					}
				})
				setBlocks(mapped)
				if (!selectedBlockId && mapped.length > 0) {
					setSelectedBlockId(mapped[0].id)
				}
			} else {
				setBlocks([])
			}
		} catch (err) {
			console.error("Failed to load blocks:", err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadBlocks()
	}, [])

	// Currently inspected block in the edit panel
	const selectedBlock = useMemo(() => {
		return blocks.find((b) => b.id === selectedBlockId) || blocks[0]
	}, [blocks, selectedBlockId])

	// Edit form state
	const [editSection, setEditSection] = useState<string>(selectedBlock?.section || "A - B")
	const [editLine, setEditLine] = useState<string>(selectedBlock?.line || "UP Main")
	const [editStartTime, setEditStartTime] = useState<string>(selectedBlock?.startTime || "10:00")
	const [editEndTime, setEditEndTime] = useState<string>(selectedBlock?.endTime || "12:00")

	// Hand off proposal from AI Recommendations page
	useEffect(() => {
		if (proposalState) {
			setSelectedBlockId(proposalState.block_id)
			setIsEditPanelOpen(true)
			setEditSection(proposalState.section)
			setEditLine("UP Main")
			setEditStartTime(proposalState.startTime)
			setEditEndTime(proposalState.endTime)
			setInitialProposal({
				section: proposalState.section,
				line: "UP Main",
				startTime: proposalState.startTime,
				endTime: proposalState.endTime,
			})
			setBannerMessage(`Proposal ${proposalState.block_id} loaded into Edit Panel as PENDING_APPROVAL.`)
			setTimeout(() => setBannerMessage(null), 4000)
		}
	}, [proposalState])

	// Update edit fields when selected block changes
	const handleSelectBlock = (id: string) => {
		setSelectedBlockId(id)
		setIsEditPanelOpen(true)
		const b = blocks.find((item) => item.id === id)
		if (b) {
			setEditSection(b.section)
			setEditLine(b.line)
			setEditStartTime(b.startTime)
			setEditEndTime(b.endTime)
			setConflictStatus("none")
			setConflictMessage(null)
		}
	}

	// Dynamic duration display derived live from edit start & end time
	const calculatedDuration = useMemo(() => {
		try {
			const [sH, sM] = editStartTime.split(":").map(Number)
			const [eH, eM] = editEndTime.split(":").map(Number)
			if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return selectedBlock?.duration || "--"
			const diff = eH * 60 + eM - (sH * 60 + sM)
			if (diff <= 0) return "Invalid time range"
			const h = Math.floor(diff / 60)
			const m = diff % 60
			return h > 0 ? `${h} h ${m} min` : `${m} min`
		} catch {
			return selectedBlock?.duration || "--"
		}
	}, [editStartTime, editEndTime, selectedBlock])

	const handleCheckConflicts = async () => {
		if (!selectedBlock?.id) return
		try {
			if (api.checkBlockConflicts) {
				const res = await api.checkBlockConflicts(selectedBlock.id)
				setConflictStatus(res.has_conflict ? "conflict" : "none")
				setConflictMessage(res.message)
			}
		} catch (err: any) {
			setConflictStatus("conflict")
			setConflictMessage(err.message || "Failed to check conflicts")
		}
	}

	const handleSaveChanges = async () => {
		if (!selectedBlock?.id) return
		const parts = editSection.split("-")
		const secStart = parts[0]?.trim() || "A"
		const secEnd = parts[1]?.trim() || "B"
		try {
			if (api.updateBlockSchedule) {
				await api.updateBlockSchedule(selectedBlock.id, {
					section_start: secStart,
					section_end: secEnd,
					line: editLine,
					start_time: editStartTime,
					end_time: editEndTime,
				})
			}
			setBannerMessage(`Changes saved for block ${selectedBlock.id}. Status remains PENDING_APPROVAL.`)
			setTimeout(() => setBannerMessage(null), 3500)
			await loadBlocks()
		} catch (err: any) {
			setBannerMessage(`Error saving changes: ${err.message}`)
		}
	}

	const handleApprove = async () => {
		if (!selectedBlock?.id) return
		try {
			if (api.approveBlockSchedule) {
				await api.approveBlockSchedule(selectedBlock.id)
			}
			setBannerMessage(`Block ${selectedBlock.id} has been Approved.`)
			setTimeout(() => setBannerMessage(null), 3500)
			setConflictStatus("none")
			setConflictMessage(null)
			await loadBlocks()
		} catch (err: any) {
			// Fresh conflict validation rejected approval (HTTP 409 Conflict)
			setConflictStatus("conflict")
			setConflictMessage(err.message || "Approval rejected due to scheduling conflict.")
			setBannerMessage(`Cannot approve block ${selectedBlock.id}: Conflict detected.`)
		}
	}

	const handleReject = async () => {
		if (!selectedBlock?.id) return
		try {
			if (api.rejectBlockSchedule) {
				await api.rejectBlockSchedule(selectedBlock.id)
			}
			setBannerMessage(`Block ${selectedBlock.id} has been Rejected.`)
			setTimeout(() => setBannerMessage(null), 3500)
			await loadBlocks()
		} catch (err: any) {
			setBannerMessage(`Error rejecting block: ${err.message}`)
		}
	}

	const handleReset = () => {
		if (initialProposal) {
			setEditSection(initialProposal.section)
			setEditLine(initialProposal.line)
			setEditStartTime(initialProposal.startTime)
			setEditEndTime(initialProposal.endTime)
			setConflictStatus("none")
			setConflictMessage(null)
			setBannerMessage(`Reset ${selectedBlock?.id} to AI proposal parameters.`)
			setTimeout(() => setBannerMessage(null), 3000)
		} else {
			setBannerMessage("No initial AI proposal parameters available for this block.")
			setTimeout(() => setBannerMessage(null), 3000)
		}
	}

	const handleGenerateAISchedule = () => {
		setBannerMessage("AI Schedule Optimization Engine is under construction. No fake proposals generated.")
		setTimeout(() => setBannerMessage(null), 4000)
	}

	const displaySections = useMemo(() => {
		return getDisplaySections(blocks, tasks)
	}, [blocks, tasks])

	const weekTimelineItems = useMemo(() => {
		return buildWeekTimelineItems(blocks, tasks)
	}, [blocks, tasks])

	const monthDaysData = useMemo(() => {
		return buildMonthDaysData(blocks, tasks)
	}, [blocks, tasks])

	const filteredBlocks = useMemo(() => {
		if (!searchQuery.trim()) return blocks
		const q = searchQuery.toLowerCase()
		return blocks.filter(
			(b) =>
				b.id.toLowerCase().includes(q) ||
				b.section.toLowerCase().includes(q) ||
				b.tasks.some((t) => t.toLowerCase().includes(q)) ||
				b.workType.toLowerCase().includes(q) ||
				b.status.toLowerCase().includes(q),
		)
	}, [blocks, searchQuery])

	const getBlockPillStyle = (block: ScheduleBlockItem) => {
		switch (block.status) {
			case "Approved":
				return "bg-[#DCFCE7] border-[#86EFAC] text-[#166534]" // Green pill
			case "Pending Approval":
				return "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]" // Amber pill
			case "Rejected":
				return "bg-slate-100 border-slate-300 text-slate-500 line-through opacity-70"
			default:
				return "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
		}
	}

	const getStatusTagBadge = (status: ScheduleBlockItem["status"]) => {
		switch (status) {
			case "Approved":
				return "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
			case "Pending Approval":
				return "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
			case "Rejected":
				return "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
			default:
				return "bg-slate-100 text-slate-700"
		}
	}

	return (
		<div className="space-y-5 pb-10 font-sans">
			{/* Notification Banner */}
			{bannerMessage && (
				<div className="rounded-lg bg-[#E8EFF5] border border-[#1B4E8C]/30 px-4 py-2.5 text-[13px] text-[#0F2A5C] font-medium flex items-center justify-between shadow-xs animate-fadeUp">
					<span>{bannerMessage}</span>
					<button type="button" onClick={() => setBannerMessage(null)} className="text-[#1B4E8C]">
						<X size={16} />
					</button>
				</div>
			)}

			{/* =========================================================
			    TOP PAGE HEADER & ACTIONS
			   ========================================================= */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{/* Title & Subtitle */}
				<div className="flex items-center gap-3.5">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] shadow-xs">
						<Calendar size={22} />
					</div>
					<div>
						<h1 className="text-[22px] font-bold tracking-tight text-[#172B3A] leading-tight font-heading">
							Block Schedule
						</h1>
						<p className="text-[13px] text-[#5A6D80] mt-0.5">
							Edit, reschedule and approve AI proposed blocks
						</p>
					</div>
				</div>

				{/* Right Controls: Date, Day/Week/Month, Generate AI Schedule */}
				<div className="flex flex-wrap items-center gap-3">
					{/* Date controls */}
					<div className="flex items-center gap-2">
						{/* Previous button */}
						<button
							type="button"
							aria-label="Previous date"
							className="flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-[#DDE3EA] bg-white text-[#5A6D80] hover:bg-[#F8FAFC] shadow-xs transition-colors"
						>
							<ChevronLeft size={16} />
						</button>

						{/* Date dropdown button */}
						<button
							type="button"
							className="flex h-[36px] items-center gap-2 rounded-lg border border-[#DDE3EA] bg-white px-3.5 text-[13px] font-medium text-[#172B3A] shadow-xs hover:bg-[#F8FAFC] transition-colors"
						>
							<Calendar size={15} className="text-[#2563EB]" />
							<span>Sun, 14 Sep 2026</span>
							<ChevronDown size={14} className="text-slate-400" />
						</button>

						{/* View toggle (Day / Week / Month) */}
						<div className="flex h-[36px] items-center rounded-lg border border-[#DDE3EA] bg-[#F4F6F9] p-0.5 shadow-xs">
							{(["Day", "Week", "Month"] as const).map((mode) => (
								<button
									key={mode}
									type="button"
									onClick={() => setViewMode(mode)}
									className={cx(
										"h-[30px] rounded-md px-3 text-[13px] font-medium transition-all",
										viewMode === mode
											? "bg-[#1E3A8A] text-white shadow-xs"
											: "text-[#5A6D80] hover:text-[#172B3A]",
									)}
								>
									{mode}
								</button>
							))}
						</div>
					</div>

					{/* Generate AI Schedule Button */}
					<button
						type="button"
						onClick={handleGenerateAISchedule}
						className="flex h-[36px] items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-[13px] font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
					>
						<Sparkles size={16} />
						<span>Generate AI Schedule</span>
					</button>
				</div>
			</div>

			{/* =========================================================
			    MAIN WORKSPACE: TWO COLUMNS (TIMELINE/TABLE + EDIT BLOCK)
			   ========================================================= */}
			<div className={cx("grid gap-6", isEditPanelOpen ? "grid-cols-1 xl:grid-cols-[1fr_370px]" : "grid-cols-1")}>
				{/* ---------------- LEFT COLUMN: SCHEDULE & TABLE ---------------- */}
				<div className="space-y-6 min-w-0">
					{/* 1. TIMELINE CONTAINER CARD */}
					<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs">
						{/* Legend Bar */}
						<div className="flex flex-wrap items-center gap-6 pb-4 border-b border-slate-100 text-[12px] text-[#5A6D80] font-medium">
							<span className="flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" /> Approved
							</span>
							<span className="flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" /> AI Proposed
							</span>
							<span className="flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" /> Pending Approval
							</span>
							<span className="flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /> Conflict
							</span>
						</div>

						{/* Day Timeline */}
						{viewMode === "Day" && (
							<div className="overflow-x-auto pt-4 pb-2">
								<div className="min-w-[720px]">
									{/* Time Header */}
									<div className="flex items-center pb-2.5 border-b border-slate-200 text-[11px] font-semibold text-[#5A6D80]">
										<div className="w-28 shrink-0 font-bold text-[#172B3A] uppercase tracking-wider pl-1 font-heading">
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
										{/* Vertical grid lines */}
										<div className="absolute inset-y-0 left-28 right-0 pointer-events-none" aria-hidden>
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

										{SECTIONS_CONFIG.map((sec) => {
											const secBlocks = blocks.filter((b) => b.section === sec.name)

											return (
												<div key={sec.name} className="relative flex items-center h-[58px]">
													{/* Section Name & Line subtitle */}
													<div className="w-28 shrink-0 pl-1 leading-tight select-none">
														<p className="font-bold text-[13px] text-[#172B3A] font-heading">{sec.name}</p>
														<p className="text-[11px] text-[#5A6D80]">{sec.line}</p>
													</div>

													{/* Track Block Slot */}
													<div className="relative flex-1 h-full">
														{secBlocks.map((b) => {
															const leftPct = ((b.startMinutes - TIMELINE_START) / TIMELINE_SPAN) * 100
															const widthPct = (b.durationMinutes / TIMELINE_SPAN) * 100
															const isSelected = selectedBlockId === b.id

															return (
																<div
																	key={b.id}
																	onClick={() => handleSelectBlock(b.id)}
																	style={{
																		left: `${leftPct}%`,
																		width: `${widthPct}%`,
																	}}
																	className={cx(
																		"absolute top-2 bottom-2 rounded-lg px-2.5 py-1 flex flex-col justify-center cursor-pointer select-none transition-all shadow-xs border",
																		getBlockPillStyle(b),
																		isSelected
																			? "ring-2 ring-[#1E3A8A] shadow-md z-20 scale-[1.01]"
																			: "hover:shadow-sm hover:brightness-95",
																	)}
																	title={`${b.id} (${b.startTime} - ${b.endTime}): ${b.workType}`}
																>
																	<div className="font-bold text-[11px] font-mono leading-none">
																		{b.id}
																	</div>
																	<div className="text-[10px] opacity-85 leading-tight mt-0.5">
																		{b.startTime} - {b.endTime}
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

						{/* Week View Table */}
						{viewMode === "Week" && (
							<div className="overflow-x-auto pt-4 pb-2">
								<div className="min-w-[700px]">
									<div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 pb-2.5 border-b border-slate-200 text-center font-heading">
										<div className="text-left font-bold text-[12px] uppercase text-[#172B3A] pl-2">Section</div>
										{WEEK_DAYS.map((d) => (
											<div key={d.name} className="text-[#5A6D80]">
												<span className="block text-[11px] uppercase tracking-wider">{d.name}</span>
												<span className="block text-[13.5px] font-bold text-[#172B3A]">{d.date}</span>
											</div>
										))}
									</div>
									<div className="divide-y divide-slate-100 mt-1">
										{displaySections.map((secName) => (
											<div key={secName} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 py-2.5 items-center">
												<div className="font-bold text-[12.5px] text-[#172B3A] pl-2 font-heading">{secName}</div>
												{WEEK_DAYS.map((d) => {
													const item = weekTimelineItems.find(
														(b) => b.day === d.date && normalizeSection(b.section) === normalizeSection(secName),
													)
													return (
														<div key={d.date} className="min-h-[38px] flex items-center justify-center">
															{item ? (
																<div
																	onClick={() => {
																		if (item.type === "block") handleSelectBlock(item.id)
																		else setBannerMessage(`Request ${item.id} (${item.department}): ${item.title} [${item.duration}]`)
																	}}
																	className={cx(
																		"w-full rounded-md px-1.5 py-1 text-center font-mono text-[11px] font-bold cursor-pointer hover:shadow-xs transition-all",
																		item.type === "block"
																			? "bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD]"
																			: "bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]",
																	)}
																	title={`${item.type === "block" ? "Block" : "Request"} ${item.id}: ${item.title} (${item.duration})`}
																>
																	{item.id}
																</div>
															) : (
																<span className="text-slate-300 text-[11px]">—</span>
															)}
														</div>
													)
												})}
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Month View Calendar */}
						{viewMode === "Month" && (
							<div className="pt-4 pb-2">
								<div className="grid grid-cols-7 gap-2 pb-2 text-center text-[11.5px] font-bold text-[#5A6D80] uppercase tracking-wider font-heading border-b border-slate-200">
									<div>MON</div>
									<div>TUE</div>
									<div>WED</div>
									<div>THU</div>
									<div>FRI</div>
									<div>SAT</div>
									<div>SUN</div>
								</div>
								<div className="grid grid-cols-7 gap-2 mt-2">
									{monthDaysData.map((item, idx) => (
										<div
											key={idx}
											onClick={() => item.isCurrentMonth && setViewMode("Day")}
											className={cx(
												"min-h-[64px] rounded-lg border p-1.5 flex flex-col justify-between transition-all",
												!item.isCurrentMonth
													? "bg-slate-50/50 border-slate-100 text-slate-300 pointer-events-none"
													: item.day === 14
													? "border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB] cursor-pointer"
													: "border-[#DDE3EA] bg-white hover:bg-[#F8FAFC] cursor-pointer",
											)}
										>
											<span className="text-[12px] font-mono font-bold text-[#172B3A]">{item.day}</span>
											{item.blocksCount > 0 ? (
												<span className="rounded bg-[#E8EFF5] text-[#1B4E8C] text-[10px] font-bold px-1 py-0.5 text-center">
													{item.blocksCount} {item.blocksCount === 1 ? (item.items?.[0]?.type === "request" ? "req" : "block") : "items"}
												</span>
											) : (
												<div />
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* 2. BLOCKS FOR SELECTED DATE TABLE */}
					<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
							<div className="flex items-center gap-2.5">
								<Calendar size={18} className="text-[#2563EB]" />
								<h2 className="text-[15px] font-bold text-[#172B3A] tracking-tight font-heading">
									Blocks for Selected Date ({filteredBlocks.length})
								</h2>
							</div>

							<div className="relative w-full sm:w-64">
								<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search blocks..."
									className="w-full rounded-lg border border-[#DDE3EA] bg-[#F8FAFC] pl-8 pr-3 py-1.5 text-[12.5px] text-[#172B3A] placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] focus:outline-none transition-all"
								/>
							</div>
						</div>

						{/* Table */}
						<div className="overflow-x-auto border-t border-slate-100">
							<table className="w-full text-left text-[13px] border-collapse">
								<thead>
									<tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-[#5A6D80] font-heading">
										<th className="py-3 px-3">Block ID</th>
										<th className="py-3 px-3">Section</th>
										<th className="py-3 px-3">Time</th>
										<th className="py-3 px-3">Duration</th>
										<th className="py-3 px-3">Tasks</th>
										<th className="py-3 px-3">Status</th>
										<th className="py-3 px-3 text-center">Actions</th>
										<th className="py-3 px-1 text-right"></th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100 text-[#172B3A]">
									{filteredBlocks.length === 0 ? (
										<tr>
											<td colSpan={8} className="py-8 text-center text-slate-400 text-[13px]">
												No block schedules found for this date.
											</td>
										</tr>
									) : (
										filteredBlocks.map((b) => {
										const isSelected = selectedBlockId === b.id
										return (
											<tr
												key={b.id}
												onClick={() => handleSelectBlock(b.id)}
												className={cx(
													"hover:bg-[#F8FAFC] transition-colors cursor-pointer",
													isSelected && "bg-[#EFF6FF]",
												)}
											>
												<td className="py-3 px-3 font-semibold font-mono text-[#172B3A]">{b.id}</td>
												<td className="py-3 px-3 font-medium text-[#172B3A]">{b.section}</td>
												<td className="py-3 px-3 font-mono text-[#5A6D80]">
													{b.startTime} - {b.endTime}
												</td>
												<td className="py-3 px-3 text-[#5A6D80]">{b.duration}</td>
												<td className="py-3 px-3 text-[#5A6D80]">{b.tasks.join(", ")}</td>
												<td className="py-3 px-3">
													<span
														className={cx(
															"inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
															getStatusTagBadge(b.status),
														)}
													>
														{b.status}
													</span>
												</td>
												<td className="py-3 px-3 text-center">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation()
															handleSelectBlock(b.id)
														}}
														className="rounded-md border border-[#DDE3EA] bg-white px-3 py-1 text-[11.5px] font-semibold text-[#172B3A] shadow-2xs hover:bg-[#F8FAFC] hover:border-[#1B4E8C] transition-colors"
													>
														Edit
													</button>
												</td>
												<td className="py-3 px-1 text-right">
													<button
														type="button"
														aria-label="More"
														className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
													>
														<MoreVertical size={15} />
													</button>
												</td>
											</tr>
										)
									}))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* ---------------- RIGHT COLUMN: EDIT BLOCK PANEL ---------------- */}
				{isEditPanelOpen && (
					<div className="rounded-xl border border-[#DDE3EA] bg-white p-5 shadow-xs flex flex-col justify-between self-start animate-fadeUp">
						<div>
							{/* Panel Header */}
							<div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
								<h2 className="text-[16px] font-bold text-[#172B3A] font-heading">Edit Block</h2>
								<button
									type="button"
									onClick={() => setIsEditPanelOpen(false)}
									className="text-slate-400 hover:text-slate-700 transition-colors p-1"
								>
									<X size={18} />
								</button>
							</div>

							{/* Block ID & Status Pill */}
							<div className="flex items-center justify-between mt-4">
								<div className="flex items-center gap-2.5">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
										<Calendar size={18} />
									</div>
									<span className="text-[18px] font-bold font-mono text-[#172B3A]">
										{selectedBlock?.id || "—"}
									</span>
								</div>
								<span
									className={cx(
										"rounded-full px-3 py-1 text-[11.5px] font-semibold",
										getStatusTagBadge(selectedBlock?.status || "Pending Approval"),
									)}
								>
									{selectedBlock?.status || "Pending Approval"}
								</span>
							</div>

							{/* Form Fields */}
							<div className="mt-5 space-y-4 text-[12.5px]">
								{/* Section & Line */}
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
											Section
										</label>
										<div className="relative">
											<select
												value={editSection}
												onChange={(e) => setEditSection(e.target.value)}
												className="w-full appearance-none rounded-lg border border-[#DDE3EA] bg-white px-3 py-2 text-[#172B3A] font-medium shadow-2xs outline-none focus:border-[#2563EB] cursor-pointer"
											>
												{SECTIONS_CONFIG.map((s) => (
													<option key={s.name} value={s.name}>
														{s.name}
													</option>
												))}
											</select>
											<ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
										</div>
									</div>

									<div>
										<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
											Line
										</label>
										<div className="relative">
											<select
												value={editLine}
												onChange={(e) => setEditLine(e.target.value)}
												className="w-full appearance-none rounded-lg border border-[#DDE3EA] bg-white px-3 py-2 text-[#172B3A] font-medium shadow-2xs outline-none focus:border-[#2563EB] cursor-pointer"
											>
												<option value="UP Main">UP Main</option>
												<option value="DN Main">DN Main</option>
												<option value="Single Line">Single Line</option>
											</select>
											<ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
										</div>
									</div>
								</div>

								{/* Date */}
								<div>
									<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
										Date
									</label>
									<div className="relative">
										<input
											type="text"
											readOnly
											value={selectedBlock?.date || ""}
											className="w-full rounded-lg border border-[#DDE3EA] bg-[#F8FAFC] pl-8 pr-3 py-2 text-[#172B3A] font-medium outline-none cursor-default"
										/>
										<Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#2563EB]" />
									</div>
								</div>

								{/* Start Time & End Time */}
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
											Start Time
										</label>
										<div className="relative">
											<input
												type="text"
												value={editStartTime}
												onChange={(e) => setEditStartTime(e.target.value)}
												className="w-full rounded-lg border border-[#DDE3EA] bg-white px-3 py-2 text-[#172B3A] font-mono outline-none focus:border-[#2563EB]"
											/>
											<Clock size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
										</div>
									</div>

									<div>
										<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
											End Time
										</label>
										<div className="relative">
											<input
												type="text"
												value={editEndTime}
												onChange={(e) => setEditEndTime(e.target.value)}
												className="w-full rounded-lg border border-[#DDE3EA] bg-white px-3 py-2 text-[#172B3A] font-mono outline-none focus:border-[#2563EB]"
											/>
											<Clock size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
										</div>
									</div>
								</div>

								{/* Duration */}
								<div>
									<label className="block text-[11.5px] font-semibold text-[#5A6D80] mb-1">
										Duration
									</label>
									<input
										type="text"
										readOnly
										value={calculatedDuration}
										className="w-full rounded-lg border border-[#DDE3EA] bg-[#F8FAFC] px-3 py-2 text-[#5A6D80] font-medium outline-none cursor-default"
									/>
								</div>

								{/* Included Tasks */}
								<div>
									<div className="flex items-center justify-between mb-1.5">
										<label className="block text-[11.5px] font-semibold text-[#5A6D80]">
											Included Tasks ({selectedBlock ? selectedBlock.tasks.length : 0})
										</label>
										<button
											type="button"
											className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#2563EB] hover:underline"
										>
											<FileText size={12} /> Modify Tasks
										</button>
									</div>
									<div className="flex flex-wrap gap-2">
										{selectedBlock && selectedBlock.tasks.map((task) => (
											<span
												key={task}
												className="rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 text-[11.5px] font-mono font-bold text-[#1E40AF]"
											>
												{task}
											</span>
										))}
									</div>
								</div>

								{/* Check for Conflicts Button */}
								<button
									type="button"
									onClick={handleCheckConflicts}
									className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#BFDBFE] bg-white py-2 text-[12.5px] font-semibold text-[#2563EB] shadow-2xs hover:bg-[#EFF6FF] transition-colors"
								>
									<Search size={14} />
									<span>Check for Conflicts</span>
								</button>

								{/* Conflict / Availability Status Card */}
								{conflictStatus === "none" ? (
									<div className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-3 flex items-start gap-2.5">
										<CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5" />
										<div className="leading-tight">
											<p className="font-bold text-[12.5px] text-[#065F46]">No conflicts detected</p>
											<p className="text-[11.5px] text-[#047857] mt-0.5">
												{conflictMessage || "This time slot is available."}
											</p>
										</div>
									</div>
								) : (
									<div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 flex items-start gap-2.5">
										<AlertCircle size={18} className="text-[#DC2626] shrink-0 mt-0.5" />
										<div className="leading-tight">
											<p className="font-bold text-[12.5px] text-[#991B1B]">Conflict Detected</p>
											<p className="text-[11.5px] text-[#B91C1C] mt-0.5">
												{conflictMessage || "Schedule overlaps with another block."}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Bottom Actions */}
						<div className="mt-5 pt-3 border-t border-slate-100 space-y-2.5">
							{/* Save Changes Button */}
							<button
								type="button"
								onClick={handleSaveChanges}
								className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] py-2.5 text-[13px] font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
							>
								<Save size={15} />
								<span>Save Changes</span>
							</button>

							{/* Dual Action: Reject / Approve */}
							<div className="grid grid-cols-2 gap-2.5">
								<button
									type="button"
									onClick={handleReject}
									className="flex items-center justify-center gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] py-2 text-[12.5px] font-semibold text-[#DC2626] hover:bg-red-100 transition-colors"
								>
									<XCircle size={14} />
									<span>Reject</span>
								</button>
								<button
									type="button"
									onClick={handleApprove}
									className="flex items-center justify-center gap-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] py-2 text-[12.5px] font-semibold text-[#059669] hover:bg-emerald-100 transition-colors"
								>
									<Check size={14} />
									<span>Approve</span>
								</button>
							</div>

							{/* Reset to AI Proposal Link */}
							<button
								type="button"
								onClick={handleReset}
								className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-[#2563EB] hover:underline pt-1"
							>
								<RotateCcw size={13} />
								<span>Reset to AI Proposal</span>
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
