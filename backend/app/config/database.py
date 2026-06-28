from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from contextlib import asynccontextmanager
from app.utils.logger import logger
from app.config.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True,
    pool_use_lifo=True
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            # Rollback on exception before routes can commit
            await session.rollback()
            raise
        finally:
            # Always close the session
            await session.close()

@asynccontextmanager
async def db_session_maker():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def test_connection():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda conn: None)
        logger.info("Database connected")
    except SQLAlchemyError as e:
        logger.error(f"Database connection failed: {e}")

async def show_tables():
    try:
        async with engine.connect() as conn:    
            result = await conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            logger.info("Tables in database:")
            for table in tables:
                logger.info(f"- {table}")
            return tables
    except SQLAlchemyError as e:
        logger.error(f"Failed to fetch tables: {e}")
        return []
