from typing import List, Optional
from pydantic import BaseModel

class AIRecommendationResponse(BaseModel):
    recommendation_id: str
    title: str
    task_ids: List[str]
    section: str
    line: str
    date: str
    start_time: str
    end_time: str
    explanation: Optional[str] = None
    expected_benefits: List[str] = []
    confidence: Optional[float] = None
    status: str = "PENDING_APPROVAL"
