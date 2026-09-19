from datetime import date, datetime, timezone
from typing import Optional, Literal, Dict, List
from pydantic import BaseModel, Field, field_validator, field_serializer, model_validator

DepartmentType = Literal["TMS", "TDMS", "SMMS"]

ReasonCodeType = Literal[
    "ETMW", "ERRL", "ETMR", "OTHR",  # TMS
    "TPWR", "TOHE", "TREP",          # TDMS
    "SSIG", "STEL", "SREP"           # SMMS
]

DEPARTMENT_REASON_CODES: Dict[str, List[str]] = {
    "TMS": ["ETMW", "ERRL", "ETMR", "OTHR"],
    "TDMS": ["TPWR", "TOHE", "TREP", "OTHR"],
    "SMMS": ["SSIG", "STEL", "SREP", "OTHR"],
}

AssetImpactType = Literal["High", "Medium", "Low"]
StatusType = Literal["DRAFT", "SUBMITTED"]

class MaintenanceRequestBase(BaseModel):
    department: DepartmentType = Field(..., description="Department: TMS, TDMS, or SMMS")
    block_start: str = Field(..., min_length=1, max_length=100, description="Block start station / marker")
    block_end: str = Field(..., min_length=1, max_length=100, description="Block end station / marker")
    line: Optional[str] = Field(None, max_length=50, description="Railway line, e.g., UP, DN, Single")
    work_location: Optional[str] = Field(None, max_length=100, description="Kilometer or station marker")
    reason_code: Optional[ReasonCodeType] = Field(None, description="Department-specific reason code")
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

    @model_validator(mode="after")
    def validate_and_compute(self):
        if self.reason_code and self.reason_code != "OTHR":
            valid_codes = DEPARTMENT_REASON_CODES.get(self.department, [])
            if self.reason_code not in valid_codes:
                raise ValueError(
                    f"Reason code '{self.reason_code}' is not valid for department '{self.department}'. "
                    f"Valid codes: {valid_codes}"
                )
        return self

class MaintenanceRequestCreate(MaintenanceRequestBase):
    pass

class MaintenanceRequestUpdate(BaseModel):
    block_start: Optional[str] = Field(None, min_length=1, max_length=100)
    block_end: Optional[str] = Field(None, min_length=1, max_length=100)
    line: Optional[str] = Field(None, max_length=50)
    work_location: Optional[str] = Field(None, max_length=100)
    reason_code: Optional[ReasonCodeType] = None
    reason_description: Optional[str] = None
    asset_impact: Optional[AssetImpactType] = None
    duration_min: Optional[int] = Field(None, gt=0)
    due_date: Optional[date] = None
    status: Optional[StatusType] = None

class PriorityResultResponse(BaseModel):
    priority_id: int
    need_id: int
    predicted_severity: str
    severity_score: int
    asset_impact_score: int
    traffic: str
    traffic_score: int
    due_date_score: int
    priority_score: int
    priority_class: str
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime, _info) -> str:
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    class Config:
        from_attributes = True

class MaintenanceRequestResponse(MaintenanceRequestBase):
    need_id: int
    created_at: datetime
    priority_result: Optional[PriorityResultResponse] = None

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
