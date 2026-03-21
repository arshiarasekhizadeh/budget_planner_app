from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.monthly_goal import MonthlyGoal
from app.schemas.monthly_goal import MonthlyGoalCreate, MonthlyGoalUpdate, MonthlyGoalResponse
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=Optional[MonthlyGoalResponse])
def get_monthly_goal(month: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(MonthlyGoal).filter(MonthlyGoal.user_id == current_user.id, MonthlyGoal.month == month).first()
    return goal

@router.post("/", response_model=MonthlyGoalResponse)
def create_or_update_monthly_goal(goal_data: MonthlyGoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_goal = db.query(MonthlyGoal).filter(
        MonthlyGoal.user_id == current_user.id, 
        MonthlyGoal.month == goal_data.month
    ).first()
    
    if existing_goal:
        existing_goal.goal_amount = goal_data.goal_amount
        db.commit()
        db.refresh(existing_goal)
        return existing_goal
    
    new_goal = MonthlyGoal(**goal_data.model_dump(), user_id=current_user.id)
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal
