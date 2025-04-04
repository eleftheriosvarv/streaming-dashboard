from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import os
import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend-dashboard-fyjc.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database config
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "your-host"),
    "dbname": os.getenv("DB_NAME", "your-db"),
    "user": os.getenv("DB_USER", "your-user"),
    "password": os.getenv("DB_PASS", "your-pass"),
    "port": os.getenv("DB_PORT", "5432")
}

def get_db_connection():
    return psycopg2.connect(cursor_factory=psycopg2.extras.DictCursor, **DB_CONFIG)

# --------- MODELS ---------

class TravelUpdate(BaseModel):
    route_id: int
    timestamp: datetime.datetime
    start_location: str
    end_location: str
    start_latitude: float
    start_longitude: float
    driving_travel_time: int
    transit_travel_time: int
    travel_time_difference: int
    delay_ratio: float
    aqi: int

class HourlyAverage(BaseModel):
    route_id: int
    day_type: str
    hour: int
    avg_driving_travel_time: float
    avg_transit_travel_time: float
    avg_travel_time_difference: float
    avg_delay_ratio: float
    avg_aqi: float

# --------- ROUTES ---------

@app.get("/latest", response_model=List[TravelUpdate])
def get_latest_updates():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT ON (route_id) *
            FROM travel_updates
            ORDER BY route_id, timestamp DESC;
        """)
        rows = cur.fetchall()
        conn.close()

        return [
            TravelUpdate(
                route_id=row["route_id"],
                timestamp=row["timestamp"],
                start_location=row["start_location"],
                end_location=row["end_location"],
                start_latitude=round(row["start_latitude"], 2),
                start_longitude=round(row["start_longitude"], 2),
                driving_travel_time=row["driving_travel_time"],
                transit_travel_time=row["transit_travel_time"],
                travel_time_difference=row["travel_time_difference"],
                delay_ratio=round(row["delay_ratio"], 2),
                aqi=row["aqi"]
            )
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/hourly_averages", response_model=List[HourlyAverage])
def get_hourly_averages():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                route_id,
                CASE 
                    WHEN EXTRACT(DOW FROM timestamp) IN (0, 6) THEN 'weekend'
                    ELSE 'weekday'
                END AS day_type,
                EXTRACT(HOUR FROM timestamp) AS hour,
                ROUND(AVG(driving_travel_time), 2) AS avg_driving_travel_time,
                ROUND(AVG(transit_travel_time), 2) AS avg_transit_travel_time,
                ROUND(AVG(travel_time_difference), 2) AS avg_travel_time_difference,
                ROUND(AVG(delay_ratio), 2) AS avg_delay_ratio,
                ROUND(AVG(aqi), 2) AS avg_aqi
            FROM travel_updates
            GROUP BY route_id, day_type, hour
            ORDER BY route_id, day_type, hour;
        """)
        rows = cur.fetchall()
        conn.close()

        return [
            HourlyAverage(
                route_id=row["route_id"],
                day_type=row["day_type"],
                hour=int(row["hour"]),
                avg_driving_travel_time=row["avg_driving_travel_time"],
                avg_transit_travel_time=row["avg_transit_travel_time"],
                avg_travel_time_difference=row["avg_travel_time_difference"],
                avg_delay_ratio=row["avg_delay_ratio"],
                avg_aqi=row["avg_aqi"]
            )
            for row in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

