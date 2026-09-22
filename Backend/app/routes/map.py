from typing import Optional, Any
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pothole_report import PotholeReport
from app.services.route_service import calculate_nearby_potholes, calculate_safe_route, calculate_route_options
from app.schemas.route import RoutePlanRequest

router = APIRouter(prefix="/api/map", tags=["Map"])

@router.get("/potholes")
def get_potholes(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    minLat: Optional[float] = Query(None),
    maxLat: Optional[float] = Query(None),
    minLng: Optional[float] = Query(None),
    maxLng: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(PotholeReport)
    if status:
        query = query.filter(PotholeReport.status == status)
    if severity:
        query = query.filter(PotholeReport.severity == severity)
    if minLat is not None:
        query = query.filter(PotholeReport.latitude >= minLat)
    if maxLat is not None:
        query = query.filter(PotholeReport.latitude <= maxLat)
    if minLng is not None:
        query = query.filter(PotholeReport.longitude >= minLng)
    if maxLng is not None:
        query = query.filter(PotholeReport.longitude <= maxLng)

    reports = query.all()
    markers = [
        {
            "id": r.id,
            "_id": str(r.id),
            "lat": r.latitude,
            "lng": r.longitude,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "title": r.location_name,
            "locationName": r.location_name,
            "address": r.location_name,
            "severity": r.severity,
            "status": r.status,
            "count": r.detected_potholes_count,
            "upvotes": r.upvotes,
            "depthCm": r.depth_cm,
            "widthCm": r.width_cm,
            "aiConfidence": r.ai_confidence,
            "imagePath": r.image_path,
            "createdAt": r.created_at
        } for r in reports
    ]

    return {
        "success": True,
        "count": len(markers),
        "markers": markers
    }

@router.get("/nearby")
def get_nearby_potholes(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(5.0),
    db: Session = Depends(get_db)
):
    reports = calculate_nearby_potholes(db, lat=lat, lng=lng, radius_km=radius)
    return {
        "success": True,
        "center": {"lat": lat, "lng": lng},
        "radiusKm": radius,
        "count": len(reports),
        "potholes": [
            {
                "id": r.id,
                "_id": str(r.id),
                "latitude": r.latitude,
                "longitude": r.longitude,
                "locationName": r.location_name,
                "address": r.location_name,
                "severity": r.severity,
                "status": r.status,
                "upvotes": r.upvotes,
                "depthCm": r.depth_cm,
                "widthCm": r.width_cm,
                "aiConfidence": r.ai_confidence,
                "imagePath": r.image_path
            } for r in reports
        ]
    }

@router.get("/safe-route")
def get_safe_route(
    originLat: float = Query(...),
    originLng: float = Query(...),
    destLat: float = Query(...),
    destLng: float = Query(...),
    db: Session = Depends(get_db)
):
    route_info = calculate_safe_route(
        db,
        origin={"lat": originLat, "lng": originLng},
        destination={"lat": destLat, "lng": destLng}
    )
    return {
        "success": True,
        "route": route_info
    }

@router.post("/plan-route")
def plan_route(
    payload: RoutePlanRequest,
    db: Session = Depends(get_db)
):
    return calculate_route_options(
        db,
        origin_name=payload.origin,
        destination_name=payload.destination,
        origin_lat=payload.originLat,
        origin_lng=payload.originLng,
        dest_lat=payload.destLat,
        dest_lng=payload.destLng,
        avoid_pothole_id=payload.avoidPotholeId
    )

@router.get("/plan-route")
def plan_route_get(
    origin: Optional[str] = Query("Panki Industrial Area"),
    destination: Optional[str] = Query("IIT Kanpur Campus"),
    avoid: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return calculate_route_options(
        db,
        origin_name=origin,
        destination_name=destination,
        avoid_pothole_id=avoid
    )

