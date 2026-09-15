from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from .user import UserResponse

class ReportBase(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = "Unknown Location"
    severity: Optional[str] = "Medium"
    status: Optional[str] = "Pending"
    bounding_boxes: Optional[List[Any]] = []
    image_path: Optional[str] = ""
    detected_potholes_count: Optional[int] = 1
    notes: Optional[str] = ""

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None
    notes: Optional[str] = None

class ReportStatusUpdate(BaseModel):
    status: str
    assignedTo: Optional[int] = None
    notes: Optional[str] = None

class ReportResponse(ReportBase):
    id: int
    _id: Optional[str] = None
    reported_by_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    repaired_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    reporter: Optional[UserResponse] = None
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True
