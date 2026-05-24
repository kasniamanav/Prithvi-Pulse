# services/population_service.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import geonamescache

def load_population_data() -> dict:
    gc = geonamescache.GeonamesCache()
    cities = gc.get_cities()
    population_data = {}
    for city in cities.values():
        if city["countrycode"] == "IN":
            name = city["name"].lower()
            pop  = int(city.get("population", 100000))
            population_data[name] = pop
    return population_data

CITY_POPULATION = load_population_data()

def get_population(city: str) -> float:
    try:
        pop = CITY_POPULATION.get(city.lower(), 100000)

        # normalize: 10000 = 0 stress, 20000000 = 100 stress
        normalized = ((pop - 10000) / (20000000 - 10000)) * 100
        return round(min(max(normalized, 0), 100), 2)

    except Exception as e:
        print(f"Population score failed for {city}: {e}")
        return 50.0