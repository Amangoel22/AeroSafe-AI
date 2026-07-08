from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.schemas.user import EngineerResponse
from app.services.user_service import get_engineers

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get(
    "/engineers",
    response_model=List[EngineerResponse]
)
async def read_engineers(
    db: AsyncSession = Depends(get_db)
):
    return await get_engineers(db)