from fastapi import FastAPI
from app.core.database import Base, engine
from app.models import *
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000" , "http://localhost:3000/transactions"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/transactions")
def get_transactions():
    return {"transactions": "This is where transactions will be returned"}