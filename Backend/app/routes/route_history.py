import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.route_history import RouteHistory
from app.schemas.route import RouteHistoryCreate
from app.middleware.auth import get_optional_user, User

router = APIRouter(prefix="/api/routes/history", tags=["Route History"])

@router.get("")
def get_route_history(
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    page: int = Query(1),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(RouteHistory)
    if current_user:
        query = query.filter(
            (RouteHistory.user_id == current_user.id) | (RouteHistory.user_id == None)
        )
    if search:
        query = query.filter(
            (RouteHistory.origin_name.ilike(f"%{search}%")) |
            (RouteHistory.destination_name.ilike(f"%{search}%")) |
            (RouteHistory.trip_code.ilike(f"%{search}%"))
        )

    total = query.count()
    skip = (page - 1) * limit
    history_records = query.order_by(RouteHistory.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for h in history_records:
        items.append({
            "id": h.id,
            "_id": str(h.id),
            "tripCode": h.trip_code,
            "originName": h.origin_name,
            "destinationName": h.destination_name,
            "from": h.origin_name,
            "to": h.destination_name,
            "originLat": h.origin_lat,
            "originLng": h.origin_lng,
            "destLat": h.dest_lat,
            "destLng": h.dest_lng,
            "distanceKm": h.distance_km,
            "durationMin": h.duration_min,
            "potholesEncountered": h.potholes_encountered,
            "potholesAvoided": h.potholes_avoided,
            "safetyScore": h.safety_score,
            "routeType": h.route_type,
            "createdAt": h.created_at,
            "date": h.created_at.strftime("%Y-%m-%d") if h.created_at else "",
            "time": h.created_at.strftime("%I:%M %p") if h.created_at else ""
        })

    return {
        "success": True,
        "count": len(items),
        "total": total,
        "page": page,
        "history": items
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_route_history(
    payload: RouteHistoryCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    trip_code = payload.trip_code or f"TRIP-{random.randint(800, 999)}"
    record = RouteHistory(
        user_id=current_user.id if current_user else None,
        trip_code=trip_code,
        origin_name=payload.origin_name,
        destination_name=payload.destination_name,
        origin_lat=payload.origin_lat or 26.4499,
        origin_lng=payload.origin_lng or 80.3319,
        dest_lat=payload.dest_lat or 26.5120,
        dest_lng=payload.dest_lng or 80.2330,
        distance_km=payload.distance_km,
        duration_min=payload.duration_min,
        potholes_encountered=payload.potholes_encountered or 0,
        potholes_avoided=payload.potholes_avoided or 0,
        safety_score=payload.safety_score or 90,
        route_type=payload.route_type or "Safest Route"
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "success": True,
        "history": {
            "id": record.id,
            "_id": str(record.id),
            "tripCode": record.trip_code,
            "originName": record.origin_name,
            "destinationName": record.destination_name,
            "from": record.origin_name,
            "to": record.destination_name,
            "distanceKm": record.distance_km,
            "durationMin": record.duration_min,
            "potholesAvoided": record.potholes_avoided,
            "safetyScore": record.safety_score,
            "routeType": record.route_type,
            "createdAt": record.created_at
        }
    }

@router.get("/{history_id}")
def get_route_history_by_id(history_id: int, db: Session = Depends(get_db)):
    h = db.query(RouteHistory).filter(RouteHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Route history record not found")

    return {
        "success": True,
        "history": {
            "id": h.id,
            "_id": str(h.id),
            "tripCode": h.trip_code,
            "originName": h.origin_name,
            "destinationName": h.destination_name,
            "originLat": h.origin_lat,
            "originLng": h.origin_lng,
            "destLat": h.dest_lat,
            "destLng": h.dest_lng,
            "distanceKm": h.distance_km,
            "durationMin": h.duration_min,
            "potholesEncountered": h.potholes_encountered,
            "potholesAvoided": h.potholes_avoided,
            "safetyScore": h.safety_score,
            "routeType": h.route_type,
            "createdAt": h.created_at
        }
    }

@router.delete("/{history_id}")
def delete_route_history(history_id: int, db: Session = Depends(get_db)):
    h = db.query(RouteHistory).filter(RouteHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Route history record not found")

    db.delete(h)
    db.commit()

    return {
        "success": True,
        "message": "Route history record deleted"
    }
