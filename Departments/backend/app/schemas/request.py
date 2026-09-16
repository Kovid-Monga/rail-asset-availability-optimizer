from datetime import date, datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, field_serializer

DepartmentType = Literal["TMS", "TDMS", "SMMS"]
ReasonCodeType = Literal["ETMW", "EOMT", "ERRL", "OTHR"]
AssetImpactType = Literal["High", "Medium", "Low"]
StatusType = Literal["DRAFT", "SUBMITTED"]

class MaintenanceRequestBase(BaseModel):
    department: DepartmentType = Field(..., description="Department: TMS, TDMS, or SMMS")
    block_section: str = Field(..., min_length=1, max_length=100, description="Block section name")
    line: Optional[str] = Field(None, max_length=50, description="Railway line, e.g., UP, DN, Single")
    work_location: Optional[str] = Field(None, max_length=100, description="Kilometer or station marker")
    reason_code: Optional[ReasonCodeType] = Field(None, description="Official BDMS reason code")
    reason_description: Optional[str] = Field(None, description="Detailed description of the maintenance work")
    asset_impact: Optional[AssetImpactType] = Field(None, description="Impact level on assets")
    duration_min: int = Field(..., gt=0, description="Duration in minutes (must be > 0)")
    due_date: date = Field(..., description="Target completion/due date")
    status: StatusType = Field(default="DRAFT", description="Current lifecycle status")

    @field_validator("department")
    @classmethod
    def validate_dept(cls, v: str) -> str:
        if v not in ("TMS", "TDMS", "SMMS"):
            raise ValueError("Department must be one of: TMS, TDMS, SMMS")
        return v

    @field_validator("duration_min")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Duration must be a positive integer greater than 0")
        return v

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    block_section: Optional[str] = Field(None, min_length=1, max_length=100)
    line: Optional[str] = Field(None, max_length=50)
    work_location: Optional[str] = Field(None, max_length=100)
    reason_code: Optional[ReasonCodeType] = None
    reason_description: Optional[str] = None
    asset_impact: Optional[AssetImpactType] = None
    duration_min: Optional[int] = Field(None, gt=0)
    due_date: Optional[date] = None
    status: Optional[StatusType] = None

class MaintenanceRequestResponse(MaintenanceRequestBase):
    need_id: int
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime, _info) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True

class DepartmentStats(BaseModel):
    department: str
    total_requests: int
    draft_requests: int
    submitted_requests: int
