import os
import time
import base64
import random
from typing import Dict, Any
from app.ml.predict import run_pothole_detection
from app.config.settings import settings

def process_image_file(file_path: str) -> Dict[str, Any]:
    """
    Processes an uploaded image file using the ML detection engine.
    """
    detection_result = run_pothole_detection(file_path)
    return detection_result

def process_base64_frame(base64_str: str) -> Dict[str, Any]:
    """
    Decodes a base64 encoded video frame, saves it temporarily to uploads/,
    and passes it through the AI detection pipeline.
    """
    try:
        # Strip header prefix if present (data:image/jpeg;base64,...)
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]

        image_bytes = base64.b64decode(base64_str)

        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        filename = f"frame-{int(time.time() * 1000)}-{random.randint(1000, 9999)}.jpg"
        file_path = os.path.join(settings.UPLOAD_DIR, filename)

        with open(file_path, "wb") as f:
            f.write(image_bytes)

        relative_path = f"/{settings.UPLOAD_DIR}/{filename}"
        detection = run_pothole_detection(file_path)

        return {
            "success": True,
            "imagePath": relative_path,
            "detection": detection
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to process base64 frame: {str(e)}",
            "detection": {
                "success": False,
                "detectedPotholesCount": 0,
                "severity": "Low",
                "boundingBoxes": []
            }
        }
