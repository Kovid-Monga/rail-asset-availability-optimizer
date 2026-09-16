/* ==========================================================================
 * SIMULATED REAL-TIME LAYER (mock mode only)
 * --------------------------------------------------------------------------
 * Emits periodic operational events so the control centre feels live during
 * a demo. To go real, replace the setInterval with a WebSocket / SSE / poll:
 *
 *   const ws = new WebSocket(`${WS_BASE_URL}/api/stream`)
 *   ws.onmessage = (m) => push(JSON.parse(m.data))
 *
 * Everything downstream only consumes `events` and `tick`, so nothing else
 * in the app changes.
 * ========================================================================== */

import { useEffect, useRef, useState } from "react"
import { isMockMode } from "@/api"

export interface LiveEvent {
	id: string
	at: string
	severity: "info" | "warn" | "critical"
	message: string
}

const SAMPLE: Array<Omit<LiveEvent, "id" | "at">> = [
	{ severity: "warn", message: "12951 UP now 4 min late — A-B window re-checked against train path" },
	{ severity: "info", message: "Optimization run OPT-2026-0914-03 completed in 2.4 s" },
	{ severity: "critical", message: "Resource conflict: OHE-TowerWagon 1 required by BLK-07 and BLK-17" },
	{ severity: "info", message: "COA traffic forecast refreshed for the DN Main corridor" },
	{ severity: "warn", message: "BLK-16 (E-F) reported a delayed start by S&T-Unit 3" },
	{ severity: "info", message: "Defect INC-2048 routed to supervisor review" },
]

const LIVE_ENABLED = import.meta.env.VITE_ENABLE_LIVE_SIMULATION !== "false"

export function useLiveUpdates(intervalMs = 12_000) {
	const [events, setEvents] = useState<LiveEvent[]>([])
	const [tick, setTick] = useState(0)
	const i = useRef(0)

	useEffect(() => {
		if (!isMockMode || !LIVE_ENABLED) return
		const id = setInterval(() => {
			const sample = SAMPLE[i.current % SAMPLE.length]
			i.current += 1
			setEvents((prev) =>
				[{ ...sample, id: `EV-${Date.now()}`, at: new Date().toISOString() }, ...prev].slice(0, 6),
			)
			setTick((t) => t + 1)
		}, intervalMs)
		return () => clearInterval(id)
	}, [intervalMs])

	return { events, tick, enabled: isMockMode && LIVE_ENABLED }
}
