from pydantic import BaseModel
from typing import List

class MonthlyStatsResponse(BaseModel):
    month: str  # e.g., "2026-06"
    count: int

class TrendResponse(BaseModel):
    issue_type: str
    average_resolution_hours: float
