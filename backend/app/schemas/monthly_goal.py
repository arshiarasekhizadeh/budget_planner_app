from pydantic import BaseModel
from typing import Optional

class MonthlyGoalBase(BaseModel):
    month: str
    goal_amount: float

class MonthlyGoalCreate(MonthlyGoalBase):
    pass

class MonthlyGoalUpdate(BaseModel):
    goal_amount: float

class MonthlyGoalResponse(MonthlyGoalBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
