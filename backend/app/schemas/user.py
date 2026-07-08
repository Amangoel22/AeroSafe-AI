from pydantic import BaseModel

class EngineerResponse(BaseModel):
    id: int
    full_name: str

    class Config:
        from_attributes = True