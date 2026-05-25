# services/weather_service.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
from dotenv import load_dotenv
from services.cities import CITY_COORDS

load_dotenv()

OWM_KEY = os.getenv("OWM_KEY")

def normalize_heat(temp: float) -> float:
    if temp <= 20: return 0.0
    if temp >= 45: return 100.0
    return round(((temp - 20) / 25) * 100, 2)

def normalize_humidity(humidity: float) -> float:
    if humidity <= 40: return 0.0
    if humidity >= 90: return 100.0
    return round(((humidity - 40) / 50) * 100, 2)

def normalize_uv(uv: float) -> float:
    return round(min((uv / 11) * 100, 100), 2)

async def get_weather(city: str) -> float:
    try:
        coords = CITY_COORDS.get(city.lower())
        if not coords:
            return 50.0

        lat, lon = coords

        # use 2.5 API — no subscription needed
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?lat={lat}&lon={lon}&appid={OWM_KEY}&units=metric"
        )

        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            data = response.json()

        if "main" not in data:
            print(f"Weather error for {city}: {data}")
            return 50.0

        temp     = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        uv       = 0.0  # not in 2.5 API

        heat_score     = normalize_heat(temp)
        humidity_score = normalize_humidity(humidity)
        uv_score       = normalize_uv(uv)

        wsi = (0.40 * heat_score +
               0.35 * humidity_score +
               0.25 * uv_score)

        return round(wsi, 2)

    except Exception as e:
        print(f"Weather fetch failed for {city}: {e}")
        return 50.0