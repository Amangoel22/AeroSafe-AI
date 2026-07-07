from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, DateTime, func, Boolean
from app.models.base import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('Admin', 'Engineer', name='user_role_enum'), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, nullable=False, default = True)