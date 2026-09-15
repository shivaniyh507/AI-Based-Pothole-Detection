import os
import time
import random
from typing import Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.config.settings import settings
from app.models.pothole_report import PotholeReport
from app.schemas.detection import FrameScanRequest
from app.services.detection_service import process_image_file, process_base64_frame
from app.middleware.auth import get_optional_user, User

router = APIRouter(prefix="/api/scan", tags=["Scan"])

@router.post("/upload")
async def upload_and_process_scan(
    image: UploadFile = File(...),
    latitude: Optional[float] = Form(28.6139),
    longitude: Optional[float] = Form(77.2090),
    locationName: Optional[str] = Form("Scanned Location"),
    autoSave: Optional[str] = Form("false"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    if not image:
        raise HTTPException(status_code=400, detail="No image or frame file uploaded")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"scan-{int(time.time() * 1000)}-{random.randint(1000, 9999)}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    contents = await image.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    relative_image_path = f"/{settings.UPLOAD_DIR}/{filename}"
    detection_result = process_image_file(file_path)

    saved_report = None
    if autoSave.lower() == "true":
        report = PotholeReport(
            latitude=latitude,
            longitude=longitude,
            location_name=locationName,
            severity=detection_result.get("severity", "Medium"),
            status="Pending",
            bounding_boxes=detection_result.get("boundingBoxes", []),
            image_path=relative_image_path,
            detected_potholes_count=detection_result.get("detectedPotholesCount", 1),
            reported_by_id=current_user.id if current_user else None
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        saved_report = {
            "id": report.id,
            "_id": str(report.id),
            "latitude": report.latitude,
            "longitude": report.longitude,
            "locationName": report.location_name,
            "severity": report.severity,
            "status": report.status,
            "imagePath": report.image_path
        }

    return {
        "success": True,
        "message": "Frame scan processed successfully",
        "imagePath": relative_image_path,
        "detection": detection_result,
        "report": saved_report
    }

@router.post("/process-frame")
def process_frame(payload: FrameScanRequest):
    if not payload.frameBase64:
        raise HTTPException(status_code=400, detail="No base64 frame data provided")

    result = process_base64_frame(payload.frameBase64)
    return result
