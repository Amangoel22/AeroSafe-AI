from datetime import datetime, timedelta
import bcrypt
import jwt
from typing import Union, Any
from app.config.config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return decoded_token
    except jwt.PyJWTError:
        return None

import hmac
import hashlib
import time
from urllib.parse import urlencode

def generate_presigned_url(file_path: str, expires_in: int = 3600) -> str:
    if not file_path:
        return None
    if file_path.startswith("http://") or file_path.startswith("https://"):
        return file_path
    
    # Local file fallback with signature
    expiry = int(time.time()) + expires_in
    message = f"{file_path}:{expiry}".encode("utf-8")
    signature = hmac.new(settings.JWT_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()
    
    params = {
        "file": file_path,
        "expires": expiry,
        "signature": signature
    }
    return f"http://localhost:8000/api/complaints/image?{urlencode(params)}"

def verify_presigned_url(file_path: str, expiry: int, signature: str) -> bool:
    if time.time() > expiry:
        return False
    message = f"{file_path}:{expiry}".encode("utf-8")
    expected_signature = hmac.new(settings.JWT_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_signature, signature)
