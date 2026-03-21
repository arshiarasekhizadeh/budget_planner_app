from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String)
    item_name = Column(String)
    item_amount_planned = Column(Float)
    item_amount_actual = Column(Float)
    month = Column(String, index=True) # e.g. "2026-03"
    is_recurring = Column(Boolean, default=False)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user = relationship("User", back_populates="budgets")



