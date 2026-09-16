from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, func
from app.database.connection import Base

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    need_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    department = Column(String(10), nullable=False, index=True)
    block_section = Column(String(100), nullable=False)
    line = Column(String(50), nullable=True)
    work_location = Column(String(100), nullable=True)
    reason_code = Column(String(20), nullable=True)
    reason_description = Column(Text, nullable=True)
    asset_impact = Column(String(20), nullable=True)
    duration_min = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(30), nullable=False, default="DRAFT", index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False
    )
