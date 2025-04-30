import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, Line
} from 'recharts';
import regression from 'regression';
import LiveMap from './components/LiveMap';

const calculatePearsonCorrelation = (x, y) => {
  const n = x.length;
  const avgX = x.reduce((a, b) => a + b, 0) / n;
  const avgY = y.reduce((a, b) => a + b, 0) / n;
  const numerator = x.map((xi, i) => (xi - avgX) * (y[i] - avgY)).reduce((a, b) => a + b, 0);
  const denominatorX = Math.sqrt(x.map(xi => Math.pow(xi - avgX, 2)).reduce((a, b) => a + b, 0));
  const denominatorY = Math.sqrt(y.map(yi => Math.pow(yi - avgY, 2)).reduce((a, b) => a + b, 0));
  return numerator / (denominatorX * denominatorY);
};

export default function Dashboard() {
  const [tab, setTab] = useState('home');
  const [hourlyData, setHourlyData] = useState([]);
  const [latestData, setLatestData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [startLocations, setStartLocations] = useState([]);
  const [correlationData, setCorrelationData] = useState({ delay_ratio: [], aqi: [] });

  const [selectedStartLocation, setSelectedStartLocation] = useState('');
  const [selectedCorrelationType, setSelectedCorrelationType] = useState('same_minute');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedDayType, setSelectedDayType] = useState('');
  const [selectedMetric, setSelectedMetric] = useState('');

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/start_locations")
      .then(res => res.json())
      .then(data => setStartLocations(data.start_locations))
      .catch(err => console.error("Failed to fetch start locations", err));

    fetch("https://backend-dashboard-26rc.onrender.com/hourly_averages")
      .then(res => res.json())
      .then(data => setHourlyData(data))
      .catch(err => console.error("Failed to fetch hourly averages", err));

    fetch("https://backend-dashboard-26rc.onrender.com/latest")
      .then(res => res.json())
      .then(data => setLatestData(data))
      .catch(err => console.error("Failed to fetch latest data", err));
  }, []);

  useEffect(() => {
    if (selectedStartLocation && selectedCorrelationType) {
      fetch(`https://backend-dashboard-26rc.onrender.com/correlation_data?start_location=${selectedStartLocation}&type=${selectedCorrelationType}`)
        .then(res => res.json())
        .then(data => setCorrelationData(data))
        .catch(err => console.error("Failed to fetch correlation data", err));
    }
  }, [selectedStartLocation, selectedCorrelationType]);

  useEffect(() => {
    if ((selectedDayType === 'today' || selectedDayType === 'yesterday') && selectedRoute) {
      fetch(`https://backend-dashboard-26rc.onrender.com/today_data?route_id=${selectedRoute}&day_type=${selectedDayType}`)
        .then(res => res.json())
        .then(data => setTodayData(data))
        .catch(err => console.error("Failed to fetch today/yesterday data", err));
    }
  }, [selectedDayType, selectedRoute]);
    useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch("https://backend-dashboard-26rc.onrender.com/latest");
        const result = await response.json();
        setLatestData(result);
      } catch (error) {
        console.error("Failed to auto-fetch latest data", error);
      }
    };

    const interval = setInterval(fetchLatestData, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);


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

  let scatterData = [];
  if (correlationData.delay_ratio.length > 0 && correlationData.aqi.length > 0) {
    scatterData = correlationData.delay_ratio.map((val, idx) => ({
      delay_ratio: val,
      aqi: correlationData.aqi[idx]
    }));
  }

  const regressionResult = scatterData.length > 1 ? regression.linear(scatterData.map(d => [d.delay_ratio, d.aqi])) : null;
  const r = scatterData.length > 1 ? calculatePearsonCorrelation(
    scatterData.map(d => d.delay_ratio),
    scatterData.map(d => d.aqi)
  ) : null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Routes Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button onClick={() => setTab('home')} className={`px-4 py-2 rounded ${tab === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          Home
        </button>
        <button onClick={() => setTab('correlation')} className={`px-4 py-2 rounded ${tab === 'correlation' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          Correlation
        </button>
        <button onClick={() => setTab('routes')} className={`px-4 py-2 rounded ${tab === 'routes' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          Routes
        </button>
      </div>

      {tab === 'home' && (
        <>
          <LiveMap />
          <h2 className="text-lg font-semibold mt-8 mb-2">Latest Route Updates</h2>
          <div className="overflow-x-auto mb-12">
            <table className="w-full border-collapse border-2 border-gray-700">
              <thead>
                <tr className="bg-gray-200 text-center font-semibold text-sm">
                  <th className="border-2 border-gray-700 px-3 py-2">Route</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Last Update</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Start</th>
                  <th className="border-2 border-gray-700 px-3 py-2">End</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Driving</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Transit</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Diff</th>
                  <th className="border-2 border-gray-700 px-3 py-2">Delay Ratio</th>
                  <th className="border-2 border-gray-700 px-3 py-2">AQI</th>
                </tr>
              </thead>
              <tbody>
                {latestData.map(row => (
                  <tr key={row.route_id} className="text-sm text-center odd:bg-gray-100">
                    <td className="border-2 border-gray-700 px-3 py-2">{row.route_id}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.start_location}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.end_location}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.driving_travel_time}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.transit_travel_time}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.travel_time_difference}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.delay_ratio}</td>
                    <td className="border-2 border-gray-700 px-3 py-2">{row.aqi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'correlation' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <select value={selectedStartLocation} onChange={(e) => setSelectedStartLocation(e.target.value)} className="p-2 border rounded">
              <option value="">Select Start Location</option>
              {startLocations.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>

            <select value={selectedCorrelationType} onChange={(e) => setSelectedCorrelationType(e.target.value)} className="p-2 border rounded">
              <option value="same_minute">Same Minute</option>
              <option value="plus_one_hour">1hr Delay</option>
              <option value="plus_two_hours">2hr Delay</option>
            </select>
          </div>

          {scatterData.length > 0 && (
            <>
              <h2 className="text-xl font-semibold text-center mb-2">
                  Correlation between Delay Ratio and AQI
                </h2>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="delay_ratio" 
                    name="Delay Ratio" 
                    label={{ value: 'Delay Ratio', position: 'insideBottom', offset: -5 }} 
                    />
                  <YAxis 
                    type="number" 
                    dataKey="aqi" 
                    name="AQI" 
                    label={{ value: 'AQI', angle: -90, position: 'insideLeft' }} 
                    />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Data" data={scatterData} fill="#8884d8" />
                  {regressionResult && (
                    <Line
                      type="linear"
                      dataKey="delay_ratio"
                      stroke="#ff7300"
                      dot={false}
                      legendType="none"
                      data={scatterData.map(d => ({
                        delay_ratio: d.delay_ratio,
                        aqi: regressionResult.predict(d.delay_ratio)[1]
                      }))}
                    />
                  )}
                </ResponsiveContainer>
              <p className="text-center mt-4 font-semibold">
                R: {r !== null ? r.toFixed(2) : 'N/A'} | R²: {regressionResult?.r2.toFixed(2)}
              </p>
            </>
          )}
        </>
      )}

      {tab === 'routes' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className="p-2 border rounded">
              <option value="">Select Route</option>
              {routeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select value={selectedDayType} onChange={(e) => setSelectedDayType(e.target.value)} className="p-2 border rounded">
              <option value="">Select Day Type</option>
              <option value="weekday">Weekday</option>
              <option value="weekend">Weekend</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>

            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="p-2 border rounded">
              <option value="">Select Metric</option>
              <option value="avg_driving_travel_time">Driving Time</option>
              <option value="avg_transit_travel_time">Transit Time</option>
              <option value="avg_travel_time_difference">Time Difference</option>
              <option value="avg_delay_ratio">Delay Ratio</option>
              <option value="avg_aqi">AQI</option>
            </select>
          </div>

          {filteredData.length > 0 && selectedMetric && (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={h => `${h}:00`} 
                    label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }} 
                    />
                  <YAxis 
                    label={{ 
                      value: selectedMetric.replaceAll('_', ' ').toUpperCase(), 
                      angle: -90, 
                      position: 'insideLeft' 
                    }} 
                    />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={selectedMetric} fill="#8884d8" name={selectedMetric} />
                </BarChart>
              </ResponsiveContainer>

              {selectedRoute && (
                <div className="flex justify-center mt-6">
                  <img
                    src={`/routes/Route_${selectedRoute}.jpg`}
                    alt={`Route ${selectedRoute}`}
                    className="max-w-full rounded-lg shadow-lg border border-gray-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

