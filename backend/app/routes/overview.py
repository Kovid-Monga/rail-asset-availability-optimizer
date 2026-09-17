from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.block import BlockSchedule
from app.models.request import MaintenanceRequest
from app.schemas.block import OverviewStatsResponse

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("/stats", response_model=OverviewStatsResponse)
def get_overview_stats(db: Session = Depends(get_db)):
    """Retrieve aggregate statistics from real database tables."""
    total_blocks = db.query(BlockSchedule).count()
    approved = db.query(BlockSchedule).filter(BlockSchedule.status == "APPROVED").count()
    pending_approval = (
        db.query(BlockSchedule)
        .filter(BlockSchedule.status == "PENDING_APPROVAL")
        .count()
    )
    submitted_requests = (
        db.query(MaintenanceRequest)
        .filter(MaintenanceRequest.status == "SUBMITTED")
        .count()
    )

    # Dynamic conflict calculation:
    # Find blocks that overlap on the same section, line, date, and time
    # (Excludes REJECTED blocks; CONFLICT is NOT a status)
    active_blocks = (
        db.query(BlockSchedule)
        .filter(BlockSchedule.status != "REJECTED")
        .all()
    )

    conflicting_ids = set()
    for i in range(len(active_blocks)):
        b1 = active_blocks[i]
        for j in range(i + 1, len(active_blocks)):
            b2 = active_blocks[j]
            if (
                b1.block_date == b2.block_date
                and b1.section_start == b2.section_start
                and b1.section_end == b2.section_end
                and b1.line == b2.line
                and b1.start_time < b2.end_time
                and b1.end_time > b2.start_time
            ):
                conflicting_ids.add(b1.block_id)
                conflicting_ids.add(b2.block_id)

    return OverviewStatsResponse(
        total_blocks=total_blocks,
        approved=approved,
        pending_approval=pending_approval,
        conflicts=len(conflicting_ids),
        submitted_requests=submitted_requests,
    )
