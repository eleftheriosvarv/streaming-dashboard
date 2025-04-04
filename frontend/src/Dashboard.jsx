import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
  ReferenceLine,
  Line
} from "recharts";

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedDayType, setSelectedDayType] = useState("weekday");
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

  const getRouteLabel = (routeId) => {
    const route = latestData.find((r) => r.route_id === parseInt(routeId));
    return route ? `Route ${routeId}: ${route.start_location} - ${route.end_location}` : `Route ${routeId}`;
  };

  const routeOptions = Array.from(new Set(hourlyData.map((d) => d.route_id))).map((id) => (
    <option key={id} value={id}>
      {getRouteLabel(id)}
    </option>
  ));

  const metricOptions = [
    { key: "avg_driving_travel_time", label: "Driving Time" },
    { key: "avg_transit_travel_time", label: "Transit Time" },
    { key: "avg_travel_time_difference", label: "Time Difference" },
    { key: "avg_delay_ratio", label: "Delay Ratio" },
    { key: "avg_aqi", label: "AQI" }
  ];

  const filteredData = hourlyData.filter(
    (d) => d.route_id === parseInt(selectedRoute) && d.day_type === selectedDayType
  );

  const avgLine = (key) => {
    if (!filteredData.length) return 0;
    const sum = filteredData.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return +(sum / filteredData.length).toFixed(2);
  };

  const regressionLine = useMemo(() => {
    if (!hourlyData.length) return null;
    const x = hourlyData.map(d => d.avg_delay_ratio);
    const y = hourlyData.map(d => d.avg_aqi);
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const meanX = sumX / n;
    const meanY = sumY / n;
    const rNumerator = x.reduce((acc, val, i) => acc + (val - meanX) * (y[i] - meanY), 0);
    const rDenominator = Math.sqrt(
      x.reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0) *
      y.reduce((acc, val) => acc + Math.pow(val - meanY, 2), 0)
    );
    const r = rDenominator ? rNumerator / rDenominator : 0;
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    return {
      points: [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept }
      ],
      r: r.toFixed(2)
    };
  }, [hourlyData]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Travel Dashboard</h2>

      <div className="flex gap-4 mb-6">
        <label>
          Select Route:
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="">Select a route</option>
            {routeOptions}
          </select>
        </label>

        <label>
          Day Type:
          <select
            value={selectedDayType}
            onChange={(e) => setSelectedDayType(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            <option value="weekday">Weekday</option>
            <option value="weekend">Weekend</option>
          </select>
        </label>

        <label>
          Metric:
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="ml-2 border rounded p-1"
          >
            {metricOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedRoute && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMetric} fill="#8884d8" />
            <ReferenceLine y={avgLine(selectedMetric)} stroke="red" strokeDasharray="3 3" />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-16">
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
              label={{ value: "Avg Delay Ratio", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="avg_aqi"
              name="AQI"
              label={{ value: "Avg AQI", angle: -90, position: "insideLeft" }}
            />
            <ZAxis type="number" dataKey="route_id" name="Route" range={[100, 300]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Points" data={hourlyData} fill="#82ca9d" />
            {regressionLine && (
              <Line
                data={regressionLine.points}
                type="linear"
                dataKey="y"
                dot={false}
                stroke="#ff7300"
                strokeWidth={2}
                legendType="line"
                name={`Linear Fit (r = ${regressionLine.r})`}
              />
            )}
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
