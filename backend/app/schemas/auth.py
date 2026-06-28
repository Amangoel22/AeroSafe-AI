from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Literal['Admin', 'Engineer']
    full_name: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserLogoutRequest(BaseModel):
    email: EmailStr

class AccountDeleteRequest(BaseModel):
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: Literal['Admin', 'Engineer']
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    is_login: bool
    is_active: bool

    @field_validator("created_at", "updated_at", "last_login", mode="before")
    def convert_to_ist(cls, v):
        if isinstance(v, datetime):
            if v.tzinfo is None:
                # The DB stores timestamps in local time (IST).
                v = v.replace(tzinfo=IST)
            return v
        return v

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
