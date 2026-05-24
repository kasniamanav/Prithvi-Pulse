# services/noise_service.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import geonamescache

def load_noise_scores() -> dict:
    """
    Generate noise proxy scores for ALL Indian cities
    based on population size.
    Larger city = more noise.
    """
    gc = geonamescache.GeonamesCache()
    cities = gc.get_cities()
    noise_data = {}

    for city in cities.values():
        if city["countrycode"] == "IN":
            name = city["name"].lower()
            pop  = int(city.get("population", 100000))

            # scale noise based on population
            if pop >= 5000000:       # 5M+ mega city
                noise = 85.0
            elif pop >= 2000000:     # 2M+ large city
                noise = 75.0
            elif pop >= 1000000:     # 1M+ big city
                noise = 65.0
            elif pop >= 500000:      # 500K+ medium city
                noise = 55.0
            elif pop >= 100000:      # 100K+ small city
                noise = 45.0
            else:                   # town
                noise = 30.0

            noise_data[name] = noise

    return noise_data

CITY_NOISE = load_noise_scores()

def get_noise(city: str) -> float:
    try:
        return CITY_NOISE.get(city.lower(), 45.0)
    except Exception as e:
        print(f"Noise score failed for {city}: {e}")
        return 45.0