from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User

async def get_engineers(db: AsyncSession):
    result = await db.execute(
        select(User).where(
            User.role == "Engineer",
            User.is_active == True
        )
    )

    return result.scalars().all()