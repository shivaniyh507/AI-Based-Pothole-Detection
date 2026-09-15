from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pothole_report import PotholeReport
from app.models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_potholes = db.query(PotholeReport).count()
    pending_count = db.query(PotholeReport).filter(PotholeReport.status == "Pending").count()
    in_progress_count = db.query(PotholeReport).filter(PotholeReport.status == "In-Progress").count()
    repaired_count = db.query(PotholeReport).filter(PotholeReport.status == "Repaired").count()

    critical_count = db.query(PotholeReport).filter(PotholeReport.severity == "Critical").count()
    high_count = db.query(PotholeReport).filter(PotholeReport.severity == "High").count()
    medium_count = db.query(PotholeReport).filter(PotholeReport.severity == "Medium").count()
    low_count = db.query(PotholeReport).filter(PotholeReport.severity == "Low").count()

    total_drivers = db.query(User).filter(User.role == "driver").count()

    repair_rate = round((repaired_count / total_potholes) * 100) if total_potholes > 0 else 0

    return {
        "success": True,
        "stats": {
            "totalPotholes": total_potholes,
            "pendingCount": pending_count,
            "inProgressCount": in_progress_count,
            "repairedCount": repaired_count,
            "criticalCount": critical_count,
            "highCount": high_count,
            "mediumCount": medium_count,
            "lowCount": low_count,
            "totalDrivers": total_drivers,
            "repairRatePercentage": repair_rate
        }
    }

@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    recent_reports = db.query(PotholeReport).order_by(PotholeReport.created_at.desc()).limit(5).all()

    recent_detections = [
        {
            "id": r.id,
            "_id": str(r.id),
            "locationName": r.location_name,
            "severity": r.severity,
            "status": r.status,
            "createdAt": r.created_at,
            "reportedBy": {"name": r.reporter.name, "email": r.reporter.email} if r.reporter else None
        } for r in recent_reports
    ]

    severity_counts = db.query(PotholeReport.severity, func.count(PotholeReport.id)).group_by(PotholeReport.severity).all()
    status_counts = db.query(PotholeReport.status, func.count(PotholeReport.id)).group_by(PotholeReport.status).all()

    return {
        "success": True,
        "analytics": {
            "recentDetections": recent_detections,
            "severityBreakdown": [{"_id": s[0], "count": s[1]} for s in severity_counts],
            "statusBreakdown": [{"_id": s[0], "count": s[1]} for s in status_counts]
        }
    }
