/* ==========================================================================
 * DATA HOOKS   API → Hook → Page → Components
 * --------------------------------------------------------------------------
 * Components never call the api module directly; they receive typed data
 * plus loading / error / lastUpdated state from these hooks.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react"
import { api } from "@/api"
import type {
	AIRecommendation,
	AsyncState,
	DashboardResponse,
	Incident,
	MaintenanceTask,
	NetworkResponse,
	ScheduleResponse,
} from "@/types"

function useAsync<T>(fetcher: () => Promise<T>): AsyncState<T> {
	const [data, setData] = useState<T>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const [lastUpdated, setLastUpdated] = useState<string>()
	const mounted = useRef(true)
	const fetcherRef = useRef(fetcher)
	fetcherRef.current = fetcher

	const run = useCallback(() => {
		setLoading(true)
		setError(undefined)
		fetcherRef
			.current()
			.then((res) => {
				if (!mounted.current) return
				setData(res)
				setLastUpdated(new Date().toISOString())
			})
			.catch((e: unknown) => {
				if (!mounted.current) return
				setError(e instanceof Error ? e.message : "Unexpected error")
			})
			.finally(() => {
				if (mounted.current) setLoading(false)
			})
	}, [])

	useEffect(() => {
		mounted.current = true
		run()
		return () => {
			mounted.current = false
		}
	}, [run])

	return { data, loading, error, lastUpdated, refetch: run }
}

export const useTasks = (): AsyncState<MaintenanceTask[]> => useAsync(() => api.getTasks())
export const useSchedule = (): AsyncState<ScheduleResponse> => useAsync(() => api.getSchedule())
export const useDashboard = (): AsyncState<DashboardResponse> => useAsync(() => api.getDashboard())
export const useRecommendations = (): AsyncState<AIRecommendation[]> => useAsync(() => api.getRecommendations())
export const useNetwork = (): AsyncState<NetworkResponse> => useAsync(() => api.getNetwork())
export const useIncidents = (): AsyncState<Incident[]> => useAsync(() => api.getIncidents())
