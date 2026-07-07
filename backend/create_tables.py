import asyncio

from app.config.database import engine
from app.models.base import Base

from app.models.users import User
from app.models.camera import Camera
from app.models.incidents import Incident


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())