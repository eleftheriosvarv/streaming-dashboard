import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [dayFilter, setDayFilter] = useState("weekday");

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then(res => res.json())
      .then(data => {
        console.log("✅ hourlyData loaded:", data);
        setHourlyData(data);
      })
      .catch(err => console.error("❌ Failed to fetch hourly averages", err));
  }, []);

  if (!hourlyData || hourlyData.length === 0) {
    return <div className="p-4 text-lg">⏳ Loading data from backend...</div>;
  }

  // Ομαδοποίηση ανά route_id + day_type
  const grouped = {};
  hourlyData.forEach(item => {
    if (item.day_type !== dayFilter) return;
    const key = `${item.route_id}-${item.day_type}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Hourly Averages per Route (Weekday vs Weekend)</h2>

      <div className="mb-6">
        <label htmlFor="day-type-select" className="mr-2 font-medium">Select Day Type:</label>
        <select
          id="day-type-select"
          className="border rounded px-2 py-1"
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
        >
          <option value="weekday">Weekday</option>
          <option value="weekend">Weekend</option>
        </select>
      </div>

      {Object.entries(grouped).map(([key, data]) => (
        <div key={key} className="mb-12 border p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Route {key.replace('-', ' - ')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avg_driving_travel_time" stroke="#1f77b4" name="Driving Time" />
              <Line type="monotone" dataKey="avg_transit_travel_time" stroke="#ff7f0e" name="Transit Time" />
              <Line type="monotone" dataKey="avg_travel_time_difference" stroke="#2ca02c" name="Time Diff" />
              <Line type="monotone" dataKey="avg_delay_ratio" stroke="#d62728" name="Delay Ratio" />
              <Line type="monotone" dataKey="avg_aqi" stroke="#9467bd" name="AQI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}

      <div className="mt-16">
        <h2 className="text-xl font-bold mb-4">Scatter Plot: Delay Ratio vs AQI</h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="avg_delay_ratio"
              name="Delay Ratio"
              label={{ value: "Avg Delay Ratio", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="avg_aqi"
              name="AQI"
              label={{ value: "Avg AQI", angle: -90, position: "insideLeft" }}
            />
            <ZAxis type="number" dataKey="route_id" name="Route" range={[100, 300]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Points" data={hourlyData.filter(d => d.day_type === dayFilter)} fill="#82ca9d" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


