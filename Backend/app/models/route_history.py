from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.config.database import Base

class RouteHistory(Base):
    __tablename__ = "route_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    trip_code = Column(String(50), nullable=False, default="TRIP-100")
    origin_name = Column(String(255), nullable=False)
    destination_name = Column(String(255), nullable=False)
    origin_lat = Column(Float, nullable=False, default=26.4499)
    origin_lng = Column(Float, nullable=False, default=80.3319)
    dest_lat = Column(Float, nullable=False, default=26.5120)
    dest_lng = Column(Float, nullable=False, default=80.2330)
    distance_km = Column(Float, nullable=False, default=10.0)
    duration_min = Column(Integer, nullable=False, default=20)
    potholes_encountered = Column(Integer, default=0)
    potholes_avoided = Column(Integer, default=0)
    safety_score = Column(Integer, default=90)
    route_type = Column(String(50), default="Safest Route")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="route_history")
