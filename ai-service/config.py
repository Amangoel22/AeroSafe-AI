import os
from dotenv import load_dotenv

# Load .env file from the ai-service directory
load_dotenv()


class Settings:
    def __init__(self):
        # Backend connection
        self.BACKEND_URL        = os.getenv("BACKEND_URL", "http://localhost:8000/api/complaints")
        self.AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY", "")

        # Detection tuning
        self.CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
        self.COOLDOWN_SECONDS     = int(os.getenv("COOLDOWN_SECONDS", "10"))

        # Camera / location identity — set per deployment in .env
        self.CAMERA_NAME = os.getenv("CAMERA_NAME", "CAM-UNKNOWN")
        self.LOCATION    = os.getenv("LOCATION", "Unknown Location")

        # Auth header sent with every backend request
        self.REQUEST_HEADERS = {"X-API-Key": self.AI_SERVICE_API_KEY}


settings = Settings()
