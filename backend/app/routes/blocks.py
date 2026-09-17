from datetime import date, datetime, time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.database.connection import get_db
from app.models.block import BlockSchedule, BlockTask
from app.models.request import MaintenanceRequest
from app.schemas.block import (
    BlockScheduleCreate,
    BlockScheduleUpdate,
    BlockScheduleResponse,
    ConflictCheckResponse,
)

router = APIRouter(prefix="/blocks", tags=["Block Schedules"])


def parse_time_str(time_str: str) -> time:
    """Parse HH:MM or HH:MM:SS string to datetime.time."""
    parts = time_str.strip().split(":")
    if len(parts) < 2:
        raise ValueError(f"Invalid time format: {time_str}. Expected HH:MM.")
    return time(hour=int(parts[0]), minute=int(parts[1]))


def format_duration(minutes: int) -> str:
    """Format minutes to readable 'X h Y min' string."""
    h = minutes // 60
    m = minutes % 60
    if h > 0 and m > 0:
        return f"{h} h {m} min"
    elif h > 0:
        return f"{h} h 0 min"
    else:
        return f"{m} min"


def serialize_block(block: BlockSchedule, db: Session) -> BlockScheduleResponse:
    """Map BlockSchedule model to response schema with tasks and formatted strings."""
    task_records = (
        db.query(BlockTask.need_id)
        .filter(BlockTask.block_id == block.block_id)
        .all()
    )
    task_labels = [f"MT-{r[0]}" for r in task_records]

    # Deduce primary work type from associated maintenance request if available
    work_type = "Maintenance"
    first_task = (
        db.query(MaintenanceRequest)
        .join(BlockTask, BlockTask.need_id == MaintenanceRequest.need_id)
        .filter(BlockTask.block_id == block.block_id)
        .first()
    )
    if first_task and first_task.reason_description:
        work_type = first_task.reason_description[:30]

    start_str = block.start_time.strftime("%H:%M")
    end_str = block.end_time.strftime("%H:%M")

    return BlockScheduleResponse(
        block_id=block.block_id,
        block_date=block.block_date,
        section_start=block.section_start,
        section_end=block.section_end,
        section=f"{block.section_start} - {block.section_end}",
        line=block.line,
        start_time=start_str,
        end_time=end_str,
        duration_min=block.duration_min,
        duration=format_duration(block.duration_min),
        status=block.status,
        tasks=task_labels,
        work_type=work_type,
        created_at=block.created_at,
        updated_at=block.updated_at,
    )


def find_conflicting_block(
    block_id: str,
    block_date: date,
    section_start: str,
    section_end: str,
    line: str,
    start_time: time,
    end_time: time,
    db: Session,
) -> Optional[BlockSchedule]:
    """Check for any other active block that overlaps the same section, line, date and time."""
    conflict = (
        db.query(BlockSchedule)
        .filter(
            BlockSchedule.block_id != block_id,
            BlockSchedule.status != "REJECTED",
            BlockSchedule.block_date == block_date,
            BlockSchedule.section_start == section_start,
            BlockSchedule.section_end == section_end,
            BlockSchedule.line == line,
            # Overlap condition: start < other.end AND end > other.start
            BlockSchedule.start_time < end_time,
            BlockSchedule.end_time > start_time,
        )
        .first()
    )
    return conflict


@router.get("", response_model=List[BlockScheduleResponse])
def get_blocks(
    date: Optional[date] = Query(None, description="Filter by exact block date (YYYY-MM-DD)"),
    status: Optional[str] = Query(None, description="Filter by status: PENDING_APPROVAL, APPROVED, REJECTED"),
    db: Session = Depends(get_db),
):
    """Retrieve blocks, optionally filtered by date and status."""
    query = db.query(BlockSchedule)
    if date:
        query = query.filter(BlockSchedule.block_date == date)
    if status:
        query = query.filter(BlockSchedule.status == status.upper())

    blocks = query.order_by(BlockSchedule.block_date, BlockSchedule.start_time).all()
    return [serialize_block(b, db) for b in blocks]


@router.get("/{block_id}", response_model=BlockScheduleResponse)
def get_block(block_id: str, db: Session = Depends(get_db)):
    """Retrieve details of a single block."""
    block = db.query(BlockSchedule).filter(BlockSchedule.block_id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block schedule '{block_id}' not found.",
        )
    return serialize_block(block, db)


@router.put("/{block_id}", response_model=BlockScheduleResponse)
def update_block(
    block_id: str,
    payload: BlockScheduleUpdate,
    db: Session = Depends(get_db),
):
    """Update block scheduling parameters.
    - Automatically calculates duration_min from end_time - start_time.
    - Validates end_time > start_time.
    - State transition: PENDING_APPROVAL -> PENDING_APPROVAL. APPROVED -> PENDING_APPROVAL.
    - REJECTED blocks cannot be edited.
    """
    block = db.query(BlockSchedule).filter(BlockSchedule.block_id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block schedule '{block_id}' not found.",
        )

    if block.status == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Block '{block_id}' has been REJECTED and cannot be edited.",
        )

    # Determine updated time values
    new_start_time = block.start_time
    new_end_time = block.end_time

    if payload.start_time is not None:
        try:
            new_start_time = parse_time_str(payload.start_time)
        except ValueError as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    if payload.end_time is not None:
        try:
            new_end_time = parse_time_str(payload.end_time)
        except ValueError as err:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    # Validate end_time > start_time
    if new_end_time <= new_start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid block schedule: end_time must be strictly after start_time.",
        )

    # Calculate duration_min automatically
    start_mins = new_start_time.hour * 60 + new_start_time.minute
    end_mins = new_end_time.hour * 60 + new_end_time.minute
    duration_min = end_mins - start_mins

    # Apply updates
    if payload.block_date is not None:
        block.block_date = payload.block_date
    if payload.section_start is not None:
        block.section_start = payload.section_start.strip()
    if payload.section_end is not None:
        block.section_end = payload.section_end.strip()
    if payload.line is not None:
        block.line = payload.line.strip()

    block.start_time = new_start_time
    block.end_time = new_end_time
    block.duration_min = duration_min

    # State transition rule: If APPROVED, resets to PENDING_APPROVAL (re-approval required)
    # If PENDING_APPROVAL, remains PENDING_APPROVAL
    block.status = "PENDING_APPROVAL"

    db.commit()
    db.refresh(block)
    return serialize_block(block, db)


@router.post("/{block_id}/check-conflicts", response_model=ConflictCheckResponse)
def check_block_conflicts(block_id: str, db: Session = Depends(get_db)):
    """Check whether the specified block conflicts with any other active block."""
    block = db.query(BlockSchedule).filter(BlockSchedule.block_id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block schedule '{block_id}' not found.",
        )

    conflict = find_conflicting_block(
        block_id=block.block_id,
        block_date=block.block_date,
        section_start=block.section_start,
        section_end=block.section_end,
        line=block.line,
        start_time=block.start_time,
        end_time=block.end_time,
        db=db,
    )

    if conflict:
        return ConflictCheckResponse(
            has_conflict=True,
            message=f"Schedule overlaps with {conflict.block_id} ({conflict.start_time.strftime('%H:%M')}–{conflict.end_time.strftime('%H:%M')}).",
            conflicting_block_id=conflict.block_id,
        )

    return ConflictCheckResponse(
        has_conflict=False,
        message="No conflicts detected. Time slot is available.",
        conflicting_block_id=None,
    )


@router.post("/{block_id}/approve", response_model=BlockScheduleResponse)
def approve_block(block_id: str, db: Session = Depends(get_db)):
    """Approve a block schedule.
    MANDATORY: Runs a fresh conflict check. If a conflict exists, approval is rejected (HTTP 409)
    and the block remains PENDING_APPROVAL.
    """
    block = db.query(BlockSchedule).filter(BlockSchedule.block_id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block schedule '{block_id}' not found.",
        )

    # Fresh conflict validation
    conflict = find_conflicting_block(
        block_id=block.block_id,
        block_date=block.block_date,
        section_start=block.section_start,
        section_end=block.section_end,
        line=block.line,
        start_time=block.start_time,
        end_time=block.end_time,
        db=db,
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot approve block: Schedule overlaps with {conflict.block_id} on {block.section_start} - {block.section_end} ({block.line}).",
        )

    block.status = "APPROVED"
    db.commit()
    db.refresh(block)
    return serialize_block(block, db)


@router.post("/{block_id}/reject", response_model=BlockScheduleResponse)
def reject_block(block_id: str, db: Session = Depends(get_db)):
    """Reject a block schedule. Transitions status to REJECTED."""
    block = db.query(BlockSchedule).filter(BlockSchedule.block_id == block_id).first()
    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Block schedule '{block_id}' not found.",
        )

    block.status = "REJECTED"
    db.commit()
    db.refresh(block)
    return serialize_block(block, db)


@router.post("/proposals", response_model=BlockScheduleResponse, status_code=status.HTTP_201_CREATED)
def persist_proposal(payload: BlockScheduleCreate, db: Session = Depends(get_db)):
    """Backend service endpoint: Persists an AI proposed schedule into block_schedules
    with status PENDING_APPROVAL and associates task IDs in block_tasks before COA review.
    """
    existing = db.query(BlockSchedule).filter(BlockSchedule.block_id == payload.block_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Block with ID '{payload.block_id}' already exists.",
        )

    try:
        s_time = parse_time_str(payload.start_time)
        e_time = parse_time_str(payload.end_time)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    if e_time <= s_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid block schedule: end_time must be strictly after start_time.",
        )

    start_mins = s_time.hour * 60 + s_time.minute
    end_mins = e_time.hour * 60 + e_time.minute
    duration_min = end_mins - start_mins

    new_block = BlockSchedule(
        block_id=payload.block_id,
        block_date=payload.block_date,
        section_start=payload.section_start.strip(),
        section_end=payload.section_end.strip(),
        line=payload.line.strip(),
        start_time=s_time,
        end_time=e_time,
        duration_min=duration_min,
        status="PENDING_APPROVAL",
    )
    db.add(new_block)
    db.flush()

    if payload.task_ids:
        for need_id in payload.task_ids:
            # Verify need_id exists
            req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
            if req:
                db.add(BlockTask(block_id=payload.block_id, need_id=need_id))

    db.commit()
    db.refresh(new_block)
    return serialize_block(new_block, db)
