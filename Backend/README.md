# AI-Based Pothole Detection Backend (FastAPI)

A high-performance Python FastAPI backend for real-time pothole detection, GIS mapping, driver navigation hazard alerts, and pothole report lifecycle management.

## 🚀 Features

- **FastAPI REST Framework**: High speed async API execution with automatic Interactive OpenAPI docs (`/docs`).
- **AI/ML Inference Engine (`app/ml`)**: Supports YOLOv8 custom weights (`ml/model/best.pt`) with automatic OpenCV contour/edge detection fallback.
- **SQLAlchemy ORM (`app/models`)**: Database models for `User`, `PotholeReport`, and `Notification` with PostgreSQL & SQLite support.
- **Pydantic Validation (`app/schemas`)**: Strict payload validation for requests and responses.
- **JWT Security & Auth (`app/middleware`)**: Password hashing with Bcrypt and JWT token authorization.
- **Service Layer (`app/services`)**: Encapsulated frame processing, computer vision, and spatial safe route navigation algorithms.

---

## 🛠️ Project Structure

```
Backend/
│
├── app/
│   ├── main.py                     # Application entry point & route registration
│   │
│   ├── config/
│   │   ├── database.py             # Database engine & session setup
│   │   └── settings.py             # Environment & Pydantic settings configuration
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── pothole_report.py
│   │   └── notification.py
│   │
│   ├── schemas/                    # Pydantic data validation schemas
│   │   ├── user.py
│   │   ├── report.py
│   │   └── detection.py
│   │
│   ├── routes/                     # API endpoint routers
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── scan.py
│   │   ├── reports.py
│   │   ├── map.py
│   │   └── notifications.py
│   │
│   ├── services/                   # Business logic services
│   │   ├── detection_service.py
│   │   └── route_service.py
│   │
│   ├── middleware/                 # Security & JWT authentication middleware
│   │   └── auth.py
│   │
│   └── ml/                         # Computer Vision & Deep Learning inference
│       ├── predict.py
│       └── model/
│           └── best.pt
│
├── uploads/                        # Uploaded images & saved scan frames
├── .env                            # Environment configuration
├── requirements.txt                # Python dependencies
└── README.md
```

---

## ⚡ Setup & Run

### 1. Install Dependencies

```bash
cd Backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` to configure your PostgreSQL connection string or use SQLite default.

### 3. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access Interactive API Documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
