import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.config import test_connection, show_tables
from app.routes.auth_routes import router as auth_router
from app.routes.complaint_routes import router as complaint_router
from app.routes.analytics_routes import router as analytics_router
from app.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up AAI Safety Monitoring API...")
    try:
        await test_connection()
        await show_tables()
    except Exception as e:
        logger.error(f"Error during startup connection tests: {str(e)}")
    yield
    # Shutdown logic
    logger.info("Shutting down AAI Safety Monitoring API...")

app = FastAPI(
    title="AAI Safety Monitoring System API",
    description="Backend API for managing safety incidents, statuses, and users",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(complaint_router)
app.include_router(analytics_router)

@app.get("/")
async def root():
    return {"status": "healthy", "service": "AAI Safety Monitoring System API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
