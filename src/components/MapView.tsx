 "use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const busIcon = new L.DivIcon({
  className: "bus-marker",
  html: '<div class="bus-marker-inner">🚌</div>',
  iconSize: [34, 34], iconAnchor: [17, 17]
});
const stopsIcon = new L.DivIcon({
  className: "stop-marker",
  html: '<div class="stop-marker-inner"></div>',
  iconSize: [12, 12], iconAnchor: [6, 6]
});

const buses = [
  { id: "SEC-01", name: "SEC Bus 01", lat: 11.6642, lng: 78.1460, route: "Salem Central", driver: "R. Kumar", students: 42, speed: 34 },
  { id: "SEC-04", name: "SEC Bus 04", lat: 11.6758, lng: 78.1580, route: "Ammapet", driver: "S. Prakash", students: 38, speed: 27 },
  { id: "SEC-07", name: "SEC Bus 07", lat: 11.6505, lng: 78.1355, route: "Omalur", driver: "M. Suresh", students: 31, speed: 41 },
  { id: "SEC-12", name: "SEC Bus 12", lat: 11.6880, lng: 78.1290, route: "Attur Road", driver: "K. Anand", students: 36, speed: 0 }
];
const routeLine: [number, number][] = [
  [11.6642,78.1460],[11.6680,78.1500],[11.6710,78.1540],[11.6758,78.1580]
];

export default function MapView({ full = false }: { full?: boolean }) {
  return (
    <div className={`map-shell ${full ? "map-full" : ""}`}>
      <MapContainer center={[11.664, 78.146]} zoom={full ? 13 : 12} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={routeLine} pathOptions={{ color: "#8b5cf6", weight: 4, opacity: 0.8 }} />
        {buses.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <strong>{bus.name}</strong><br />
              {bus.route} · {bus.speed ? `${bus.speed} km/h` : "Stopped"}<br />
              Driver: {bus.driver}<br />Students onboard: {bus.students}
            </Popup>
          </Marker>
        ))}
        <Marker position={[11.6680,78.1500]} icon={stopsIcon}><Popup>Five Roads Stop</Popup></Marker>
        <Marker position={[11.6710,78.1540]} icon={stopsIcon}><Popup>New Bus Stand Stop</Popup></Marker>
      </MapContainer>
      <div className="map-overlay-label"><span className="live-dot"/> LIVE GPS SIMULATION <span className="overlay-divider"/> Salem, Tamil Nadu</div>
    </div>
  );
}