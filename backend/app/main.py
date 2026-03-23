from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.core.database import Base, engine
from app import models
from app.api.routes import auth, budgets, monthly_goals, analytics
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)
app = FastAPI()

# Mount the uploads directory to serve profile pictures
# Create directory if it doesn't exist to avoid startup error
import os
os.makedirs("uploads/profile_pics", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    # Convert bytes to string for JSON serialization
    body = exc.body
    if isinstance(body, bytes):
        body = body.decode("utf-8", errors="replace")
    
    print(f"Validation error: {errors}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": errors, 
            "body": body,
            "message": f"Validation failed for {errors[0]['loc'][-1]}: {errors[0]['msg']}" if errors else "Validation failed"
        },
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your specific Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
app.include_router(monthly_goals.router, prefix="/monthly-goals", tags=["monthly-goals"])
app.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/transactions")
def get_transactions():
    return {"transactions": "This is where transactions will be returned"}