/* ==========================================================================
 * UNIVERSAL ISSUE REPORTING
 * Submitted → Supervisor Review → AI Prioritization → Scheduled
 * The form only POSTs; the pipeline stage comes back from the backend.
 * ========================================================================== */

import { useState } from "react"
import { Check, Paperclip, Send } from "lucide-react"
import type { Incident } from "@/types"
import { Button } from "./ui"
import { cx } from "@/utils/display"

const ISSUE_TYPES = [
	"Track defect",
	"Signal failure",
	"OHE damage",
	"Level crossing fault",
	"Vegetation / obstruction",
	"Other",
]
const SECTIONS = ["A-B", "B-C", "C-D", "D-E", "E-F", "F-G"]

const STAGES: Array<Incident["stage"]> = ["SUBMITTED", "SUPERVISOR_REVIEW", "AI_PRIORITIZATION", "SCHEDULED"]
const STAGE_LABEL: Record<Incident["stage"], string> = {
	SUBMITTED: "Submitted",
	SUPERVISOR_REVIEW: "Supervisor review",
	AI_PRIORITIZATION: "AI prioritization",
	SCHEDULED: "Scheduled",
}

/** Horizontal progress rail shown on each reported issue. */
export function IncidentStages({ stage }: { stage: Incident["stage"] }) {
	const current = STAGES.indexOf(stage)
	return (
		<ol className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
			{STAGES.map((s, i) => {
				const done = i <= current
				return (
					<li key={s} className="flex items-center gap-2">
						<span
							className={cx(
								"inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px]",
								done ? "border-accent/45 bg-accentSoft text-accent" : "border-line text-muted",
							)}
						>
							{done ? <Check size={10} /> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />}
							{STAGE_LABEL[s]}
						</span>
						{i < STAGES.length - 1 ? <span aria-hidden className="h-px w-3 bg-line" /> : null}
					</li>
				)
			})}
		</ol>
	)
}

export function IncidentForm({
	onSubmit,
	submitting,
	submitted,
}: {
	onSubmit: (input: Omit<Incident, "incident_id" | "reported_at" | "stage">) => void | Promise<void>
	submitting?: boolean
	submitted?: string | null
}) {
	const [issueType, setIssueType] = useState(ISSUE_TYPES[0])
	const [description, setDescription] = useState("")
	const [section, setSection] = useState(SECTIONS[0])
	const [location, setLocation] = useState("")
	const [photoName, setPhotoName] = useState("")

	const inputClass =
		"mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] outline-none focus:border-accent"
	const valid = description.trim().length > 3 && location.trim().length > 0

	return (
		<form
			className="space-y-3"
			onSubmit={(e) => {
				e.preventDefault()
				if (!valid) return
				void onSubmit({
					issue_type: issueType,
					description: description.trim(),
					block_section: section,
					work_location: location.trim(),
					photo_name: photoName || undefined,
					reported_by: "Field staff",
				})
				setDescription("")
				setLocation("")
				setPhotoName("")
			}}
		>
			<label className="block">
				<span className="label-xs">Issue type</span>
				<select value={issueType} onChange={(e) => setIssueType(e.target.value)} className={inputClass}>
					{ISSUE_TYPES.map((t) => (
						<option key={t}>{t}</option>
					))}
				</select>
			</label>

			<label className="block">
				<span className="label-xs">Description</span>
				<textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					rows={3}
					placeholder="What did you observe?"
					className={inputClass}
				/>
			</label>

			<div className="grid gap-3 sm:grid-cols-2">
				<label className="block">
					<span className="label-xs">Block section</span>
					<select value={section} onChange={(e) => setSection(e.target.value)} className={inputClass}>
						{SECTIONS.map((s) => (
							<option key={s}>{s}</option>
						))}
					</select>
				</label>
				<label className="block">
					<span className="label-xs">Location (KM)</span>
					<input
						value={location}
						onChange={(e) => setLocation(e.target.value)}
						placeholder="KM 142/6"
						className={inputClass}
					/>
				</label>
			</div>

			<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line px-3 py-2.5 text-[12.5px] text-muted hover:border-accent">
				<Paperclip size={14} />
				{photoName || "Attach a photo (optional)"}
				<input
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")}
				/>
			</label>

			<Button type="submit" variant="primary" disabled={!valid || submitting} className="w-full">
				<Send size={14} /> {submitting ? "Submitting…" : "Submit report"}
			</Button>

			{submitted ? (
				<p className="rounded-lg border border-[#72BC8F]/35 bg-[#72BC8F]/[0.08] px-3 py-2 text-[12.5px] text-[#72BC8F]">
					Report {submitted} submitted — awaiting supervisor review.
				</p>
			) : null}

			<p className="text-[11.5px] text-muted">
				Reports enter the same pipeline as system-generated needs: the priority model scores them after supervisor
				review.
			</p>
		</form>
	)
}
