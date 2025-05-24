from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class MCQSchema(BaseModel):
    transcript : str
    noOfMCQs: str
    
    class Config:
        from_attributes = True
      