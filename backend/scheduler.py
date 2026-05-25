# scheduler.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
import threading
from apscheduler.schedulers.background import BackgroundScheduler
from services.aqi_service        import get_aqi
from services.traffic_service    import get_traffic
from services.weather_service    import get_weather
from services.population_service import get_population
from services.noise_service      import get_noise
from csi.calculator              import calculate_csi
from database                    import save_city_score, create_tables

AUTO_REFRESH_CITIES = [
    "delhi", "mumbai", "bangalore", "chennai",
    "kolkata", "hyderabad", "pune", "ahmedabad",
    "jaipur", "lucknow", "kanpur", "nagpur",
    "indore", "bhopal", "patna", "surat",
    "agra", "varanasi", "chandigarh", "kochi",
]

async def refresh_city(city: str):
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
        print(f"✅ {city.title()} — CSI: {result['csi']} ({result['level']})")
    except Exception as e:
        print(f"❌ Failed to refresh {city}: {e}")

async def refresh_all_async():
    print("🔄 Refreshing all cities...")
    await asyncio.gather(*[refresh_city(c) for c in AUTO_REFRESH_CITIES])
    print("✅ All cities refreshed.")

def refresh_all_cities():
    # run in separate thread with its own event loop
    def run():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(refresh_all_async())
        loop.close()
    thread = threading.Thread(target=run)
    thread.start()
    thread.join()

def start_scheduler():
    create_tables()
    refresh_all_cities()
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        refresh_all_cities,
        "interval",
        hours=1,
        id="city_refresh"
    )
    scheduler.start()
    print("⏰ Scheduler started — cities refresh every hour.")
    return scheduler