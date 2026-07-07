from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, func
from app.models.base import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, autoincrement=True)
    camera_code = Column(String(50), unique=True, nullable=False)
    camera_name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    rtsp_url = Column(String(500), nullable=False)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        TIMESTAMP,
        server_default=func.now()
    )
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )