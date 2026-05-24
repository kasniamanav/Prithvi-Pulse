# csi/normalizer.py

def normalize(value: float, min_val: float, max_val: float) -> float:
    """
    Generic min-max normalizer.
    Converts any value to 0-100 scale.
    """
    if max_val == min_val:
        return 0.0
    normalized = ((value - min_val) / (max_val - min_val)) * 100
    return round(min(max(normalized, 0), 100), 2)