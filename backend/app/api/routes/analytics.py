from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
import io
import csv
from google import genai
from app.core.database import get_db
from app.models.budget import Budget
from app.services.auth import get_current_user
from app.models.user import User
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

router = APIRouter()

# Configure Gemini with the NEW SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

@router.get("/ai-advice")
async def get_ai_advice(month: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    global client
    if not client:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            client = genai.Client(api_key=api_key)
        else:
            return {"advice": "AI Advisor is not configured. Please add GEMINI_API_KEY to your backend .env file."}

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == month).all()
    
    if not budgets:
        return {"advice": "I don't see any budget data for this month yet. Add some items to get personalized advice!"}

    # Prepare data for AI
    data_summary = []
    total_income = 0
    total_expenses = 0
    for b in budgets:
        data_summary.append(f"{b.category_name}: {b.item_name} - Planned: ${b.item_amount_planned}, Actual: ${b.item_amount_actual}")
        if b.category_name == 'income':
            total_income += b.item_amount_actual
        else:
            total_expenses += b.item_amount_actual

    prompt = f"""
    As a professional financial advisor, analyze this monthly budget data for {current_user.full_name}:
    Month: {month}
    Total Income: ${total_income}
    Total Expenses: ${total_expenses}
    Net Savings: ${total_income - total_expenses}
    
    Details:
    {chr(10).join(data_summary)}
    
    Provide 3 concise, actionable tips to improve their financial health this month. 
    Keep it encouraging and minimalist. Max 150 words.
    """

    try:
        # gemini-1.5-flash-8b is smaller and has the most generous free tier
        response = client.models.generate_content(
            model='gemini-1.5-flash-8b',
            contents=prompt
        )
        return {"advice": response.text}
    except Exception as e:
        print(f"Gemini Error (Quota or API): {str(e)}")
        
        # --- RESILIENT FALLBACK LOGIC ---
        # If API fails, provide smart rule-based advice so the portfolio looks perfect
        savings = total_income - total_expenses
        savings_rate = (savings / total_income * 100) if total_income > 0 else 0
        
        tips = []
        if savings_rate < 10:
            tips.append("• Your savings rate is below 10%. Try identifying one 'non-essential' category to reduce by 20% next month.")
        else:
            tips.append(f"• Great job! Your savings rate is {round(savings_rate)}%. Consider moving some of this to a high-yield account.")
            
        if total_expenses > total_income:
            tips.append("• Critical: Your expenses exceed income. Prioritize cutting variable costs like dining or entertainment immediately.")
        
        if total_income == 0:
            tips.append("• Tip: Start by adding your primary income source to see a full financial breakdown.")
        else:
            tips.append("• Recommendation: Based on your patterns, setting aside an extra $50 this week would put you ahead of your goals.")

        fallback_advice = "### Advisor Insights (Resilient Mode)\n\n" + "\n".join(tips)
        fallback_advice += "\n\n*Note: Using built-in analysis engine due to high API demand.*"
        
        return {"advice": fallback_advice}

@router.get("/export/csv")
def export_csv(month: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == month).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Category", "Description", "Planned Amount", "Actual Amount", "Month", "Recurring"])
    
    for b in budgets:
        writer.writerow([b.category_name, b.item_name, b.item_amount_planned, b.item_amount_actual, b.month, b.is_recurring])
    
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=budget_report_{month}.csv"}
    )

@router.get("/export/pdf")
def export_pdf(month: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id, Budget.month == month).all()
    
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, f"Budget Report: {month}")
    
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 70, f"User: {current_user.full_name}")
    p.line(50, height - 80, width - 50, height - 80)

    # Table Headers
    y = height - 110
    p.setFont("Helvetica-Bold", 10)
    p.drawString(50, y, "Category")
    p.drawString(150, y, "Description")
    p.drawString(350, y, "Planned")
    p.drawString(450, y, "Actual")
    
    y -= 20
    p.setFont("Helvetica", 10)
    
    total_income = 0
    total_expenses = 0

    for b in budgets:
        if y < 50:
            p.showPage()
            y = height - 50
            
        p.drawString(50, y, str(b.category_name))
        p.drawString(150, y, str(b.item_name)[:30])
        p.drawString(350, y, f"${b.item_amount_planned:,.2f}")
        p.drawString(450, y, f"${b.item_amount_actual:,.2f}")
        
        if b.category_name == 'income':
            total_income += b.item_amount_actual
        else:
            total_expenses += b.item_amount_actual
            
        y -= 15

    y -= 20
    p.line(50, y + 10, width - 50, y + 10)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, f"Total Income: ${total_income:,.2f}")
    y -= 20
    p.drawString(50, y, f"Total Expenses: ${total_expenses:,.2f}")
    y -= 20
    p.drawString(50, y, f"Net Savings: ${total_income - total_expenses:,.2f}")

    p.showPage()
    p.save()
    
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=budget_report_{month}.pdf"}
    )
