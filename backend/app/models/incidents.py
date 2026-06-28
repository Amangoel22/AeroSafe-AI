from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func, Boolean
from app.models.base import Base

class Incident(Base):
    __tablename__ = 'incidents'

    id = Column(Integer, primary_key=True, autoincrement=True)
    location = Column(String(255), nullable=False)
    issue_type = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    is_active = Column(Boolean, nullable=False, default=True)
