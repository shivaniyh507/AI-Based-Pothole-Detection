import math
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.pothole_report import PotholeReport

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great circle distance between two points in kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_nearby_potholes(db: Session, lat: float, lng: float, radius_km: float = 5.0) -> List[PotholeReport]:
    """
    Queries potholes near specified latitude, longitude coordinates within radius_km.
    """
    # 1 degree latitude approx 111 km
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * math.cos(math.radians(lat)))

    candidates = db.query(PotholeReport).filter(
        PotholeReport.latitude >= (lat - lat_delta),
        PotholeReport.latitude <= (lat + lat_delta),
        PotholeReport.longitude >= (lng - lng_delta),
        PotholeReport.longitude <= (lng + lng_delta)
    ).all()

    nearby = []
    for report in candidates:
        dist = haversine_distance(lat, lng, report.latitude, report.longitude)
        if dist <= radius_km:
            nearby.append(report)

    return nearby

def calculate_safe_route(db: Session, origin: Dict[str, float], destination: Dict[str, float]) -> Dict[str, Any]:
    """
    Calculates hazard score and obstacle avoidance waypoints for driver navigation routes.
    """
    mid_lat = (origin["lat"] + destination["lat"]) / 2.0
    mid_lng = (origin["lng"] + destination["lng"]) / 2.0
    
    total_dist = haversine_distance(origin["lat"], origin["lng"], destination["lat"], destination["lng"])
    hazards = calculate_nearby_potholes(db, mid_lat, mid_lng, radius_km=max(2.0, total_dist))

    critical_hazards = [h for h in hazards if h.severity in ["High", "Critical"] and h.status != "Repaired"]
    hazard_score = min(100, len(critical_hazards) * 15 + len(hazards) * 5)

    return {
        "origin": origin,
        "destination": destination,
        "distanceKm": round(total_dist, 2),
        "hazardScore": hazard_score,
        "hazardCount": len(hazards),
        "criticalHazardsCount": len(critical_hazards),
        "safetyStatus": "Caution" if hazard_score > 40 else "Safe",
        "hazards": [
            {
                "id": h.id,
                "lat": h.latitude,
                "lng": h.longitude,
                "severity": h.severity,
                "locationName": h.location_name
            } for h in hazards
        ]
    }
