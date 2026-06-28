from sqlalchemy import Column, Integer, String, Enum, DateTime, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from app.models.base import Base

class IncidentStatus(Base):
    __tablename__ = 'incident_status'

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey('incidents.id', ondelete='CASCADE'), nullable=False)
    camera_location = Column(String(255), nullable=False)
    severity = Column(Enum('Low', 'Medium', 'High', 'Critical', name='severity_enum'), nullable=False)
    status = Column(Enum('Pending', 'In Progress', 'Resolved', name='status_enum'), server_default='Pending')
    camera_no = Column(String(50), nullable=True)
    reported_at = Column(DateTime, nullable=False)
    resolution_time = Column(DateTime, nullable=True)
    assigned_to = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships (optional but recommended for ORM)
    incident = relationship("Incident", backref="statuses")
    assignee = relationship("User", backref="assigned_incidents")
