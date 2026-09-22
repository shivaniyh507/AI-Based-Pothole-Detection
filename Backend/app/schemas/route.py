from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RoutePlanRequest(BaseModel):
    origin: Optional[str] = "Panki Industrial Area"
    destination: Optional[str] = "IIT Kanpur Campus"
    originLat: Optional[float] = None
    originLng: Optional[float] = None
    destLat: Optional[float] = None
    destLng: Optional[float] = None
    avoidPotholeId: Optional[Any] = None

class RouteOption(BaseModel):
    name: str
    distanceKm: float
    durationMin: int
    potholesCount: int
    safetyScore: int
    tag: str
    tagClass: str
    path: List[List[float]]
    hazards: Optional[List[Dict[str, Any]]] = []

class RoutePlanResponse(BaseModel):
    success: bool
    origin: str
    destination: str
    routes: Dict[str, RouteOption]

class RouteHistoryCreate(BaseModel):
    trip_code: Optional[str] = None
    origin_name: str
    destination_name: str
    origin_lat: Optional[float] = 26.4499
    origin_lng: Optional[float] = 80.3319
    dest_lat: Optional[float] = 26.5120
    dest_lng: Optional[float] = 80.2330
    distance_km: float
    duration_min: int
    potholes_encountered: Optional[int] = 0
    potholes_avoided: Optional[int] = 0
    safety_score: Optional[int] = 90
    route_type: Optional[str] = "Safest Route"

class RouteHistoryResponse(BaseModel):
    id: int
    _id: Optional[str] = None
    user_id: Optional[int] = None
    trip_code: str
    origin_name: str
    destination_name: str
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    distance_km: float
    duration_min: int
    potholes_encountered: int
    potholes_avoided: int
    safety_score: int
    route_type: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
