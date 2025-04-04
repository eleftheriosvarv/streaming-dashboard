from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import psycopg2
import os
import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 👇 Πρόσθεσε αυτά πριν από οποιοδήποτε endpoint
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend-dashboard-fyjc.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

# --- Database config ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "your-db-host"),
    "dbname": os.getenv("DB_NAME", "your-db-name"),
    "user": os.getenv("DB_USER", "your-db-user"),
    "password": os.getenv("DB_PASS", "your-db-password"),
    "port": os.getenv("DB_PORT", "5432")
}

# --- Models ---
class TravelUpdate(BaseModel):
    timestamp: datetime.datetime
    route_id: str
    aqi: int
    delay_ratio: float
    driving_travel_time: int
    transit_travel_time: int
    start_location: str
    end_location: str

class Averages(BaseModel):
    avg_aqi: float
    avg_delay_ratio: float
    avg_driving_time: float
    avg_transit_time: float

class StartPointData(BaseModel):
    start_latitude: float
    start_longitude: float
    start_location: str
    routes_data: List[Dict[str, Any]]

# --- DB utility ---
def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# --- API Routes ---
@app.get("/latest", response_model=TravelUpdate)
def get_latest_update():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT timestamp, route_id, aqi, delay_ratio, driving_travel_time, transit_travel_time, start_location, end_location
            FROM travel_updates
            ORDER BY timestamp DESC
            LIMIT 1;
        """)
        row = cur.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="No data found")

        return TravelUpdate(
            timestamp=row[0], route_id=row[1], aqi=row[2], delay_ratio=row[3],
            driving_travel_time=row[4], transit_travel_time=row[5],
            start_location=row[6], end_location=row[7]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/averages", response_model=Averages)
def get_averages():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                AVG(aqi), 
                AVG(delay_ratio), 
                AVG(driving_travel_time), 
                AVG(transit_travel_time)
            FROM travel_updates;
        """)
        row = cur.fetchone()
        conn.close()

        return Averages(
            avg_aqi=row[0],
            avg_delay_ratio=row[1],
            avg_driving_time=row[2],
            avg_transit_time=row[3]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/latest_per_start_point", response_model=List[StartPointData])
def get_latest_per_start_point():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Get unique start points
        cur.execute("""
            SELECT DISTINCT start_latitude, start_longitude, start_location
            FROM travel_updates;
        """)
        start_points = cur.fetchall()

        results = []

        for lat, lon, loc in start_points:
            cur.execute("""
                SELECT driving_travel_time, transit_travel_time, aqi
                FROM travel_updates
                WHERE start_latitude = %s AND start_longitude = %s
                ORDER BY timestamp DESC;
            """, (lat, lon))
            rows = cur.fetchall()

            routes_data = [
                {
                    "driving_travel_time": row[0],
                    "transit_travel_time": row[1],
                    "aqi": row[2]
                }
                for row in rows
            ]

            results.append({
                "start_latitude": lat,
                "start_longitude": lon,
                "start_location": loc,
                "routes_data": routes_data
            })

        conn.close()
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
