from .auth import router as auth_router
from .scan import router as scan_router
from .reports import router as reports_router
from .map import router as map_router
from .dashboard import router as dashboard_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "scan_router",
    "reports_router",
    "map_router",
    "dashboard_router",
    "notifications_router"
]
