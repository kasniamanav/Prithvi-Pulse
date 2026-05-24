# main.py
import sys
import os

# permanently fix all imports
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Prithvi Pulse API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# import router AFTER sys.path fix
from routes.city import router
app.include_router(router)

@app.get("/")
def root():
    return {"message": "Prithvi Pulse API is running 🌍"}