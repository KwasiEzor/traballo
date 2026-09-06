"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Domain-authenticated by default (works on localhost + the domains allow-listed
// in the Stadia dashboard). Falls back to a public key if one is exposed.
const STADIA_STYLE = "alidade_smooth";
const KEY = process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY;
const TILE_URL =
  `https://tiles.stadiamaps.com/tiles/${STADIA_STYLE}/{z}/{x}/{y}{r}.png` +
  (KEY ? `?api_key=${KEY}` : "");

const ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/" target="_blank" rel="noreferrer">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg"><path d="M15 0C6.7 0 0 6.6 0 14.8 0 25.3 15 40 15 40s15-14.7 15-25.2C30 6.6 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="14.6" r="5.4" fill="#fff"/></svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

export default function SiteMapInner({
  lat,
  lng,
  label,
  color,
}: {
  lat: number;
  lng: number;
  label: string;
  color: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: 340, width: "100%" }}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <Marker position={[lat, lng]} icon={pinIcon(color)}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
