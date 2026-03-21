from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class MonthlyGoal(Base):
    __tablename__ = "monthly_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String, index=True) # e.g. "2026-03"
    goal_amount = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="monthly_goals")
