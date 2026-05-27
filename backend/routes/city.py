# routes/city.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter
import asyncio
import datetime
from services.aqi_service        import get_aqi
from services.traffic_service    import get_traffic
from services.weather_service    import get_weather
from services.population_service import get_population
from services.noise_service      import get_noise
from services.cities             import get_city_list, city_exists, CITY_COORDS
from csi.calculator              import calculate_csi
from database                    import get_city_history, get_latest_all_cities, save_city_score

router = APIRouter()

PRIORITY_CITIES = [
    # Metro
    "delhi", "mumbai", "bangalore", "chennai",
    "kolkata", "hyderabad",
    # Tier 1
    "pune", "ahmedabad", "surat", "jaipur",
    "lucknow", "kanpur", "nagpur", "indore",
    "bhopal", "patna", "ludhiana", "agra",
    "varanasi", "meerut", "amritsar", "chandigarh",
    "rajkot", "vadodara", "nashik", "aurangabad",
    "faridabad", "ghaziabad", "noida", "gurgaon",
    # Tier 2 South
    "coimbatore", "madurai", "visakhapatnam",
    "vijayawada", "kochi", "thiruvananthapuram",
    "kozhikode", "mysuru", "hubli", "mangalore",
    "tiruchirappalli", "salem", "tirupati",
    # Tier 2 East
    "bhubaneswar", "guwahati", "ranchi", "raipur",
    # Tier 2 West
    "jodhpur", "udaipur", "kota", "jabalpur", "gwalior",
    # Others
    "shimla", "dehradun", "srinagar", "jammu",
    "pondicherry", "panaji",
]

async def fetch_city_data(city: str) -> dict | None:
    try:
        aqi, traffic, weather = await asyncio.gather(
            get_aqi(city),
            get_traffic(city),
            get_weather(city),
        )
        population = get_population(city)
        noise      = get_noise(city)
        result     = calculate_csi(aqi, traffic, weather, population, noise)
        save_city_score(city, result)
        return {
            "city":      city,
            "csi":       result["csi"],
            "level":     result["level"],
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        print(f"Failed to fetch {city}: {e}")
        return None

@router.get("/api/cities")
def all_cities():
    cities = get_city_list()
    return {
        "total":  len(cities),
        "cities": cities
    }

@router.get("/api/cities/coords")
def all_city_coords():
    cities = [
        {"name": name, "lat": lat, "lon": lon}
        for name, (lat, lon) in CITY_COORDS.items()
    ]
    return {
        "total":  len(cities),
        "cities": cities
    }

@router.get("/api/dashboard")
async def dashboard():
    # get saved data from DB
    data = get_latest_all_cities()
    saved_names = [d["city"].lower() for d in data]

    # fetch missing priority cities live
    missing = [c for c in PRIORITY_CITIES if c not in saved_names]

    if missing:
        print(f"Fetching {len(missing)} missing cities...")
        results = await asyncio.gather(
            *[fetch_city_data(c) for c in missing[:15]]
        )
        for r in results:
            if r:
                data.append(r)

    if not data:
        return {"message": "No data yet", "cities": []}

    # sort by CSI highest first
    data.sort(key=lambda x: x.get("csi", 0), reverse=True)

    return {
        "total":  len(data),
        "cities": data
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

@router.get("/api/city/{city_name}/history")
def city_history(city_name: str, limit: int = 24):
    history = get_city_history(city_name.lower(), limit)
    return {
        "city":    city_name.title(),
        "count":   len(history),
        "history": history
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

    # save to DB
    save_city_score(city, result)

    return {
        "city":    city_name.title(),
        "country": "India",
        **result
    }