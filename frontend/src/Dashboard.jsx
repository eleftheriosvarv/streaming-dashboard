import LiveMap from "./components/LiveMap";

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables);

export default function Dashboard() {
  const [hourlyData, setHourlyData] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDayType, setSelectedDayType] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');
  const [startLocations, setStartLocations] = useState([]);
  const [selectedStartLocation, setSelectedStartLocation] = useState('');
  const [selectedCorrelationType, setSelectedCorrelationType] = useState('');
  const [correlationData, setCorrelationData] = useState({ delay_ratio: [], aqi: [] });

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then(res => res.json())
      .then(data => setHourlyData(data))
      .catch(err => console.error("Failed to fetch hourly averages", err));

    fetch("https://backend-dashboard-26rc.onrender.com/latest")
      .then(res => res.json())
      .then(data => setLatestData(data))
      .catch(err => console.error("Failed to fetch latest data", err));

    axios.get("https://backend-dashboard-26rc.onrender.com/start_locations")
      .then(res => setStartLocations(res.data.start_locations))
      .catch(err => console.error("Failed to fetch start locations", err));
  }, []);

  useEffect(() => {
    if ((selectedDayType === 'today' || selectedDayType === 'yesterday') && selectedRoute) {
      fetch(`https://backend-dashboard-26rc.onrender.com/today_data?route_id=${selectedRoute}&day_type=${selectedDayType}`)
        .then(res => res.json())
        .then(data => setTodayData(data))
        .catch(err => console.error("Failed to fetch today/yesterday data", err));
    }
  }, [selectedDayType, selectedRoute]);

  useEffect(() => {
    if (selectedStartLocation && selectedCorrelationType) {
      axios.get("https://backend-dashboard-26rc.onrender.com/correlation_data", {
        params: {
          start_location: selectedStartLocation,
          type: selectedCorrelationType
        }
      })
        .then(res => setCorrelationData(res.data))
        .catch(err => console.error("Failed to fetch correlation data", err));
    }
  }, [selectedStartLocation, selectedCorrelationType]);

  const groupedRoutes = {};
  latestData.forEach(item => {
    groupedRoutes[item.route_id] = `${item.start_location} - ${item.end_location}`;
  });

  const routeOptions = Object.entries(groupedRoutes).map(([routeId, label]) => ({
    value: routeId,
    label: `Route ${routeId}: ${label}`
  }));

  const filteredData = (selectedDayType === 'today' || selectedDayType === 'yesterday')
    ? todayData
    : hourlyData.filter(
      d => Number(d.route_id) === Number(selectedRoute) && d.day_type === selectedDayType
    );

  const showTable = !selectedRoute && !selectedDayType && !selectedMetric;
  const showChart = selectedRoute && selectedDayType && selectedMetric;

  const scatterChartData = {
    datasets: [{
      label: 'Delay Ratio vs AQI',
      data: correlationData.delay_ratio.map((delay, i) => ({ x: delay, y: correlationData.aqi[i] })),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    }]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Routes</h1>
      <div className="mb-4 flex items-center justify-between">
        <button
          className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-4"
          onClick={() => window.location.href = "/"}
        >
          Home
        </button>

        <select
          value={selectedStartLocation}
          onChange={(e) => setSelectedStartLocation(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Select Start Location</option>
          {startLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>

        <select
          value={selectedCorrelationType}
          onChange={(e) => setSelectedCorrelationType(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Correlation Type</option>
          <option value="same_minute">Same Minute</option>
          <option value="plus_one_hour">+1 Hour ±20min</option>
          <option value="plus_two_hours">+2 Hours ±20min</option>
        </select>

        <label className="mx-2">Select Route:</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
        >
          <option value="">Select a route</option>
          {routeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {showTable && <LiveMap />}
      {showTable && (
        <>
          {/* Existing table content unchanged */}
        </>
      )}

      {showChart && filteredData.length > 0 && (
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

      {selectedStartLocation && selectedCorrelationType && correlationData.delay_ratio.length > 0 && (
        <div className="mt-8">
          <Scatter data={scatterChartData} />
        </div>
      )}
    </div>
  );
}


      
