from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.models.request import MaintenanceRequest
from app.schemas.request import (
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceRequestResponse,
    PriorityResultResponse,
    DepartmentStats,
)
from app.services.priority_service import PriorityService

router = APIRouter(prefix="/requests", tags=["Maintenance Requests"])

@router.get("", response_model=List[MaintenanceRequestResponse])
def get_requests(
    department: Optional[str] = Query(None, description="Filter by department: TMS, TDMS, SMMS"),
    status: Optional[str] = Query(None, description="Filter by status: DRAFT, SUBMITTED"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieve maintenance requests, optionally filtered by department and status."""
    query = db.query(MaintenanceRequest)
    if department:
        if department.upper() not in ("TMS", "TDMS", "SMMS"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid department. Must be one of: TMS, TDMS, SMMS."
            )
        query = query.filter(MaintenanceRequest.department == department.upper())
    
    if status:
        if status.upper() not in ("DRAFT", "SUBMITTED"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be one of: DRAFT, SUBMITTED."
            )
        query = query.filter(MaintenanceRequest.status == status.upper())

    # Order by newest created_at / need_id
    requests = query.order_by(desc(MaintenanceRequest.need_id)).limit(limit).all()
    for r in requests:
        if r.status == "SUBMITTED" and not r.priority_result:
            PriorityService.run_priority_analysis(r.need_id, db)
            db.refresh(r)
    return requests

@router.get("/stats", response_model=DepartmentStats)
def get_department_stats(
    department: str = Query(..., description="Department: TMS, TDMS, SMMS"),
    db: Session = Depends(get_db)
):
    """Get request statistics (total, draft, submitted) for a specific department."""
    dept = department.upper()
    if dept not in ("TMS", "TDMS", "SMMS"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid department. Must be one of: TMS, TDMS, SMMS."
        )

    total = db.query(MaintenanceRequest).filter(MaintenanceRequest.department == dept).count()
    draft = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.department == dept,
        MaintenanceRequest.status == "DRAFT"
    ).count()
    submitted = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.department == dept,
        MaintenanceRequest.status == "SUBMITTED"
    ).count()

    return DepartmentStats(
        department=dept,
        total_requests=total,
        draft_requests=draft,
        submitted_requests=submitted
    )

@router.get("/{need_id}", response_model=MaintenanceRequestResponse)
def get_request_by_id(need_id: int, db: Session = Depends(get_db)):
    """Fetch details of a single maintenance request by need_id."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance request with ID {need_id} not found."
        )
    if req.status == "SUBMITTED" and not req.priority_result:
        PriorityService.run_priority_analysis(need_id, db)
        db.refresh(req)
    return req

@router.post("", response_model=MaintenanceRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: MaintenanceRequestCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Create a new maintenance request (DRAFT or SUBMITTED). Automatically runs priority analysis if SUBMITTED."""
    new_req = MaintenanceRequest(
        department=payload.department.upper(),
        block_start=payload.block_start.strip(),
        block_end=payload.block_end.strip(),
        line=payload.line.strip() if payload.line else None,
        work_location=payload.work_location.strip() if payload.work_location else None,
        reason_code=payload.reason_code,
        reason_description=payload.reason_description.strip() if payload.reason_description else None,
        asset_impact=payload.asset_impact,
        duration_min=payload.duration_min,
        due_date=payload.due_date,
        status=payload.status.upper() if payload.status else "DRAFT"
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)

    # Automatically trigger priority analysis if created directly with status SUBMITTED
    if new_req.status == "SUBMITTED":
        background_tasks.add_task(PriorityService.trigger_background_priority_analysis, new_req.need_id)

    return new_req

@router.put("/{need_id}", response_model=MaintenanceRequestResponse)
def update_request(
    need_id: int,
    payload: MaintenanceRequestUpdate,
    db: Session = Depends(get_db)
):
    """Update fields of an existing maintenance request."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance request with ID {need_id} not found."
        )

    if req.status == "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submitted maintenance requests cannot be edited. Editing is only permitted for DRAFT requests."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value:
            value = value.upper()
        if isinstance(value, str) and field in ("block_start", "block_end", "line", "work_location", "reason_description"):
            value = value.strip()
        setattr(req, field, value)

    if "block_start" in update_data or "block_end" in update_data:
        req.block_section = f"{req.block_start or ''} - {req.block_end or ''}"

    db.commit()
    db.refresh(req)
    return req

@router.post("/{need_id}/submit", response_model=MaintenanceRequestResponse)
def submit_request(
    need_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a draft request, transitioning its status to SUBMITTED and triggering automatic priority analysis."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance request with ID {need_id} not found."
        )
    
    req.status = "SUBMITTED"
    db.commit()
    db.refresh(req)

    # Automatically trigger priority analysis in the background
    background_tasks.add_task(PriorityService.trigger_background_priority_analysis, need_id)

    return req

@router.get("/{need_id}/priority", response_model=PriorityResultResponse)
def get_request_priority(need_id: int, db: Session = Depends(get_db)):
    """Fetch the priority analysis result associated with a maintenance request."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance request with ID {need_id} not found."
        )
    if not req.priority_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Priority analysis not found or pending for request #{need_id}."
        )
    return req.priority_result

@router.delete("/{need_id}", status_code=status.HTTP_200_OK)
def delete_request(need_id: int, db: Session = Depends(get_db)):
    """Delete a draft maintenance request. Submitted requests cannot be deleted."""
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance request with ID {need_id} not found."
        )

    if req.status == "SUBMITTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submitted maintenance requests cannot be deleted. Deletion is only permitted for DRAFT requests."
        )

    db.delete(req)
    db.commit()
    return {"detail": f"Draft maintenance request #{need_id} deleted successfully.", "need_id": need_id}
