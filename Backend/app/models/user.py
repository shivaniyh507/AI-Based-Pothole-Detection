from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default="driver")
    avatar = Column(String(500), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    reports = relationship("PotholeReport", foreign_keys="PotholeReport.reported_by_id", back_populates="reporter")
    assignments = relationship("PotholeReport", foreign_keys="PotholeReport.assigned_to_id", back_populates="assignee")
    notifications = relationship("Notification", back_populates="target_user")
    route_history = relationship("RouteHistory", back_populates="user")

