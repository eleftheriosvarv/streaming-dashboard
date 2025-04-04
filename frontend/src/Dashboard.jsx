import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Label
} from "recharts";

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [dayType, setDayType] = useState("weekday");
  const [selectedMetric, setSelectedMetric] = useState("avg_driving_travel_time");

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then((res) => res.json())
      .then((data) => setHourlyData(data))
      .catch((err) => console.error("Failed to fetch hourly averages", err));

    fetch("https://backend-dashboard-26rc.onrender.com/latest")
      .then((res) => res.json())
      .then((data) => setLatestData(data))
      .catch((err) => console.error("Failed to fetch latest data", err));
  }, []);

  const uniqueRoutes = Array.from(
    new Set(hourlyData.map((d) => d.route_id))
  ).map((routeId) => {
    const match = latestData.find((d) => d.route_id === routeId);
    const label = match
      ? `Route ${routeId}: ${match.start_location} - ${match.end_location}`
      : `Route ${routeId}`;
    return { route_id: routeId, label };
  });

  const filteredData = hourlyData.filter(
    (d) => d.route_id === Number(selectedRoute) && d.day_type === dayType
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Travel Dashboard</h2>

      <div className="mb-4">
        <label className="mr-2">Select Route:</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          <option value="">Select a route</option>
          {uniqueRoutes.map((r) => (
            <option key={r.route_id} value={r.route_id}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="mx-2">Day Type:</label>
        <select
          value={dayType}
          onChange={(e) => setDayType(e.target.value)}
        >
          <option value="weekday">Weekday</option>
          <option value="weekend">Weekend</option>
        </select>

        <label className="mx-2">Metric:</label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          <option value="avg_driving_travel_time">Driving Time</option>
          <option value="avg_transit_travel_time">Transit Time</option>
          <option value="avg_travel_time_difference">Time Difference</option>
          <option value="avg_delay_ratio">Delay Ratio</option>
          <option value="avg_aqi">AQI</option>
        </select>
      </div>

      {selectedRoute && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey={selectedMetric}
              name={selectedMetric.replace("avg_", "").replaceAll("_", " ")}
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">
          Correlation between Transit Delay and Air Quality Index
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey="avg_delay_ratio"
              name="Delay Ratio"
              label={{
                value: "Avg Delay Ratio",
                position: "insideBottom",
                offset: -5
              }}
            />
            <YAxis
              type="number"
              dataKey="avg_aqi"
              name="AQI"
              label={{
                value: "Avg AQI",
                angle: -90,
                position: "insideLeft"
              }}
            />
            <ZAxis type="number" dataKey="route_id" name="Route" range={[100, 300]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Points" data={hourlyData} fill="#82ca9d" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

