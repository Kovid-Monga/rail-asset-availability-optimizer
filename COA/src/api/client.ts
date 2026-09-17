/* ==========================================================================
 * HTTP CLIENT — single configuration point for the backend
 * --------------------------------------------------------------------------
 * VITE_API_BASE_URL   base URL of the backend
 * VITE_DATA_SOURCE    "mock" | "live"
 * No component ever calls fetch() directly.
 * ========================================================================== */

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? ""
export const DATA_SOURCE: "mock" | "live" =
	(import.meta.env.VITE_DATA_SOURCE as "mock" | "live") ?? "mock"

export class ApiError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message)
		this.name = "ApiError"
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	let res: Response
	try {
		res = await fetch(`${API_BASE_URL}${path}`, {
			headers: { "Content-Type": "application/json" },
			...init,
		})
	} catch {
		throw new ApiError("Unable to reach the optimization engine. Check the API base URL and that the backend is running.")
	}
	if (!res.ok) {
		throw new ApiError(`Backend responded ${res.status} for ${path}.`, res.status)
	}
	return (await res.json()) as T
}

export const http = {
	get: <T,>(path: string) => request<T>(path),
	post: <T,>(path: string, body?: unknown) =>
		request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
	put: <T,>(path: string, body?: unknown) =>
		request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
}
