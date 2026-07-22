from typing import Optional
from pydantic import BaseModel

class UserProfile(BaseModel):
    """
    Represents the implicit or explicit profile of the user chatting with the AI.
    Used for hard-filtering scheme documents in Qdrant.
    """
    state: Optional[str] = None
    category: Optional[str] = None # e.g., Agriculture, Health, Student
    age: Optional[int] = None
    gender: Optional[str] = None
    income: Optional[float] = None
