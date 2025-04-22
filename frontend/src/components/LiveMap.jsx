import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const startPointIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [25, 25],
  iconAnchor: [12, 24],
});

const LiveMap = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://backend-dashboard-26rc.onrender.com/latest")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to fetch route data", err));
  }, []);

  const coords = {
    Athens: [37.9838, 23.7275],
    Marousi: [38.0548, 23.8081],
    "Nea Smyrni": [37.9456, 23.7144],
    Glyfada: [37.8789, 23.7504],
    Piraeus: [37.942, 23.6465],
    Peristeri: [38.0158, 23.6855],
  };

  const grouped = {};
  data.forEach((route) => {
    const key = route.start_location;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(route);
  });

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-2">Live Route Metrics Map</h2>
      <MapContainer
        center={[37.9838, 23.7275]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {Object.entries(grouped).map(([start, routes], idx) => {
          const coord = coords[start];
          if (!coord) return null;

          const popupText = routes
            .map(
              (r) =>
                `${r.start_location} → ${r.end_location}\nDriving: ${r.driving_travel_time} min\nTransit: ${r.transit_travel_time} min\nAQI: ${r.aqi}\nDelay: ${r.delay_ratio}`
            )
            .join("\n\n");

          return (
            <Marker key={idx} position={coord} icon={startPointIcon}>
              <Popup>
                <pre>{popupText}</pre>
              </Popup>
              <Tooltip direction="right" offset={[10, 0]} opacity={1} permanent>
                <span style={{ fontSize: "12px" }}>{start}</span>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
