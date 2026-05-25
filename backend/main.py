# main.py
import sys
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import importlib.util
import traceback

app = FastAPI(title="Prithvi Pulse API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_module(name: str, filepath: str):
    spec   = importlib.util.spec_from_file_location(name, filepath)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting Prithvi Pulse...")
    try:
        scheduler_module = load_module(
            "scheduler",
            os.path.join(BASE_DIR, "scheduler.py")
        )
        scheduler_module.start_scheduler()
        print("✅ Scheduler started — cities refresh every hour")
    except Exception as e:
        print(f"❌ Scheduler failed: {e}")
        traceback.print_exc()

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Prithvi Pulse shutting down...")

from routes.city import router
app.include_router(router)

@app.get("/")
def root():
    return {
        "message": "Prithvi Pulse API is running 🌍",
        "version": "1.0",
        "endpoints": {
            "all_cities":    "/api/cities",
            "city_stress":   "/api/city/{city_name}",
            "city_history":  "/api/city/{city_name}/history",
            "compare":       "/api/compare?cities=delhi,mumbai",
            "dashboard":     "/api/dashboard",
            "docs":          "/docs"
        }
    }