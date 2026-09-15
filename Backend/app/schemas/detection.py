from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class DetectionResult(BaseModel):
    success: bool
    detectedPotholesCount: int
    severity: str
    boundingBoxes: List[BoundingBox]
    analyzedDimensions: Optional[Dict[str, int]] = None
    error: Optional[str] = None

class FrameScanRequest(BaseModel):
    frameBase64: str
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090
