import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Facility } from '../types';
import { LocateFixed } from 'lucide-react';

interface FacilityMapProps {
  facilities: Facility[];
  selectedFacility?: Facility | null;
  onSelectFacility?: (facility: Facility) => void;
  onNavigateTo?: (facility: Facility) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showLocateButton?: boolean;
  routeCoordinates?: [number, number][]; // [lat, lng]
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  center = [18.1067, 83.3956], // Default Vizianagaram
  zoom = 13,
  height = '520px',
  showLocateButton = true,
  routeCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Category to color mapping (Emerald Forest + Champagne Gold palette)
  const getCategoryColor = (category: string, isSelected: boolean) => {
    if (isSelected) return '#FAC615'; // Champagne Gold Glow
    const norm = String(category || '').toUpperCase();
    switch (norm) {
      case 'DUSTBIN':
      case 'DUSTBINS':
      case 'WASTE': return '#FAC615'; // Champagne Gold
      case 'PUBLIC_TOILET':
      case 'TOILET':
      case 'TOILETS': return '#22C55E'; // Emerald Green
      case 'DRINKING_WATER':
      case 'WATER': return '#38BDF8'; // Cyan Blue
      case 'HOSPITAL':
      case 'HOSPITALS': return '#EF4444'; // Vibrant Alert Red
      case 'PHARMACY':
      case 'PHARMACIES': return '#F43F5E'; // Rose
      case 'POLICE_STATION':
      case 'POLICE': return '#34D399'; // Jade Accent
      case 'BUS_STOP':
      case 'BUS': return '#FAC615'; // Transport Gold
      case 'RAILWAY_STATION':
      case 'RAILWAY': return '#38BDF8'; // Cyan Blue
      case 'PUBLIC_PARK':
      case 'PARK': return '#22C55E'; // Emerald Green
      case 'EV_CHARGING':
      case 'EV': return '#FAC615'; // Gold
      default: return '#22C55E';
    }
  };

  const createPinIcon = (color: string, label: string, isSelected: boolean) => {
    const size = isSelected ? 38 : 30;
    const glow = isSelected 
      ? '0 0 20px #FAC615, 0 0 35px rgba(250,198,21,0.6)' 
      : '0 4px 14px rgba(0,0,0,0.6)';
    const borderWidth = isSelected ? '3px' : '2px';
    const textColor = isSelected ? '#0B1F16' : '#FFFFFF';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${color};
          color: ${textColor};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: ${glow};
          border: ${borderWidth} solid #FFFFFF;
          transition: transform 0.2s ease;
        ">
          <span style="transform: rotate(45deg); font-size: ${isSelected ? '12px' : '10px'}; font-weight: 900;">
            ${label.substring(0, 1).toUpperCase()}
          </span>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
      });

      // Dark emerald OpenStreetMap tile layer styled via CSS
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Update markers when facilities list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    facilities.forEach((f) => {
      const isSelected = selectedFacility?.id === f.id;
      const pinColor = getCategoryColor(f.category, isSelected);
      const icon = createPinIcon(pinColor, f.category.replace('PUBLIC_', ''), isSelected);

      const marker = L.marker([f.latitude, f.longitude], { icon });

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 200px; background: #1E4D3A; border-radius: 12px; color: #F8FAF5;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 10px; font-weight: 800; color: #22C55E; text-transform: uppercase; letter-spacing: 0.5px;">
              ${f.category.replace(/_/g, ' ')}
            </span>
            ${f.verified ? '<span style="font-size: 9px; background: rgba(34,197,94,0.2); color: #22C55E; padding: 1px 6px; border-radius: 9999px; font-weight: 700; border: 1px solid rgba(34,197,94,0.4);">VERIFIED</span>' : ''}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #F8FAF5; margin-top: 4px; line-height: 1.3;">
            ${f.name}
          </div>
          <div style="font-size: 11px; color: #94B7A8; margin-top: 3px; line-height: 1.3;">
            ${f.address || f.area || 'Address verified on ground'}
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #163B2E; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <span style="font-weight: 700; color: #FAC615;">★ ${f.cleanlinessRating != null ? f.cleanlinessRating.toFixed(1) : '4.2'} <span style="font-size: 9px; color: #94B7A8;">(${f.totalReviews || 1})</span></span>
            <span style="color: ${f.isAccessible ? '#22C55E' : '#94B7A8'}; font-weight: 600; font-size: 10px;">
              ${f.isAccessible ? '♿ Ramp / Barrier-Free' : 'Standard'}
            </span>
          </div>
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <button id="btn-select-${f.id}" style="
              flex: 1;
              background: #22C55E;
              color: #0B1F16;
              border: none;
              padding: 6px 10px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              cursor: pointer;
              box-shadow: 0 0 10px rgba(34,197,94,0.4);
            ">View Details</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${f.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectFacility?.(f);
          };
        }
      });

      marker.on('click', () => {
        onSelectFacility?.(f);
      });

      markersLayer.addLayer(marker);
    });

    if (selectedFacility) {
      map.setView([selectedFacility.latitude, selectedFacility.longitude], 15, { animate: true });
    }
  }, [facilities, selectedFacility]);

  // Handle drawing active route coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 1) {
      const polyline = L.polyline(routeCoordinates, {
        color: '#22C55E',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        dashArray: '2, 6',
      }).addTo(map);

      routeLayerRef.current = polyline;
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routeCoordinates]);

  const handleLocateMe = () => {
    if ('geolocation' in navigator && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapInstanceRef.current?.setView([latitude, longitude], 15, { animate: true });

          if (userMarkerRef.current) {
            mapInstanceRef.current?.removeLayer(userMarkerRef.current);
          }

          // Luminous pulsing green/gold user indicator marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(34, 197, 94, 0.4); animation: pulse-ring 2s infinite;"></div>
                <div style="position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #FAC615; border: 3px solid #0B1F16; box-shadow: 0 0 12px #FAC615;"></div>
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup('<b style="color:#F8FAF5;">Your Current Location</b>')
            .addTo(mapInstanceRef.current!);
        },
        (err) => {
          console.warn('Geolocation unavailable:', err.message);
        }
      );
    }
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-[#163B2E] shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {showLocateButton && (
        <button
          onClick={handleLocateMe}
          title="Zoom to My Current GPS Location"
          className="absolute top-4 right-4 z-[400] p-2.5 rounded-2xl bg-[#1E4D3A]/90 backdrop-blur-md text-[#22C55E] border border-[#163B2E] shadow-xl hover:bg-[#22C55E] hover:text-[#0B1F16] transition duration-200"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
