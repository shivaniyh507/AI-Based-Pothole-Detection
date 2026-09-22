from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.pothole_report import PotholeReport
from app.models.notification import Notification
from app.schemas.report import ReportCreate, ReportStatusUpdate
from app.middleware.auth import get_optional_user, get_current_user, User

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    report = PotholeReport(
        latitude=payload.latitude,
        longitude=payload.longitude,
        location_name=payload.location_name or "Reported Location",
        severity=payload.severity or "Medium",
        status="Pending",
        bounding_boxes=payload.bounding_boxes or [],
        image_path=payload.image_path or "/uploads/default-pothole.jpg",
        detected_potholes_count=payload.detected_potholes_count or 1,
        reported_by_id=current_user.id if current_user else None,
        notes=payload.notes or ""
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Generate Notification
    notif = Notification(
        title="New Pothole Report Created",
        message=f"A new {report.severity} severity pothole was reported at {report.location_name}.",
        target_user_id=current_user.id if current_user else None,
        type="alert"
    )
    db.add(notif)
    db.commit()

    return {
        "success": True,
        "report": {
            "id": report.id,
            "_id": str(report.id),
            "latitude": report.latitude,
            "longitude": report.longitude,
            "locationName": report.location_name,
            "severity": report.severity,
            "status": report.status,
            "boundingBoxes": report.bounding_boxes,
            "imagePath": report.image_path,
            "detectedPotholesCount": report.detected_potholes_count,
            "notes": report.notes,
            "createdAt": report.created_at
        }
    }

@router.get("")
def get_reports(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50),
    page: int = Query(1),
    db: Session = Depends(get_db)
):
    query = db.query(PotholeReport)

    if status:
        query = query.filter(PotholeReport.status == status)
    if severity:
        query = query.filter(PotholeReport.severity == severity)
    if search:
        query = query.filter(PotholeReport.location_name.ilike(f"%{search}%"))

    total = query.count()
    skip = (page - 1) * limit
    reports = query.order_by(PotholeReport.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for r in reports:
        reporter_obj = None
        if r.reporter:
            reporter_obj = {
                "id": r.reporter.id,
                "_id": str(r.reporter.id),
                "name": r.reporter.name,
                "email": r.reporter.email,
                "role": r.reporter.role
            }

        assignee_obj = None
        if r.assignee:
            assignee_obj = {
                "id": r.assignee.id,
                "_id": str(r.assignee.id),
                "name": r.assignee.name,
                "email": r.assignee.email,
                "role": r.assignee.role
            }

        items.append({
            "id": r.id,
            "_id": str(r.id),
            "latitude": r.latitude,
            "longitude": r.longitude,
            "locationName": r.location_name,
            "severity": r.severity,
            "status": r.status,
            "boundingBoxes": r.bounding_boxes,
            "imagePath": r.image_path,
            "detectedPotholesCount": r.detected_potholes_count,
            "reportedBy": reporter_obj,
            "assignedTo": assignee_obj,
            "repairedAt": r.repaired_at,
            "notes": r.notes,
            "createdAt": r.created_at
        })

    return {
        "success": True,
        "count": len(items),
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit if limit > 0 else 1,
        "reports": items
    }

@router.get("/{report_id}")
def get_report_by_id(report_id: int, db: Session = Depends(get_db)):
    r = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Pothole report not found")

    return {
        "success": True,
        "report": {
            "id": r.id,
            "_id": str(r.id),
            "lat": r.latitude,
            "lng": r.longitude,
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
            "boundingBoxes": r.bounding_boxes,
            "imagePath": r.image_path,
            "detectedPotholesCount": r.detected_potholes_count,
            "reportedBy": {"id": r.reporter.id, "name": r.reporter.name} if r.reporter else None,
            "assignedTo": {"id": r.assignee.id, "name": r.assignee.name} if r.assignee else None,
            "repairedAt": r.repaired_at,
            "notes": r.notes,
            "createdAt": r.created_at
        }
    }

@router.post("/{report_id}/upvote")
def upvote_report(report_id: int, db: Session = Depends(get_db)):
    r = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Pothole report not found")

    r.upvotes = (r.upvotes or 0) + 1
    db.commit()
    db.refresh(r)

    return {
        "success": True,
        "id": r.id,
        "upvotes": r.upvotes,
        "message": "Report upvoted successfully"
    }

@router.put("/{report_id}/status")
def update_report_status(
    report_id: int,
    payload: ReportStatusUpdate,
    db: Session = Depends(get_db)
):
    report = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Pothole report not found")

    if payload.status:
        if payload.status not in ["Pending", "In-Progress", "Repaired"]:
            raise HTTPException(status_code=400, detail="Invalid status value")
        report.status = payload.status
        if payload.status == "Repaired":
            report.repaired_at = datetime.utcnow()

    if payload.assignedTo:
        report.assigned_to_id = payload.assignedTo

    if payload.notes:
        report.notes = payload.notes

    db.commit()
    db.refresh(report)

    # Trigger Status Update Notification
    if report.reported_by_id:
        notif = Notification(
            title=f"Report Status Updated: {report.status}",
            message=f"Your reported pothole at {report.location_name} status is now '{report.status}'.",
            target_user_id=report.reported_by_id,
            type="status_update"
        )
        db.add(notif)
        db.commit()

    return {
        "success": True,
        "report": {
            "id": report.id,
            "_id": str(report.id),
            "status": report.status,
            "notes": report.notes,
            "repairedAt": report.repaired_at
        }
    }

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(PotholeReport).filter(PotholeReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Pothole report not found")

    db.delete(report)
    db.commit()

    return {
        "success": True,
        "message": "Pothole report removed"
    }
