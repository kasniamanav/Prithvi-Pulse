# routes/city.py
import sys
import os

# fix import path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from fastapi import APIRouter
import asyncio
from services.aqi_service        import get_aqi
from services.traffic_service    import get_traffic
from services.weather_service    import get_weather
from services.population_service import get_population
from services.noise_service      import get_noise
from services.cities             import get_city_list, city_exists
from csi.calculator              import calculate_csi

router = APIRouter()

@router.get("/api/cities")
def all_cities():
    cities = get_city_list()
    return {
        "total":  len(cities),
        "cities": cities
    }

@router.get("/api/city/{city_name}")
async def get_city_stress(city_name: str):
    city = city_name.lower()

    if not city_exists(city):
        return {
            "error": f"City '{city_name}' not found.",
            "tip":   "Try /api/cities to see all supported cities"
        }

    aqi, traffic, weather = await asyncio.gather(
        get_aqi(city),
        get_traffic(city),
        get_weather(city),
    )

    population = get_population(city)
    noise      = get_noise(city)
    result     = calculate_csi(aqi, traffic, weather, population, noise)

    return {
        "city":    city_name.title(),
        "country": "India",
        **result
    }

@router.get("/api/compare")
async def compare_cities(cities: str):
    city_list = [c.strip().lower() for c in cities.split(",")]
    results   = []

    for city in city_list:
        if not city_exists(city):
            results.append({"city": city, "error": "Not found"})
            continue

        aqi, traffic, weather = await asyncio.gather(
            get_aqi(city),
            get_traffic(city),
            get_weather(city),
        )

        population = get_population(city)
        noise      = get_noise(city)
        result     = calculate_csi(aqi, traffic, weather, population, noise)

        results.append({"city": city.title(), **result})

    results.sort(key=lambda x: x.get("csi", 0), reverse=True)
    return {"total": len(results), "results": results}