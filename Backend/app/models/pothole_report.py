from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), default="Unknown Location")
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    status = Column(String(50), default="Pending")    # Pending, In-Progress, Repaired
    bounding_boxes = Column(JSON, default=list)       # List of bbox objects [{x, y, width, height}]
    image_path = Column(String(500), default="")
    detected_potholes_count = Column(Integer, default=1)
    
    reported_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    repaired_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, default="")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by_id], back_populates="reports")
    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="assignments")
