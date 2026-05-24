# run.py
import sys
import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

# verify everything is found correctly
print(f"Backend dir: {BACKEND_DIR}")
print(f"services found: {os.path.exists(os.path.join(BACKEND_DIR, 'services'))}")
print(f"aqi_service found: {os.path.exists(os.path.join(BACKEND_DIR, 'services', 'aqi_service.py'))}")

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False  # disabled to fix Windows path issue
    )