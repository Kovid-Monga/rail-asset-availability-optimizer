import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"
import type { TrendPoint } from "@/types"

const axis = { stroke: "var(--chart-axis)", fontSize: 11 }

const tooltipStyle = {
	background: "var(--surface)",
	border: "1px solid var(--border)",
	borderRadius: 8,
	fontSize: 12,
	color: "var(--text)",
}

/** Answers: is our planning reducing train delay over the week? */
export function DelayTrendChart({ data }: { data: TrendPoint[] }) {
	return (
		<ResponsiveContainer width="100%" height={170}>
			<AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
				<defs>
					<linearGradient id="delayFill" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.35} />
						<stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
					</linearGradient>
				</defs>
				<CartesianGrid stroke="var(--grid)" vertical={false} />
				<XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
				<YAxis tick={axis} axisLine={false} tickLine={false} width={44} unit="m" />
				<Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, "Est. delay"]} />
				<Area type="monotone" dataKey="value" stroke="#1D4ED8" strokeWidth={2} fill="url(#delayFill)" />
			</AreaChart>
		</ResponsiveContainer>
	)
}

/** Answers: is asset availability holding above target? */
export function AvailabilityChart({ data }: { data: TrendPoint[] }) {
	return (
		<ResponsiveContainer width="100%" height={170}>
			<LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
				<CartesianGrid stroke="var(--grid)" vertical={false} />
				<XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
				<YAxis tick={axis} axisLine={false} tickLine={false} width={44} domain={[88, 96]} unit="%" />
				<Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Availability"]} />
				<Line type="monotone" dataKey="value" stroke="#1E7D45" strokeWidth={2} dot={{ r: 2.5 }} />
			</LineChart>
		</ResponsiveContainer>
	)
}

/** Answers: which department carries the backlog, and how much is critical? */
export function BacklogChart({ data }: { data: TrendPoint[] }) {
	return (
		<ResponsiveContainer width="100%" height={170}>
			<BarChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
				<CartesianGrid stroke="var(--grid)" vertical={false} />
				<XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
				<YAxis tick={axis} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
				<Tooltip contentStyle={tooltipStyle} />
				<Bar dataKey="value" name="Open tasks" fill="#1D4ED8" radius={[4, 4, 0, 0]} barSize={26} />
				<Bar dataKey="secondary" name="Critical" fill="#C0392B" radius={[4, 4, 0, 0]} barSize={26} />
			</BarChart>
		</ResponsiveContainer>
	)
}
