import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDayType, setSelectedDayType] = useState('weekday');
  const [selectedMetric, setSelectedMetric] = useState('avg_driving_travel_time');

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then(res => res.json())
      .then(data => setHourlyData(data))
      .catch(err => console.error("Failed to fetch hourly averages", err));

    fetch("https://backend-dashboard-26rc.onrender.com/latest")
      .then(res => res.json())
      .then(data => setLatestData(data))
      .catch(err => console.error("Failed to fetch latest data", err));
  }, []);

  const groupedRoutes = {};
  latestData.forEach(item => {
    groupedRoutes[item.route_id] = `${item.start_location} - ${item.end_location}`;
  });

  const routeOptions = Object.entries(groupedRoutes).map(([routeId, label]) => ({
    value: routeId,
    label: `Route ${routeId}: ${label}`
  }));

  const filteredData = hourlyData.filter(
    d => d.route_id === parseInt(selectedRoute) && d.day_type === selectedDayType
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Routes</h1>

      <div className="mb-4">
        <label className="mr-2">Select Route:</label>
        <select
          value={selectedRoute}
          onChange={e => setSelectedRoute(e.target.value)}
        >
          <option value="">Select a route</option>
          {routeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label className="mx-2">Day Type:</label>
        <select
          value={selectedDayType}
          onChange={e => setSelectedDayType(e.target.value)}
        >
          <option value="weekday">Weekday</option>
          <option value="weekend">Weekend</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
        </select>

        <label className="mx-2">Metric:</label>
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
        >
          <option value="avg_driving_travel_time">Driving Time</option>
          <option value="avg_transit_travel_time">Transit Time</option>
          <option value="avg_travel_time_difference">Time Difference</option>
          <option value="avg_delay_ratio">Delay Ratio</option>
          <option value="avg_aqi">AQI</option>
        </select>
      </div>

      {!selectedRoute && !selectedDayType && !selectedMetric && (
        <>
          <h2 className="text-lg font-semibold mt-8 mb-2">Latest Route Updates</h2>
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse border-2 border-gray-700">
              <thead>
                <tr className="bg-gray-200 text-center font-semibold text-sm">
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Route</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Last Update</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Start</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">End</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Driving</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Transit</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Diff</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">Delay Ratio</th>
                  <th className="border-2 border-gray-700 px-3 py-2 text-sm text-center">AQI</th>
                </tr>
              </thead>
              <tbody>
                {latestData.map(row => (
                  <tr key={row.route_id} className="text-sm text-center odd:bg-gray-100">
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.route_id}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.start_location}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.end_location}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.driving_travel_time}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.transit_travel_time}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.travel_time_difference}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.delay_ratio}</td>
                    <td className="border-2 border-gray-700 px-3 py-2 text-sm text-center">{row.aqi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedRoute && filteredData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tickFormatter={h => `${h}:00`} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMetric} fill="#8884d8" name={selectedMetric} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}


      
      
