# services/traffic_service.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
from dotenv import load_dotenv
from datetime import datetime
from services.cities import CITY_COORDS

load_dotenv()

TOMTOM_KEY = os.getenv("TOMTOM_KEY")

def get_time_based_estimate() -> float:
    hour = datetime.now().hour
    if 8 <= hour <= 10:
        return 72.0
    elif 17 <= hour <= 20:
        return 78.0
    elif 11 <= hour <= 16:
        return 45.0
    elif 23 <= hour or hour <= 5:
        return 15.0
    else:
        return 30.0

async def fetch_single_point(client, lat: float, lon: float) -> float:
    try:
        url = (
            f"https://api.tomtom.com/traffic/services/4/"
            f"flowSegmentData/absolute/10/json"
            f"?point={lat},{lon}&key={TOMTOM_KEY}"
        )
        response = await client.get(url, timeout=10)
        data = response.json()

        if "flowSegmentData" not in data:
            return 0.0

        flow           = data["flowSegmentData"]
        current_speed  = flow["currentSpeed"]
        freeflow_speed = flow["freeFlowSpeed"]

        if freeflow_speed == 0:
            return 0.0

        congestion = ((freeflow_speed - current_speed) / freeflow_speed) * 100
        return round(min(max(congestion, 0), 100), 2)

    except:
        return 0.0

async def get_traffic(city: str) -> float:
    try:
        city   = city.lower()
        coords = CITY_COORDS.get(city)
        if not coords:
            return get_time_based_estimate()

        lat, lon = coords

        sample_points = [
            (lat,         lon        ),
            (lat + 0.018, lon + 0.018),
            (lat - 0.018, lon - 0.018),
        ]

        async with httpx.AsyncClient() as client:
            scores = []
            for slat, slon in sample_points:
                score = await fetch_single_point(client, slat, slon)
                scores.append(score)

        valid_scores = [s for s in scores if s > 0]

        if not valid_scores:
            return get_time_based_estimate()

        return round(sum(valid_scores) / len(valid_scores), 2)

    except Exception as e:
        print(f"Traffic fetch failed for {city}: {e}")
        return get_time_based_estimate()