from pydantic import BaseModel
from typing import Optional

class BudgetBase(BaseModel):
    category_name: str
    item_name: str
    item_amount_planned: float = 0.0
    item_amount_actual: float = 0.0
    month: str
    is_recurring: Optional[bool] = False

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category_name: Optional[str] = None
    item_name: Optional[str] = None
    item_amount_planned: Optional[float] = None
    item_amount_actual: Optional[float] = None
    month: Optional[str] = None
    is_recurring: Optional[bool] = None

class BudgetResponse(BudgetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
