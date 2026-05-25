# database.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, Column, Float, String, DateTime, Integer
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine       = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base         = declarative_base()

class CityStressRecord(Base):
    __tablename__ = "city_stress"

    id         = Column(Integer,  primary_key=True, index=True)
    city       = Column(String,   index=True)
    csi        = Column(Float)
    aqi        = Column(Float)
    traffic    = Column(Float)
    weather    = Column(Float)
    population = Column(Float)
    noise      = Column(Float)
    level      = Column(String)
    timestamp  = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created.")

def save_city_score(city: str, result: dict):
    db = SessionLocal()
    try:
        record = CityStressRecord(
            city       = city,
            csi        = result["csi"],
            aqi        = result["breakdown"]["aqi"],
            traffic    = result["breakdown"]["traffic"],
            weather    = result["breakdown"]["weather"],
            population = result["breakdown"]["population"],
            noise      = result["breakdown"]["noise"],
            level      = result["level"],
            timestamp  = datetime.utcnow()
        )
        db.add(record)
        db.commit()
    except Exception as e:
        print(f"DB save failed for {city}: {e}")
        db.rollback()
    finally:
        db.close()

def get_city_history(city: str, limit: int = 24) -> list:
    db = SessionLocal()
    try:
        records = (
            db.query(CityStressRecord)
            .filter(CityStressRecord.city == city)
            .order_by(CityStressRecord.timestamp.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "csi":        r.csi,
                "aqi":        r.aqi,
                "traffic":    r.traffic,
                "weather":    r.weather,
                "population": r.population,
                "noise":      r.noise,
                "level":      r.level,
                "timestamp":  r.timestamp.isoformat(),
            }
            for r in records
        ]
    except Exception as e:
        print(f"DB fetch failed for {city}: {e}")
        return []
    finally:
        db.close()

def get_latest_all_cities() -> list:
    db = SessionLocal()
    try:
        from sqlalchemy import func
        subquery = (
            db.query(
                CityStressRecord.city,
                func.max(CityStressRecord.timestamp).label("max_ts")
            )
            .group_by(CityStressRecord.city)
            .subquery()
        )
        records = (
            db.query(CityStressRecord)
            .join(
                subquery,
                (CityStressRecord.city      == subquery.c.city) &
                (CityStressRecord.timestamp == subquery.c.max_ts)
            )
            .all()
        )
        return [
            {
                "city":      r.city,
                "csi":       r.csi,
                "level":     r.level,
                "timestamp": r.timestamp.isoformat(),
            }
            for r in records
        ]
    except Exception as e:
        print(f"DB fetch all failed: {e}")
        return []
    finally:
        db.close()