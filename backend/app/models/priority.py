from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class PriorityResult(Base):
    __tablename__ = "priority_results"

    priority_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    need_id = Column(
        Integer,
        ForeignKey("maintenance_requests.need_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    predicted_severity = Column(String(20), nullable=False)
    severity_score = Column(Integer, nullable=False)
    asset_impact_score = Column(Integer, nullable=False)
    traffic = Column(String(20), nullable=False)
    traffic_score = Column(Integer, nullable=False)
    due_date_score = Column(Integer, nullable=False)
    priority_score = Column(Integer, nullable=False)
    priority_class = Column(String(20), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    request = relationship("MaintenanceRequest", back_populates="priority_result")
