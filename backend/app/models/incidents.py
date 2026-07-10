from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    TIMESTAMP,
    func,
    Boolean,
    Enum,
    ForeignKey,
    DateTime,
)

from app.models.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, autoincrement=True)

    location = Column(String(255), nullable=False)
    issue_type = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now()
    )

    is_active = Column(Boolean, nullable=False, default=True)

    camera_id = Column(
        Integer,
        ForeignKey("cameras.id"),
        nullable=False
    )

    assigned_to = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    severity = Column(
        Enum(
            "Low",
            "Medium",
            "High",
            "Critical",
            name="severity_enum"
        ),
        nullable=False
    )

    status = Column(
    Enum(
        "Pending",
        "Active",
        "Resolved",
        "False Alarm",
        name="incident_status_enum"
    ),
    nullable=False,
    default="Pending"
)

    reported_at = Column(
        DateTime,
        server_default=func.now()
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

    feedback = Column(
        Text,
        nullable=True
    )