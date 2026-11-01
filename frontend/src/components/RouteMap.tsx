import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility } from '../types';

interface RouteMapProps {
  coordinates: [number, number][]; // [lon, lat]
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  facilitiesAlongRoute?: Facility[];
  height?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  coordinates,
  origin,
  destination,
  facilitiesAlongRoute = [],
  height = '480px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [origin.lat, origin.lng],
        zoom: 13,
        zoomControl: false,
      });

      // Dark emerald OpenStreetMap tile layer styled via CSS
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old layers except tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Draw Polyline route: GeoJSON format is [lon, lat], Leaflet expects [lat, lon]
    const latLngs: [number, number][] = coordinates.map((coord) => [coord[1], coord[0]]);

    if (latLngs.length > 0) {
      const polyline = L.polyline(latLngs, {
        color: '#22C55E', // Luminous Emerald Green polyline
        weight: 6,
        opacity: 0.95,
        lineJoin: 'round',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [45, 45] });
    }

    // Origin Marker (Neon Emerald Pin A)
    const originIcon = L.divIcon({
      className: 'route-origin-pin',
      html: `
        <div style="background: #22C55E; color: #0B1F16; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; border: 3px solid #0B1F16; box-shadow: 0 0 15px rgba(34, 197, 94, 0.7);">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup(`<b style="color:#22C55E;">Start:</b> <span style="color:#F8FAF5;">${origin.name || 'Origin'}</span>`)
      .addTo(map);

    // Destination Marker (Champagne Gold Pin B)
    const destIcon = L.divIcon({
      className: 'route-dest-pin',
      html: `
        <div style="background: #FAC615; color: #0B1F16; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; border: 3px solid #0B1F16; box-shadow: 0 0 15px rgba(250, 198, 21, 0.7);">
          B
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
    L.marker([destination.lat, destination.lng], { icon: destIcon })
      .bindPopup(`<b style="color:#FAC615;">Arrival:</b> <span style="color:#F8FAF5;">${destination.name || 'Destination'}</span>`)
      .addTo(map);

    // Waypoints along route
    facilitiesAlongRoute.forEach((f) => {
      const cat = f.category?.toUpperCase() || '';
      const color = cat.includes('DUSTBIN') ? '#FAC615' : cat.includes('TOILET') ? '#22C55E' : cat.includes('HOSPITAL') ? '#EF4444' : '#38BDF8';

      const wpIcon = L.divIcon({
        className: 'route-facility-pin',
        html: `
          <div style="background: ${color}; color: #0B1F16; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border: 2px solid #0B1F16; box-shadow: 0 2px 10px rgba(0,0,0,0.6);">
            •
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([f.latitude, f.longitude], { icon: wpIcon })
        .bindPopup(`
          <div style="font-family: system-ui; padding: 4px; background: #1E4D3A; color: #F8FAF5; border-radius: 8px;">
            <div style="font-size: 10px; font-weight: 800; color: ${color}; text-transform: uppercase;">
              ${f.category.replace(/_/g, ' ')}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #F8FAF5; margin-top: 2px;">
              ${f.name}
            </div>
            <div style="font-size: 10px; color: #FAC615; margin-top: 2px;">
              ${f.cleanlinessRating != null ? `★ ${f.cleanlinessRating.toFixed(1)}` : 'OSM Verified'} • Corridor Point
            </div>
          </div>
        `)
        .addTo(map);
    });
  }, [coordinates, origin, destination, facilitiesAlongRoute]);

  return (
    <div className="rounded-3xl overflow-hidden border border-[#163B2E] shadow-2xl">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
};
