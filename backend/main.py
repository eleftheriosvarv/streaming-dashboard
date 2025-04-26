from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
import psycopg2.extras
import os
import datetime
import pandas as pd

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://frontend-dashboard-fyjc.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB config ---
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "your-host"),
    "dbname": os.getenv("DB_NAME", "your-db"),
    "user": os.getenv("DB_USER", "your-user"),
    "password": os.getenv("DB_PASS", "your-pass"),
    "port": os.getenv("DB_PORT", "5432")
}

def get_db_connection():
    return psycopg2.connect(cursor_factory=psycopg2.extras.DictCursor, **DB_CONFIG)

# --- Models ---
class TravelUpdate(BaseModel):
    route_id: int
    timestamp: datetime.datetime
    start_location: str
    end_location: str
    start_latitude: float
    start_longitude: float
    driving_travel_time: float
    transit_travel_time: float
    travel_time_difference: float
    delay_ratio: float
    aqi: float

class HourlyAverage(BaseModel):
    route_id: int
    day_type: str
    hour: int
    avg_driving_travel_time: float
    avg_transit_travel_time: float
    avg_travel_time_difference: float
    avg_delay_ratio: float
    avg_aqi: float

# --- Endpoints ---
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
            TravelUpdate(**row)
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
                ROUND(AVG(driving_travel_time)::numeric, 2) AS avg_driving_travel_time,
                ROUND(AVG(transit_travel_time)::numeric, 2) AS avg_transit_travel_time,
                ROUND(AVG(travel_time_difference)::numeric, 2) AS avg_travel_time_difference,
                ROUND(AVG(delay_ratio)::numeric, 2) AS avg_delay_ratio,
                ROUND(AVG(aqi)::numeric, 2) AS avg_aqi
            FROM travel_updates
            GROUP BY route_id, day_type, hour
            ORDER BY route_id, day_type, hour;
        """)
        rows = cur.fetchall()
        conn.close()

        return [HourlyAverage(**row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/start_locations")
def get_start_locations():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT start_location
            FROM travel_updates
            WHERE start_location IS NOT NULL
            ORDER BY start_location;
        """)
        rows = cur.fetchall()
        conn.close()
        start_locations = [row["start_location"] for row in rows]
        return {"start_locations": start_locations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/correlation_data")
def get_correlation_data(start_location: str, type: str):
    try:
        conn = get_db_connection()
        df = pd.read_sql("SELECT delay_ratio, aqi, timestamp FROM travel_updates WHERE start_location = %s ORDER BY timestamp", conn, params=(start_location,))
        conn.close()

        df['timestamp'] = pd.to_datetime(df['timestamp'])
        matched = []

        if type == "same_minute":
            df['rounded'] = df['timestamp'].dt.floor('min')
            merged = pd.merge(df[['rounded', 'delay_ratio']], df[['rounded', 'aqi']], on='rounded')
            matched = merged[['delay_ratio', 'aqi']].dropna().to_dict(orient='records')

        elif type in ["plus_one_hour", "plus_two_hours"]:
            offset = 60 if type == "plus_one_hour" else 120
            for idx, row in df.iterrows():
                target_min = row['timestamp'] + pd.Timedelta(minutes=offset-20)
                target_max = row['timestamp'] + pd.Timedelta(minutes=offset+20)
                potential = df[(df['timestamp'] >= target_min) & (df['timestamp'] <= target_max)]
                if not potential.empty:
                    matched.append({"delay_ratio": row['delay_ratio'], "aqi": potential.iloc[0]['aqi']})

        return {"delay_ratio": [m["delay_ratio"] for m in matched], "aqi": [m["aqi"] for m in matched]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


