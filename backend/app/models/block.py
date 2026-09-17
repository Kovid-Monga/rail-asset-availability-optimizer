from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship
from app.database.connection import Base

class BlockSchedule(Base):
    __tablename__ = "block_schedules"

    block_id = Column(String(20), primary_key=True, index=True)
    block_date = Column(Date, nullable=False, index=True)
    section_start = Column(String(100), nullable=False)
    section_end = Column(String(100), nullable=False)
    line = Column(String(50), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_min = Column(Integer, nullable=False)
    status = Column(String(30), nullable=False, default="PENDING_APPROVAL", index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    tasks = relationship("BlockTask", back_populates="block", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')", name="chk_block_status"),
        CheckConstraint("end_time > start_time", name="chk_block_time"),
    )


class BlockTask(Base):
    __tablename__ = "block_tasks"

    block_task_id = Column(Integer, primary_key=True, autoincrement=True)
    block_id = Column(
        String(20),
        ForeignKey("block_schedules.block_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    need_id = Column(
        Integer,
        ForeignKey("maintenance_requests.need_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    block = relationship("BlockSchedule", back_populates="tasks")

    __table_args__ = (
        UniqueConstraint("block_id", "need_id", name="uq_block_task"),
    )
