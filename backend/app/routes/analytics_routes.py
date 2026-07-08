from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.config.database import get_db
from app.schemas.analytics import MonthlyStatsResponse, TrendResponse
from app.services.analytics_service import get_monthly_stats, get_resolution_trends
from app.services.auth_service import get_current_user
from app.models.users import User
from app.utils.logger import logger

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/stats", response_model=List[MonthlyStatsResponse], status_code=status.HTTP_200_OK)
async def read_monthly_stats(
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user) enable when jwt done
):
    try:
        stats = await get_monthly_stats(db)
        return stats
    except Exception as e:
        logger.error(f"Error in read_monthly_stats route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error fetching monthly stats"
        )

@router.get("/trends", response_model=List[TrendResponse], status_code=status.HTTP_200_OK)
async def read_resolution_trends(
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user) enable when jwt done
):
    try:
        trends = await get_resolution_trends(db)
        return trends
    except Exception as e:
        logger.error(f"Error in read_resolution_trends route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error fetching resolution trends"
        )
