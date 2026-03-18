from fastapi import FastAPI
from app.core.database import Base, engine
from app import models
from app.api.routes import auth
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/transactions")
def get_transactions():
    return {"transactions": "This is where transactions will be returned"}