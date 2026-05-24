# csi/calculator.py

WEIGHTS = {
    "aqi":        0.30,
    "traffic":    0.25,
    "weather":    0.20,
    "population": 0.15,
    "noise":      0.10,
}

STRESS_LEVELS = [
    (0,  20,  "Low",       "🟢"),
    (20, 40,  "Moderate",  "🟡"),
    (40, 60,  "High",      "🟠"),
    (60, 80,  "Very High", "🔴"),
    (80, 100, "Extreme",   "🔴🔴"),
]

def calculate_csi(
    aqi:        float,
    traffic:    float,
    weather:    float,
    population: float,
    noise:      float
) -> dict:

    csi = (WEIGHTS["aqi"]        * aqi +
           WEIGHTS["traffic"]    * traffic +
           WEIGHTS["weather"]    * weather +
           WEIGHTS["population"] * population +
           WEIGHTS["noise"]      * noise)

    csi = round(csi, 2)

    # determine stress level
    level, emoji = "Unknown", ""
    for low, high, label, icon in STRESS_LEVELS:
        if low <= csi <= high:
            level, emoji = label, icon
            break

    return {
        "csi":   csi,
        "level": level,
        "emoji": emoji,
        "breakdown": {
            "aqi":        round(aqi, 2),
            "traffic":    round(traffic, 2),
            "weather":    round(weather, 2),
            "population": round(population, 2),
            "noise":      round(noise, 2),
        },
        "weights": WEIGHTS,
    }