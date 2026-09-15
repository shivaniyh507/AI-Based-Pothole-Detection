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

# Import Routers
from app.routes.auth import router as auth_router
from app.routes.scan import router as scan_router
from app.routes.reports import router as reports_router
from app.routes.map import router as map_router
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router

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

# Automatically create DB tables on startup
@app.on_event("startup")
def startup_event():
    try:
        Base.metadata.create_all(bind=engine)
        print("SQLAlchemy database tables verified/created successfully.")
    except Exception as e:
        print(f"Database initialization note: {e}")

# Include API Routers
app.include_router(auth_router)
app.include_router(scan_router)
app.include_router(reports_router)
app.include_router(map_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)

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
            "notifications": "/api/notifications",
            "reports": "/api/reports",
            "scan": "/api/scan",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
