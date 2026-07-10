from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

class IncidentStatusResponse(BaseModel):
    id: int
    incident_id: int
    camera_location: str
    severity: Literal['Low', 'Medium', 'High', 'Critical']
    status: Literal[
    "Pending",
    "Active",
    "Resolved",
    "False Alarm",
]
    camera_no: Optional[str] = None
    reported_at: datetime
    resolution_time: Optional[datetime] = None
    assigned_to: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("reported_at", "resolution_time", "created_at", "updated_at", mode="before")
    def convert_to_ist(cls, v):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=IST)
            return v
        return v

    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: int

    camera_id: int
    assigned_to: Optional[int] = None

    location: str
    issue_type: str

    image_url: Optional[str] = None
    description: Optional[str] = None

    severity: Literal[
        "Low",
        "Medium",
        "High",
        "Critical",
    ]

    status: Literal[
    "Pending",
    "Active",
    "Resolved",
    "False Alarm",
]

    created_at: datetime
    reported_at: datetime
    resolved_at: Optional[datetime] = None

    is_active: bool

    @field_validator("created_at", mode="before")
    def convert_to_ist(cls, v):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=IST)
            return v
        return v

    @field_validator(
    "created_at",
    "reported_at",
    "resolved_at",
    mode="before"
)
    def convert_to_ist(cls, v):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                v = v.replace(tzinfo=IST)
            return v
        return v

    class Config:
        from_attributes = True

class ComplaintCreateRequest(BaseModel):
    camera_id: int

    location: str
    issue_type: str
    image_url: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

    severity: Optional[
        Literal["Low", "Medium", "High", "Critical"]
    ] = "Low"

    status: Optional[
        Literal[
            "Pending",
            "Active",
            "Resolved",
            "False Alarm",
        ]
    ] = "Pending"

    assigned_to: Optional[int] = None
    reported_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    feedback: Optional[str] = None

class ComplaintUpdateRequest(BaseModel):
    camera_id: Optional[int] = None

    assigned_to: Optional[int] = None

    location: Optional[str] = None

    issue_type: Optional[str] = None

    image_url: Optional[str] = None

    description: Optional[str] = None

    severity: Optional[
        Literal[
            "Low",
            "Medium",
            "High",
            "Critical",
        ]
    ] = None

    status: Optional[
        Literal[
            "Pending",
            "Active",
            "Resolved",
            "False Alarm",
        ]
    ] = None

    reported_at: Optional[datetime] = None

    resolved_at: Optional[datetime] = None

    feedback: Optional[str] = None

    is_active: Optional[bool] = None
