from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.config import get_db
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserLogoutRequest,
    AccountDeleteRequest,
    UserResponse,
    TokenResponse
)
from app.services.auth_service import (
    register_user,
    login_user,
    logout_user,
    deactivate_account,
    get_current_user
)
from app.models.users import User
from app.utils.security import create_access_token
from app.utils.logger import logger

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/registration", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, data)
        token = create_access_token(subject=user.email)
        return TokenResponse(access_token=token, user=UserResponse.from_orm(user))
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during registration endpoint execution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    try:
        login_data = UserLoginRequest(email=data.username, password=data.password)
        user = await login_user(db, login_data)
        token = create_access_token(subject=user.email)
        return TokenResponse(access_token=token, user=UserResponse.from_orm(user))
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during login endpoint execution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

@router.post("/logout", response_model=dict, status_code=status.HTTP_200_OK)
async def logout(
    data: UserLogoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if current_user.email != data.email:
            logger.warning(f"Unauthorized logout attempt: {current_user.email} tried to logout {data.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to log out this user"
            )
        await logout_user(db, data.email)
        return {"message": "Logged out successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during logout endpoint execution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during logout"
        )

@router.delete("/account", response_model=dict, status_code=status.HTTP_200_OK)
async def delete_account(
    data: AccountDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        if current_user.email != data.email:
            logger.warning(f"Unauthorized deactivation attempt: {current_user.email} tried to deactivate {data.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to deactivate this account"
            )
        await deactivate_account(db, data.email)
        return {"message": "Account deactivated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error during deactivation endpoint execution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during account deactivation"
        )

# Helper endpoint to test get_current_user logic
@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)
