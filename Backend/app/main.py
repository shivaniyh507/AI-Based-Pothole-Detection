import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.config.database import engine, Base

# Import ORM models to register them with SQLAlchemy Base
from app.models.user import User
from app.models.pothole_report import PotholeReport
from app.models.notification import Notification
from app.models.route_history import RouteHistory

# Import Routers
from app.routes.auth import router as auth_router
from app.routes.scan import router as scan_router
from app.routes.reports import router as reports_router
from app.routes.map import router as map_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router
from app.routes.route_history import router as route_history_router
from app.config.database import SessionLocal

# Initialize FastAPI App
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Based Pothole Detection & GIS Navigation API"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists and mount static route
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(PotholeReport).count() == 0:
            demo_potholes = [
                PotholeReport(
                    latitude=26.4524,
                    longitude=80.3345,
                    location_name="Mall Road near Phool Bagh, Kanpur",
                    severity="High",
                    status="Unrepaired",
                    upvotes=24,
                    depth_cm=14.5,
                    width_cm=65.0,
                    ai_confidence=97.4,
                    bounding_boxes=[{"x": 25, "y": 35, "width": 45, "height": 30}],
                    image_path="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
                    notes="Deep crater in right lane. High hazard to vehicles."
                ),
                PotholeReport(
                    latitude=26.4465,
                    longitude=80.3262,
                    location_name="GT Road Junction near Civil Lines, Kanpur",
                    severity="Medium",
                    status="Scheduled for Repair",
                    upvotes=12,
                    depth_cm=8.0,
                    width_cm=42.0,
                    ai_confidence=91.2,
                    bounding_boxes=[{"x": 30, "y": 40, "width": 35, "height": 25}],
                    image_path="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
                    notes="Moderate surface crack expanding due to rain."
                ),
                PotholeReport(
                    latitude=26.4555,
                    longitude=80.3402,
                    location_name="Birhana Road, Canal Crossing, Kanpur",
                    severity="Low",
                    status="Under Inspection",
                    upvotes=5,
                    depth_cm=4.2,
                    width_cm=25.0,
                    ai_confidence=89.6,
                    bounding_boxes=[{"x": 40, "y": 30, "width": 25, "height": 20}],
                    image_path="https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80",
                    notes="Minor surface deformation reported by commuter."
                ),
                PotholeReport(
                    latitude=26.4612,
                    longitude=80.3210,
                    location_name="VIP Road near Swaroop Nagar, Kanpur",
                    severity="High",
                    status="Unrepaired",
                    upvotes=41,
                    depth_cm=18.2,
                    width_cm=78.0,
                    ai_confidence=98.8,
                    bounding_boxes=[{"x": 20, "y": 25, "width": 55, "height": 40}],
                    image_path="https://images.unsplash.com/photo-1578991624414-276ef23a534f?auto=format&fit=crop&w=800&q=80",
                    notes="Critical edge collapse near major intersection."
                )
            ]
            db.add_all(demo_potholes)
            db.commit()
            print("Seeded demo pothole reports successfully.")

        if db.query(RouteHistory).count() == 0:
            demo_routes = [
                RouteHistory(
                    trip_code="TRIP-801",
                    origin_name="Panki Industrial Area",
                    destination_name="IIT Kanpur Campus",
                    origin_lat=26.4385,
                    origin_lng=80.2440,
                    dest_lat=26.5120,
                    dest_lng=80.2330,
                    distance_km=11.3,
                    duration_min=24,
                    potholes_encountered=1,
                    potholes_avoided=3,
                    safety_score=94,
                    route_type="Safest Route"
                ),
                RouteHistory(
                    trip_code="TRIP-802",
                    origin_name="Kanpur Central Railway Station",
                    destination_name="Swaroop Nagar",
                    origin_lat=26.4540,
                    origin_lng=80.3500,
                    dest_lat=26.4760,
                    dest_lng=80.3110,
                    distance_km=6.8,
                    duration_min=16,
                    potholes_encountered=3,
                    potholes_avoided=2,
                    safety_score=82,
                    route_type="Fastest Route"
                )
            ]
            db.add_all(demo_routes)
            db.commit()
            print("Seeded demo route history successfully.")
    except Exception as err:
        print(f"Seed demo data notice: {err}")
    finally:
        db.close()

# Automatically create DB tables and seed demo data on startup
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("SQLAlchemy database tables verified/created successfully.")
        seed_demo_data()
    except Exception as e:
        print(f"Database initialization note: {e}")

# Include API Routers
app.include_router(auth_router)
app.include_router(scan_router)
app.include_router(reports_router)
app.include_router(map_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)
app.include_router(route_history_router)

# Root Health Check Endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "framework": "FastAPI (Python)",
        "endpoints": {
            "auth": "/api/auth",
            "dashboard": "/api/dashboard",
            "map": "/api/map",
            "routes_history": "/api/routes/history",
            "notifications": "/api/notifications",
            "reports": "/api/reports",
            "scan": "/api/scan",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
