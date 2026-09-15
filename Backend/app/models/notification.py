from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(String(500), nullable=False)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    read = Column(Boolean, default=False)
    type = Column(String(50), default="info")  # info, alert, status_update
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationship
    target_user = relationship("User", back_populates="notifications")
