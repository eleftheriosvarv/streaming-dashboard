import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://backend-dashboard-26rc.onrender.com/latest')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Latest Route Data</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Route ID</th>
              <th className="border px-4 py-2">Start Location</th>
              <th className="border px-4 py-2">End Location</th>
              <th className="border px-4 py-2">Start Latitude</th>
              <th className="border px-4 py-2">Start Longitude</th>
              <th className="border px-4 py-2">Driving Time</th>
              <th className="border px-4 py-2">Transit Time</th>
              <th className="border px-4 py-2">AQI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.route_id}>
                <td className="border px-4 py-2">{item.route_id}</td>
                <td className="border px-4 py-2">{item.start_location}</td>
                <td className="border px-4 py-2">{item.end_location}</td>
                <td className="border px-4 py-2">{item.start_latitude}</td>
                <td className="border px-4 py-2">{item.start_longitude}</td>
                <td className="border px-4 py-2">{item.driving_travel_time}</td>
                <td className="border px-4 py-2">{item.transit_travel_time}</td>
                <td className="border px-4 py-2">{item.aqi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

