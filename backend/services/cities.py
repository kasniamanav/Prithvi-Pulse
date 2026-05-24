# services/cities.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import geonamescache

def load_indian_cities() -> dict:
    gc = geonamescache.GeonamesCache()
    cities = gc.get_cities()
    indian_cities = {}
    for city in cities.values():
        if city["countrycode"] == "IN":
            name = city["name"].lower()
            lat  = float(city["latitude"])
            lon  = float(city["longitude"])
            indian_cities[name] = (lat, lon)
    return indian_cities

# load once at startup
CITY_COORDS = load_indian_cities()

def get_city_list() -> list:
    return sorted(list(CITY_COORDS.keys()))

def get_city_coords(city: str):
    return CITY_COORDS.get(city.lower())

def city_exists(city: str) -> bool:
    return city.lower() in CITY_COORDS