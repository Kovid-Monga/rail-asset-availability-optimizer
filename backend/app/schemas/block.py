from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class BlockScheduleBase(BaseModel):
    block_date: date
    section_start: str = Field(..., max_length=100)
    section_end: str = Field(..., max_length=100)
    line: str = Field(..., max_length=50)
    start_time: str = Field(..., description="HH:MM format, e.g. 10:00")
    end_time: str = Field(..., description="HH:MM format, e.g. 12:00")

class BlockScheduleCreate(BlockScheduleBase):
    block_id: str = Field(..., max_length=20)
    status: str = Field(default="PENDING_APPROVAL")
    task_ids: Optional[List[int]] = None

class BlockScheduleUpdate(BaseModel):
    block_date: Optional[date] = None
    section_start: Optional[str] = None
    section_end: Optional[str] = None
    line: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class BlockScheduleResponse(BaseModel):
    block_id: str
    block_date: date
    section_start: str
    section_end: str
    section: str
    line: str
    start_time: str
    end_time: str
    duration_min: int
    duration: str
    status: str
    tasks: List[str] = []
    work_type: Optional[str] = "Maintenance"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ConflictCheckResponse(BaseModel):
    has_conflict: bool
    message: str
    conflicting_block_id: Optional[str] = None

class OverviewStatsResponse(BaseModel):
    total_blocks: int
    approved: int
    pending_approval: int
    conflicts: int
    submitted_requests: int
