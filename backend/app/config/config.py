import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        # JWT
        self.JWT_SECRET = os.getenv("JWT_SECRET", "")
        self.JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
        )

        # AI Service
        self.AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY", "")

        # PostgreSQL (Supabase)
        self.DATABASE_URL = os.getenv("DATABASE_URL")


settings = Settings()