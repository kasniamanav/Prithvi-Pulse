# services/aqi_service.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
from dotenv import load_dotenv

load_dotenv()

WAQI_KEY = os.getenv("WAQI_KEY")

async def get_aqi(city: str) -> float:
    try:
        url = f"https://api.waqi.info/feed/{city}/?token={WAQI_KEY}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            data = response.json()

        if data["status"] != "ok":
            print(f"AQI error for {city}: {data}")
            return 50.0

        raw_aqi = data["data"]["aqi"]
        normalized = min((raw_aqi / 500) * 100, 100)
        return round(normalized, 2)

    except Exception as e:
        print(f"AQI fetch failed for {city}: {e}")
        return 50.0