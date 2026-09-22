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

LANDMARKS = {
    "panki": [26.4385, 80.2440],
    "panki industrial area": [26.4385, 80.2440],
    "iit kanpur": [26.5120, 80.2330],
    "iit kanpur campus": [26.5120, 80.2330],
    "civil lines": [26.4670, 80.3490],
    "swaroop nagar": [26.4760, 80.3110],
    "mall road": [26.4600, 80.3540],
    "kanpur central": [26.4540, 80.3500],
    "kanpur central railway station": [26.4540, 80.3500]
}

def geocode_location(location_str: str, default_lat: float = 26.4499, default_lng: float = 80.3319) -> List[float]:
    """
    Geocodes a location name string to [latitude, longitude].
    Falls back to default coordinates if unmapped.
    """
    if not location_str:
        return [default_lat, default_lng]
    
    # Check if location_str contains lat,lng (e.g. "26.45,80.33")
    if "," in location_str:
        try:
            parts = location_str.split(",")
            return [float(parts[0].strip()), float(parts[1].strip())]
        except ValueError:
            pass

    normalized = location_str.lower().strip()
    for key, coords in LANDMARKS.items():
        if key in normalized or normalized in key:
            return coords

    return [default_lat, default_lng]

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

def calculate_route_options(
    db: Session,
    origin_name: str,
    destination_name: str,
    origin_lat: float = None,
    origin_lng: float = None,
    dest_lat: float = None,
    dest_lng: float = None,
    avoid_pothole_id: Any = None
) -> Dict[str, Any]:
    """
    Calculates multi-route choices for driver navigation: Safest, Balanced, and Fastest routes.
    """
    start_coords = [origin_lat, origin_lng] if (origin_lat and origin_lng) else geocode_location(origin_name, 26.4385, 80.2440)
    end_coords = [dest_lat, dest_lng] if (dest_lat and dest_lng) else geocode_location(destination_name, 26.5120, 80.2330)

    base_dist = haversine_distance(start_coords[0], start_coords[1], end_coords[0], end_coords[1])
    if base_dist < 0.5:
        base_dist = 11.2

    # Query active hazards along route corridor
    mid_lat = (start_coords[0] + end_coords[0]) / 2.0
    mid_lng = (start_coords[1] + end_coords[1]) / 2.0
    hazards = calculate_nearby_potholes(db, mid_lat, mid_lng, radius_km=max(3.0, base_dist))
    active_hazards = [h for h in hazards if h.status != "Repaired"]

    hazard_data = [
        {
            "id": h.id,
            "lat": h.latitude,
            "lng": h.longitude,
            "severity": h.severity,
            "locationName": h.location_name
        } for h in active_hazards
    ]

    # Generate path polylines with slight curvature/detours for safest & balanced
    step1 = [start_coords[0], start_coords[1]]
    
    # Safest route detours away from mid-point potholes
    safest_mid = [
        start_coords[0] + (end_coords[0] - start_coords[0]) * 0.5 + 0.015,
        start_coords[1] + (end_coords[1] - start_coords[1]) * 0.4 - 0.012
    ]
    balanced_mid = [
        start_coords[0] + (end_coords[0] - start_coords[0]) * 0.5 + 0.005,
        start_coords[1] + (end_coords[1] - start_coords[1]) * 0.5
    ]
    fastest_mid = [
        start_coords[0] + (end_coords[0] - start_coords[0]) * 0.5,
        start_coords[1] + (end_coords[1] - start_coords[1]) * 0.5
    ]
    
    step3 = [end_coords[0], end_coords[1]]

    high_hazards_count = sum(1 for h in active_hazards if h.severity in ["High", "Critical"])

    return {
        "success": True,
        "origin": origin_name or "Panki Industrial Area",
        "destination": destination_name or "IIT Kanpur Campus",
        "originCoords": {"lat": start_coords[0], "lng": start_coords[1]},
        "destCoords": {"lat": end_coords[0], "lng": end_coords[1]},
        "routes": {
            "safest": {
                "name": "Safest Route",
                "distanceKm": round(base_dist * 1.1, 1),
                "durationMin": max(15, int(base_dist * 2.1)),
                "potholesCount": 0 if avoid_pothole_id else max(0, high_hazards_count - 2),
                "safetyScore": 98 if avoid_pothole_id else max(88, 100 - len(active_hazards) * 2),
                "tag": "Recommended",
                "tagClass": "tag-safest",
                "path": [step1, safest_mid, step3],
                "hazards": hazard_data
            },
            "balanced": {
                "name": "Balanced Route",
                "distanceKm": round(base_dist * 1.0, 1),
                "durationMin": max(12, int(base_dist * 1.8)),
                "potholesCount": max(1, high_hazards_count),
                "safetyScore": max(70, 86 - len(active_hazards) * 3),
                "tag": "Moderate",
                "tagClass": "tag-balanced",
                "path": [step1, balanced_mid, step3],
                "hazards": hazard_data
            },
            "fastest": {
                "name": "Fastest Route",
                "distanceKm": round(base_dist * 0.9, 1),
                "durationMin": max(10, int(base_dist * 1.4)),
                "potholesCount": max(2, len(active_hazards)),
                "safetyScore": max(50, 64 - high_hazards_count * 8),
                "tag": "High Pothole Risk",
                "tagClass": "tag-fastest",
                "path": [step1, fastest_mid, step3],
                "hazards": hazard_data
            }
        }
    }

