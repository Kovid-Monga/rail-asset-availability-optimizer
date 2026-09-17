"""Priority Service Stub
Computes priority score (0-100) and urgency classification based on safety, track type, and traffic impact.
Real model to be plugged in once pipeline is connected.
"""
from typing import Dict, Any

class PriorityService:
    @staticmethod
    def calculate_priority(need_id: int) -> Dict[str, Any]:
        # TODO: Connect actual Priority Model
        return {
            "need_id": need_id,
            "status": "UNDER_CONSTRUCTION",
            "priority": None,
            "score": None,
        }
