/* Shared primitives: panel, section header, button, field, async states. */
import { isValidElement, type ComponentType, type ReactNode } from "react"
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react"
import { cx } from "@/utils/display"

export function Panel({
	children,
	className,
	padded = true,
}: {
	children: ReactNode
	className?: string
	padded?: boolean
}) {
	return <section className={cx("panel", padded && "p-5", className)}>{children}</section>
}

export function SectionHeader({
	title,
	subtitle,
	action,
	eyebrow,
	icon: Icon,
}: {
	title: string
	subtitle?: string
	action?: ReactNode
	eyebrow?: string
	icon?: ComponentType<{ size?: number | string; className?: string }> | ReactNode
}) {
	return (
		<header className="mb-4 flex flex-wrap items-start justify-between gap-3">
			<div>
				{eyebrow ? (
					<div className="mb-1.5 flex items-center gap-1.5">
						{Icon ? (
							<span className="flex h-5 w-5 items-center justify-center rounded bg-accentSoft text-accent">
								{isValidElement(Icon) ? (
									Icon
								) : (
									(() => {
										const IconComp = Icon as ComponentType<{ size?: number | string; className?: string }>
										return <IconComp size={12} />
									})()
								)}
							</span>
						) : null}
						<p className="label-xs leading-none uppercase tracking-wider">{eyebrow}</p>
					</div>
				) : null}
				<h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>
				{subtitle ? <p className="mt-1 max-w-[70ch] text-sm text-muted">{subtitle}</p> : null}
			</div>
			{action}
		</header>
	)
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
	return (
		<header className="mb-6 flex flex-wrap items-end justify-between gap-3">
			<div>
				<h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
				{subtitle ? <p className="mt-1 max-w-[80ch] text-sm text-muted">{subtitle}</p> : null}
			</div>
			{action}
		</header>
	)
}

export function Button({
	children,
	onClick,
	variant = "ghost",
	size = "md",
	disabled,
	title,
	type = "button",
	className,
}: {
	children: ReactNode
	onClick?: () => void
	variant?: "primary" | "ghost" | "danger" | "positive"
	size?: "sm" | "md"
	disabled?: boolean
	title?: string
	type?: "button" | "submit"
	className?: string
}) {
	const variants: Record<string, string> = {
		primary: "bg-accent text-white hover:bg-govNavy border-transparent",
		ghost: "bg-raised text-ink hover:bg-accentSoft border-line",
		danger: "bg-[#C0392B]/10 text-[#C0392B] hover:bg-[#C0392B]/15 border-[#C0392B]/45",
		positive: "bg-[#1E7D45]/10 text-[#1E7D45] hover:bg-[#1E7D45]/15 border-[#1E7D45]/45",
	}
	return (
		<button
			type={type}
			title={title}
			disabled={disabled}
			onClick={onClick}
			className={cx(
				"inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45",
				size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-sm",
				variants[variant],
				className,
			)}
		>
			{children}
		</button>
	)
}

export function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
	return (
		<div>
			<p className="label-xs">{label}</p>
			<p className={cx("mt-0.5 text-sm", mono && "mono")}>{value}</p>
		</div>
	)
}

/* ------------------------- loading / error / empty ------------------------ */

export function LoadingState({ message = "Loading…" }: { message?: string }) {
	return (
		<div className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-muted">
			<Loader2 size={20} className="animate-spin text-accent" />
			<p className="text-sm">{message}</p>
		</div>
	)
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
	return (
		<div className="flex min-h-[180px] flex-col items-center justify-center gap-3 px-6 text-center">
			<AlertTriangle size={20} className="text-[#C0392B]" />
			<p className="max-w-[52ch] text-sm">{message}</p>
			{onRetry ? (
				<Button size="sm" onClick={onRetry}>
					<RefreshCw size={14} /> Retry
				</Button>
			) : null}
		</div>
	)
}

export function EmptyState({ message }: { message: string }) {
	return (
		<div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-muted">
			<Inbox size={20} />
			<p className="text-sm">{message}</p>
		</div>
	)
}

/** Renders the right state for an async slice of backend data. */
export function AsyncBoundary<T>({
	state,
	loadingMessage,
	emptyMessage,
	isEmpty,
	children,
}: {
	state: { data: T | undefined; loading: boolean; error: string | undefined; refetch: () => void }
	loadingMessage?: string
	emptyMessage?: string
	isEmpty?: (data: T) => boolean
	children: (data: T) => ReactNode
}) {
	if (state.loading && state.data === undefined) return <LoadingState message={loadingMessage} />
	if (state.error) return <ErrorState message={state.error} onRetry={state.refetch} />
	if (state.data === undefined) return <EmptyState message={emptyMessage ?? "No data available."} />
	if (isEmpty?.(state.data)) return <EmptyState message={emptyMessage ?? "Nothing to show yet."} />
	return <>{children(state.data)}</>
}
