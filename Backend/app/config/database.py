import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .settings import settings

db_url = settings.DATABASE_URL

# Fallback to SQLite if PostgreSQL connection fails or isn't running locally
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    with engine.connect() as conn:
        pass
except Exception:
    # Fallback sqlite engine if postgres connection fails or server is offline
    sqlite_fallback = "sqlite:///./pothole_app.db"
    engine = create_engine(sqlite_fallback, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
