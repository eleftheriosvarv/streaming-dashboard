import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Dashboard() {
  const [averages, setAverages] = useState(null);
  const [points, setPoints] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // 10 λεπτά
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [avgRes, pointsRes] = await Promise.all([
        fetch('https://backend-dashboard-26rc.onrender.com/averages'),
        fetch('https://backend-dashboard-26rc.onrender.com/latest_per_start_point')
      ]);

      const avgData = await avgRes.json();
      const pointsData = await pointsRes.json();

      setAverages(avgData);
      setPoints(pointsData);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Real-Time Dashboard</h1>
      {lastUpdated && <p>🕒 Last updated: {lastUpdated}</p>}

      {averages && (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>AQI</th>
              <th>Delay Ratio</th>
              <th>Driving Time</th>
              <th>Transit Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{averages.aqi}</td>
              <td>{averages.delay_ratio}</td>
              <td>{averages.driving_travel_time}</td>
              <td>{averages.transit_travel_time}</td>
            </tr>
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 40 }}>🗺️ Χάρτης Αθήνας</h2>
      <MapContainer center={[37.9838, 23.7275]} zoom={11} style={{ height: 500, width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {points.map((point, i) => (
          <Marker key={i} position={[point.lat, point.lon]}>
            <Popup>
              <strong>Σημείο {i + 1}</strong>
              <ul>
                {point.routes_data.map((route, j) => (
                  <li key={j}>
                    🚗 {route.driving_travel_time}' | 🚋 {route.transit_travel_time}' | 🌫 AQI: {route.aqi}
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
