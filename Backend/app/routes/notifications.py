from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.notification import Notification
from app.middleware.auth import get_optional_user, get_current_user, User

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class NotificationCreatePayload(BaseModel):
    title: str
    message: str
    targetUser: Optional[int] = None
    type: Optional[str] = "info"

@router.get("")
def get_notifications(
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if current_user:
        query = query.filter(
            (Notification.target_user_id == current_user.id) | (Notification.target_user_id.is_(None))
        )
    
    notifications = query.order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = db.query(Notification).filter(
        (Notification.read.is_(False)) & 
        ((Notification.target_user_id == (current_user.id if current_user else None)) | (Notification.target_user_id.is_(None)))
    ).count()

    items = [
        {
            "id": n.id,
            "_id": str(n.id),
            "title": n.title,
            "message": n.message,
            "read": n.read,
            "type": n.type,
            "createdAt": n.created_at
        } for n in notifications
    ]

    return {
        "success": True,
        "unreadCount": unread_count,
        "count": len(items),
        "notifications": items
    }

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.read = True
    db.commit()

    return {
        "success": True,
        "message": "Notification marked as read",
        "notification": {
            "id": notif.id,
            "_id": str(notif.id),
            "read": notif.read
        }
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreatePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.title or not payload.message:
        raise HTTPException(status_code=400, detail="Title and message are required")

    notif = Notification(
        title=payload.title,
        message=payload.message,
        target_user_id=payload.targetUser,
        type=payload.type or "info"
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return {
        "success": True,
        "notification": {
            "id": notif.id,
            "_id": str(notif.id),
            "title": notif.title,
            "message": notif.message,
            "read": notif.read,
            "type": notif.type,
            "createdAt": notif.created_at
        }
    }
