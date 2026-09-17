import { useState } from "react"
import { api } from "@/api"
import { AsyncBoundary, Panel, PageHeader } from "@/components/ui"
import { AIRecommendationCard } from "@/components/AIRecommendation"
import { useRecommendations } from "@/hooks/useApi"
import { ROLE_CAPABILITIES, useApp } from "@/store/AppContext"

export function AIRecommendations() {
	const recommendations = useRecommendations()
	const { role, selectTask } = useApp()
	const caps = ROLE_CAPABILITIES[role]
	const [applying, setApplying] = useState<string | null>(null)

	const apply = async (id: string) => {
		setApplying(id)
		try {
			await api.applyRecommendation(id)
			recommendations.refetch()
		} finally {
			setApplying(null)
		}
	}

	return (
		<div>
			<PageHeader
				title="AI decision support"
				subtitle="Recommendations from the priority, compatibility and optimization models. Every one is advisory — a planner decides."
			/>
			<Panel>
				<AsyncBoundary
					state={recommendations}
					loadingMessage="Connecting to optimization engine…"
					emptyMessage="No AI recommendations available"
					isEmpty={(r) => r.length === 0}
				>
					{(recs) => (
						<div className="space-y-4">
							{recs.map((r) => (
								<AIRecommendationCard
									key={r.recommendation_id}
									recommendation={r}
									canApprove={caps.approve}
									applying={applying === r.recommendation_id}
									onApply={apply}
									onSelectTask={selectTask}
								/>
							))}
						</div>
					)}
				</AsyncBoundary>
			</Panel>
		</div>
	)
}
