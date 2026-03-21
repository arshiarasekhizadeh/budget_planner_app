from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.auth import get_current_user
from app.models.user import User
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[BudgetResponse])
def get_budgets(month: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Auto-rollover: If no items exist for this month, check if there are recurring items in the previous month
    exists = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == month).first()
    
    if not exists:
        try:
            # Simple previous month logic (YYYY-MM)
            date_obj = datetime.strptime(month, "%Y-%m")
            if date_obj.month == 1:
                prev_month = f"{date_obj.year - 1}-12"
            else:
                prev_month = f"{date_obj.year}-{date_obj.month - 1:02d}"
            
            recurring_items = db.query(Budget).filter(
                Budget.user_id == current_user.id, 
                Budget.month == prev_month,
                Budget.is_recurring == True
            ).all()
            
            for item in recurring_items:
                new_item = Budget(
                    category_name=item.category_name,
                    item_name=item.item_name,
                    item_amount_planned=item.item_amount_planned,
                    item_amount_actual=0.0, # Reset actual for new month
                    month=month,
                    is_recurring=True,
                    user_id=current_user.id
                )
                db.add(new_item)
            db.commit()
        except:
            pass # Fail gracefully if month parsing fails

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == month).all()
    return budgets

@router.post("/", response_model=BudgetResponse)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_budget = Budget(**budget.model_dump(), user_id=current_user.id)
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_update: BudgetUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget item not found")
    
    update_data = budget_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_budget, key, value)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.delete("/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not db_budget:
        raise HTTPException(status_code=404, detail="Budget item not found")
    
    db.delete(db_budget)
    db.commit()
    return {"message": "Budget item deleted successfully"}
