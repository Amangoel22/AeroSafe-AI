from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, Depends, Header
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from app.models.users import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.utils.security import hash_password, verify_password, decode_access_token
from app.utils.logger import logger
from app.config.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_user_by_email(db: AsyncSession, email: str) -> User:
    try:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()
    except Exception as e:
        logger.error(f"Error fetching user by email {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching user"
        )

async def register_user(db: AsyncSession, data: UserRegisterRequest) -> User:
    logger.info(f"Attempting to register user: {data.email}")
    existing_user = await get_user_by_email(db, data.email)
    if existing_user:
        logger.warning(f"Registration failed: email {data.email} already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        hashed = hash_password(data.password)
        # full_name is nullable=False in the database, so if None we set to empty string
        new_user = User(
            email=data.email,
            password_hash=hashed,
            role=data.role,
            full_name=data.full_name or "",
            is_active=True,
            is_login=True,
            last_login=datetime.now()
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        logger.info(f"User {data.email} registered successfully with ID {new_user.id}")
        return new_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Registration failed for {data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

async def login_user(db: AsyncSession, data: UserLoginRequest) -> User:
    logger.info(f"Login attempt for user: {data.email}")
    user = await get_user_by_email(db, data.email)
    if not user:
        logger.warning(f"Login failed: user {data.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(data.password, user.password_hash):
        logger.warning(f"Login failed: incorrect password for {data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        logger.warning(f"Login failed: account {data.email} is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    try:
        user.is_login = True
        user.last_login = datetime.now()
        await db.commit()
        await db.refresh(user)
        logger.info(f"User {data.email} logged in successfully")
        return user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during login commit for {data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login process failed"
        )

async def logout_user(db: AsyncSession, email: str) -> User:
    logger.info(f"Logout attempt for email: {email}")
    user = await get_user_by_email(db, email)
    if not user:
        logger.warning(f"Logout failed: user {email} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_login:
        logger.warning(f"Logout warning: user {email} was not logged in")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already logged out"
        )
    
    try:
        user.is_login = False
        user.last_login = datetime.now()
        await db.commit()
        await db.refresh(user)
        logger.info(f"User {email} logged out successfully")
        return user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during logout commit for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout process failed"
        )

async def deactivate_account(db: AsyncSession, email: str) -> User:
    logger.info(f"Deactivation attempt for account: {email}")
    user = await get_user_by_email(db, email)
    if not user:
        logger.warning(f"Deactivation failed: user {email} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        logger.warning(f"Deactivation warning: user {email} is already inactive")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is already inactive"
        )
    
    try:
        user.is_active = False
        user.is_login = False
        user.last_login = datetime.now()
        await db.commit()
        await db.refresh(user)
        logger.info(f"User account {email} deactivated successfully")
        return user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error during deactivation commit for {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deactivation failed"
        )

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    if not token:
        logger.warning("Authentication failed: No token provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
        
    payload = decode_access_token(token)
    if not payload:
        logger.warning("Authentication failed: Invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials / Token expired"
        )
    
    email: str = payload.get("sub")
    if not email:
        logger.warning("Authentication failed: Token payload missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = await get_user_by_email(db, email)
    if not user:
        logger.warning(f"Authentication failed: User {email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
        
    if not user.is_active:
        logger.warning(f"Authentication failed: User {email} is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
        
    return user


from typing import Optional

async def get_current_user_or_service(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Dual-auth dependency:
      - If a valid X-API-Key header is provided (AI service), bypass user auth.
      - Otherwise, fall back to standard JWT user auth.
    Returns the User object for human callers, or None for the AI service.
    """
    from app.config.config import settings

    # 1. AI service key check (takes priority over JWT)
    if x_api_key:
        if x_api_key == settings.AI_SERVICE_API_KEY:
            logger.info("Request authenticated via AI service API key")
            return None  # Signals: authenticated as AI service, not a human user
        logger.warning("Authentication failed: Invalid X-API-Key provided")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )

    # 2. Fall back to standard JWT user auth
    if not token:
        logger.warning("Authentication failed: No token or API key provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    payload = decode_access_token(token)
    if not payload:
        logger.warning("Authentication failed: Invalid or expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials / Token expired"
        )

    email: str = payload.get("sub")
    if not email:
        logger.warning("Authentication failed: Token payload missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    user = await get_user_by_email(db, email)
    if not user:
        logger.warning(f"Authentication failed: User {email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        logger.warning(f"Authentication failed: User {email} is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user
