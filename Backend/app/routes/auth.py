from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.middleware.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists with this email"
        )

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password=get_password_hash(payload.password),
        role=payload.role or "driver",
        avatar=payload.avatar or ""
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"id": user.id, "sub": str(user.id)})
    
    # Format response compatible with frontend (_id and id string/num)
    user_resp = UserResponse.from_orm(user)
    user_resp._id = str(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_resp,
        "success": True,
        "_id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "token": token
    }

@router.post("/login")
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"id": user.id, "sub": str(user.id)})

    return {
        "success": True,
        "_id": str(user.id),
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "avatar": user.avatar,
        "token": token,
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "_id": str(current_user.id),
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "avatar": current_user.avatar,
        "createdAt": current_user.created_at
    }

@router.put("/profile")
def update_user_profile(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.name:
        current_user.name = payload.name
    if payload.email:
        current_user.email = payload.email.lower()
    if payload.avatar:
        current_user.avatar = payload.avatar
    if payload.password:
        current_user.password = get_password_hash(payload.password)

    db.commit()
    db.refresh(current_user)

    token = create_access_token({"id": current_user.id, "sub": str(current_user.id)})

    return {
        "success": True,
        "_id": str(current_user.id),
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "avatar": current_user.avatar,
        "token": token
    }
