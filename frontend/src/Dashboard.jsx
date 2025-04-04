import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [dayFilter, setDayFilter] = useState("weekday");
  const [metric, setMetric] = useState("avg_driving_travel_time");

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then(res => res.json())
      .then(data => {
        console.log("✅ hourlyData loaded:", data);
        setHourlyData(data);
      })
      .catch(err => console.error("❌ Failed to fetch hourly averages", err));
  }, []);

  const uniqueRoutes = Array.from(
    new Map(
      hourlyData.map(item => [item.route_id, item])
    ).values()
  );

  const filteredData = hourlyData.filter(
    d => d.route_id === selectedRoute && d.day_type === dayFilter
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Travel Dashboard</h2>

      {/* Route Selection */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Select Route:</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedRoute || ""}
          onChange={(e) => setSelectedRoute(parseInt(e.target.value))}
        >
          <option value="" disabled>Select a route</option>
          {uniqueRoutes.map(route => (
            <option key={route.route_id} value={route.route_id}>
              Route {route.route_id}: {route.start_location} → {route.end_location}
            </option>
          ))}
        </select>
      </div>

      {/* Day Filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Day Type:</label>
        <select
          className="border rounded px-2 py-1"
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
        >
          <option value="weekday">Weekday</option>
          <option value="weekend">Weekend</option>
        </select>
      </div>

      {/* Metric Selection */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Metric:</label>
        <select
          className="border rounded px-2 py-1"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          <option value="avg_driving_travel_time">Driving Time</option>
          <option value="avg_transit_travel_time">Transit Time</option>
          <option value="avg_travel_time_difference">Travel Time Difference</option>
          <option value="avg_delay_ratio">Delay Ratio</option>
          <option value="avg_aqi">AQI</option>
        </select>
      </div>

      {/* Bar Chart */}
      {selectedRoute && filteredData.length > 0 && (
        <div className="mb-12 border p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Route {selectedRoute} – {dayFilter} – {metric.replaceAll('_', ' ')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={metric} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scatter Plot – All routes */}
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
            <Scatter
              name="Points"
              data={hourlyData.filter(d => d.day_type === dayFilter)}
              fill="#82ca9d"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

    </div>
  );
}


