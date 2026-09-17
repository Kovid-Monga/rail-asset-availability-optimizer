from typing import List
from fastapi import APIRouter
from app.schemas.ai import AIRecommendationResponse

router = APIRouter(prefix="/ai", tags=["AI Recommendations"])


@router.get("/recommendations", response_model=List[AIRecommendationResponse])
def get_ai_recommendations():
    """Retrieve AI-generated scheduling recommendations.
    ML pipeline is under construction; returns an empty list without fake data.
    """
    return []
