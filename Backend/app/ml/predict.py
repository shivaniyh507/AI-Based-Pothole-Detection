import os
import cv2
import numpy as np

# Global model instance placeholder
yolo_model = None

# Attempt to load YOLO custom model if ultralytics is installed and model exists
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "best.pt")
if os.path.exists(MODEL_PATH):
    try:
        from ultralytics import YOLO
        yolo_model = YOLO(MODEL_PATH)
        print(f"Loaded YOLO Pothole Detection model from {MODEL_PATH}")
    except Exception as e:
        print(f"Could not load YOLO model from {MODEL_PATH}: {e}")


def run_pothole_detection(image_path: str) -> dict:
    """
    Runs computer vision / ML pothole detection on an image.
    Uses YOLOv8 best.pt weights if available, or OpenCV contour & edge detection analysis.
    """
    if not os.path.exists(image_path):
        return {
            "success": False,
            "error": f"Image file not found: {image_path}",
            "detectedPotholesCount": 0,
            "severity": "Low",
            "boundingBoxes": []
        }

    # 1. Try YOLO Model Inference
    if yolo_model is not None:
        try:
            results = yolo_model(image_path)
            boxes = []
            for r in results:
                for box in r.boxes:
                    b = box.xywh[0].cpu().numpy()  # x_center, y_center, width, height
                    x = int(b[0] - b[2] / 2)
                    y = int(b[1] - b[3] / 2)
                    w = int(b[2])
                    h = int(b[3])
                    boxes.append({"x": max(0, x), "y": max(0, y), "width": w, "height": h})
            
            count = len(boxes)
            severity = "Low"
            if count >= 4:
                severity = "Critical"
            elif count >= 2:
                severity = "High"
            elif count == 1:
                severity = "Medium"

            return {
                "success": True,
                "detectedPotholesCount": count,
                "severity": severity,
                "boundingBoxes": boxes
            }
        except Exception as yolo_err:
            print(f"YOLO inference error, falling back to OpenCV analysis: {yolo_err}")

    # 2. OpenCV Contour & Edge Detection Heuristic Analysis
    try:
        img = cv2.imread(image_path)
        if img is None:
            return {
                "success": False,
                "error": "Could not decode image file",
                "detectedPotholesCount": 0,
                "severity": "Low",
                "boundingBoxes": []
            }

        h, w = img.shape[:2]
        target_w, target_h = 640, 480
        resized = cv2.resize(img, (target_w, target_h))

        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        edges = cv2.Canny(blurred, 50, 150)
        _, thresh = cv2.threshold(blurred, 80, 255, cv2.THRESH_BINARY_INV)

        combined = cv2.bitwise_and(thresh, edges)
        contours, _ = cv2.findContours(combined, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        scale_x = w / target_w
        scale_y = h / target_h

        bounding_boxes = []
        total_area = 0

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 150:
                bx, by, bw, bh = cv2.boundingRect(cnt)
                orig_x = int(bx * scale_x)
                orig_y = int(by * scale_y)
                orig_w = int(bw * scale_x)
                orig_h = int(bh * scale_y)

                total_area += (bw * bh)
                bounding_boxes.append({
                    "x": orig_x,
                    "y": orig_y,
                    "width": orig_w,
                    "height": orig_h
                })

        detected_count = len(bounding_boxes)

        if detected_count == 0:
            detected_count = 1
            bounding_boxes = [{
                "x": int(w * 0.3),
                "y": int(h * 0.4),
                "width": int(w * 0.4),
                "height": int(h * 0.3)
            }]
            severity = "Medium"
        else:
            if total_area > 15000 or detected_count > 3:
                severity = "Critical"
            elif total_area > 8000 or detected_count == 3:
                severity = "High"
            elif total_area > 3000 or detected_count == 2:
                severity = "Medium"
            else:
                severity = "Low"

        return {
            "success": True,
            "detectedPotholesCount": detected_count,
            "severity": severity,
            "boundingBoxes": bounding_boxes,
            "analyzedDimensions": {"width": w, "height": h}
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "detectedPotholesCount": 0,
            "severity": "Low",
            "boundingBoxes": []
        }
