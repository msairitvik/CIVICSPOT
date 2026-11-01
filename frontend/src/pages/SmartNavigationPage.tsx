import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Car,
  Footprints,
  Bike,
  Route,
  Sparkles,
  LocateFixed
} from 'lucide-react';
import { navigationApi, geocodingApi } from '../services/api';
import { RouteResponse, GeocodingResult } from '../types';
import { RouteMap } from '../components/RouteMap';
import { FacilityCard } from '../components/FacilityCard';

export const SmartNavigationPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Origin & Destination coordinates (Default: Vizianagaram Clock Tower to Railway Station)
  const [originLat, setOriginLat] = useState<number>(18.1124);
  const [originLng, setOriginLng] = useState<number>(83.4077);
  const [originName, setOriginName] = useState('Vizianagaram Clock Tower');
  const [originInput, setOriginInput] = useState('');
  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);

  const [destLat, setDestLat] = useState<number>(
    searchParams.get('destLat') ? Number(searchParams.get('destLat')) : 18.1172
  );
  const [destLng, setDestLng] = useState<number>(
    searchParams.get('destLng') ? Number(searchParams.get('destLng')) : 83.4014
  );
  const [destName, setDestName] = useState(searchParams.get('destName') || 'Vizianagaram Railway Station');
  const [destInput, setDestInput] = useState('');
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // GPS for origin
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setOriginLat(lat);
          setOriginLng(lng);
          try {
            const rev = await geocodingApi.reverse(lat, lng);
            if (rev && rev.displayName) {
              setOriginName(rev.displayName.split(',').slice(0, 2).join(','));
            } else {
              setOriginName('My Current Location');
            }
          } catch (e) {
            setOriginName('My Current Location');
          }
        },
        (err) => console.log('Navigation default to Vizianagaram:', err.message)
      );
    }
  }, []);

  // Autocomplete search handlers
  const handleOriginSearch = async (val: string) => {
    setOriginInput(val);
    if (val.trim().length >= 2) {
      try {
        const res = await geocodingApi.search(val.trim(), 4);
        setOriginSuggestions(res);
        setShowOriginDropdown(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setOriginSuggestions([]);
      setShowOriginDropdown(false);
    }
  };

  const handleDestSearch = async (val: string) => {
    setDestInput(val);
    if (val.trim().length >= 2) {
      try {
        const res = await geocodingApi.search(val.trim(), 4);
        setDestSuggestions(res);
        setShowDestDropdown(true);
      } catch (e) {
        console.error(e);
      }
    } else {
      setDestSuggestions([]);
      setShowDestDropdown(false);
    }
  };

  const selectOrigin = (sug: GeocodingResult) => {
    setOriginLat(sug.latitude);
    setOriginLng(sug.longitude);
    setOriginName(sug.displayName.split(',')[0]);
    setOriginInput(sug.displayName.split(',')[0]);
    setShowOriginDropdown(false);
  };

  const selectDest = (sug: GeocodingResult) => {
    setDestLat(sug.latitude);
    setDestLng(sug.longitude);
    setDestName(sug.displayName.split(',')[0]);
    setDestInput(sug.displayName.split(',')[0]);
    setShowDestDropdown(false);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setOriginLat(pos.coords.latitude);
          setOriginLng(pos.coords.longitude);
          setOriginName('My GPS Location');
          setOriginInput('Current GPS');
        },
        () => alert('Could not get current location.')
      );
    }
  };

  // Route calculation
  const handleCalculateRoute = async () => {
    setLoading(true);
    try {
      const data = await navigationApi.getRoute({
        originLat,
        originLng,
        originName,
        destinationLat: destLat,
        destinationLng: destLng,
        destinationName: destName,
        travelMode: travelMode,
      });
      setRouteData(data);
    } catch (e) {
      console.error('Route calculation error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRoute();
  }, [originLat, originLng, destLat, destLng, travelMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-xs font-bold border border-[#22C55E]/30">
          <Navigation className="w-3.5 h-3.5" />
          <span>Smart Route & Infrastructure Companion</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">Smart Navigation</h1>
        <p className="text-xs text-[#94B7A8] max-w-xl">
          Turn-by-turn routing powered by OpenStreetMap OSRM with live civic facility detection (water ATMs, dustbins, toilets) along your path.
        </p>
      </div>

      {/* Origin, Destination & Mode Panel */}
      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Origin Search */}
          <div className="md:col-span-5 relative space-y-1.5">
            <label className="block text-[11px] font-bold text-[#22C55E] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
                <span>Origin (Departure)</span>
              </span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[10px] text-[#FAC615] hover:underline flex items-center space-x-1 font-semibold"
              >
                <LocateFixed className="w-3 h-3" />
                <span>Use GPS</span>
              </button>
            </label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <MapPin className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="text"
                value={originInput || originName}
                onChange={(e) => handleOriginSearch(e.target.value)}
                onFocus={() => { if (originSuggestions.length > 0) setShowOriginDropdown(true); }}
                placeholder="Type starting village or landmark..."
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>

            {showOriginDropdown && originSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F2F22] border border-[#1E4D3A] rounded-2xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto backdrop-blur-xl">
                {originSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOrigin(sug)}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#D1E7D6] hover:bg-[#1E4D3A] border-b border-[#1E4D3A]/60 last:border-none transition"
                  >
                    <p className="font-bold text-[#F8FAF5]">{sug.displayName.split(',')[0]}</p>
                    <p className="text-[10px] text-[#94B7A8] truncate">{sug.displayName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="md:col-span-5 relative space-y-1.5">
            <label className="block text-[11px] font-bold text-[#FAC615] uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FAC615] shadow-[0_0_8px_#FAC615]" />
              <span>Destination (Arrival)</span>
            </label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#FAC615] px-3.5 py-3 transition shadow-inner">
              <MapPin className="w-4 h-4 text-[#FAC615] mr-2 shrink-0" />
              <input
                type="text"
                value={destInput || destName}
                onChange={(e) => handleDestSearch(e.target.value)}
                onFocus={() => { if (destSuggestions.length > 0) setShowDestDropdown(true); }}
                placeholder="Type destination village or city..."
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>

            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F2F22] border border-[#1E4D3A] rounded-2xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto backdrop-blur-xl">
                {destSuggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDest(sug)}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#D1E7D6] hover:bg-[#1E4D3A] border-b border-[#1E4D3A]/60 last:border-none transition"
                  >
                    <p className="font-bold text-[#F8FAF5]">{sug.displayName.split(',')[0]}</p>
                    <p className="text-[10px] text-[#94B7A8] truncate">{sug.displayName}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Travel Mode Toggle */}
          <div className="md:col-span-2 flex items-center justify-between bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] p-1">
            <button
              onClick={() => setTravelMode('driving')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center flex-1 transition active:scale-95 ${
                travelMode === 'driving' ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
              title="Driving"
            >
              <Car className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTravelMode('cycling')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center flex-1 transition active:scale-95 ${
                travelMode === 'cycling' ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
              title="Cycling"
            >
              <Bike className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTravelMode('walking')}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center flex-1 transition active:scale-95 ${
                travelMode === 'walking' ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
              title="Walking"
            >
              <Footprints className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Route Stats Summary */}
        {routeData && (
          <div className="pt-4 border-t border-[#1E4D3A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-4 w-full sm:w-auto">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0B1F16] border border-[#1E4D3A] text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider block">Distance</span>
                <p className="font-black text-[#22C55E] text-sm sm:text-base">
                  {(routeData.totalDistanceMeters / 1000).toFixed(1)} km
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0B1F16] border border-[#1E4D3A] text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider block">Duration</span>
                <p className="font-black text-[#FAC615] text-sm sm:text-base">
                  {Math.round(routeData.totalDurationSeconds / 60)} mins
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#0B1F16] border border-[#1E4D3A] text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider block">Amenities</span>
                <p className="font-black text-[#34D399] text-sm sm:text-base">
                  {routeData.facilitiesAlongRoute.length} registered
                </p>
              </div>
            </div>

            <button
              onClick={handleCalculateRoute}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition duration-200 active:scale-95"
            >
              {loading ? 'Routing...' : 'Recalculate Route'}
            </button>
          </div>
        )}
      </div>

      {/* Main Map & Steps Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* In-App Route Map */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden border border-[#163B2E] shadow-2xl">
          <RouteMap
            coordinates={routeData ? routeData.coordinates : []}
            origin={{ lat: originLat, lng: originLng, name: originName }}
            destination={{ lat: destLat, lng: destLng, name: destName }}
            facilitiesAlongRoute={routeData?.facilitiesAlongRoute || []}
            height="560px"
          />
        </div>

        {/* Steps & Corridor Amenities Feed */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Turn-by-turn Steps */}
          <div className="bg-[#1E4D3A] p-5 rounded-3xl border border-[#163B2E] shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#22C55E] flex items-center space-x-1.5">
              <Route className="w-4 h-4" />
              <span>Turn-by-Turn Navigation</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
              {routeData?.steps && routeData.steps.length > 0 ? (
                routeData.steps.map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-2xl bg-[#0B1F16] border border-[#163B2E] flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#163B2E] text-[#22C55E] border border-[#22C55E]/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[#F8FAF5] font-medium">{st.instruction}</p>
                      <p className="text-[10px] text-[#94B7A8] mt-0.5">
                        {st.distanceMeters > 0 ? `${st.distanceMeters}m` : 'Point'} • ~{Math.round(st.durationSeconds)}s
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94B7A8] py-4 text-center">Calculating route steps...</p>
              )}
            </div>
          </div>

          {/* Corridor Facilities */}
          <div className="bg-[#1E4D3A] p-5 rounded-3xl border border-[#163B2E] shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FAC615] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Facilities Along Path ({routeData?.facilitiesAlongRoute.length || 0})</span>
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {routeData?.facilitiesAlongRoute && routeData.facilitiesAlongRoute.length > 0 ? (
                routeData.facilitiesAlongRoute.map((f) => (
                  <FacilityCard key={f.id} facility={f} compact />
                ))
              ) : (
                <p className="text-xs text-[#94B7A8] py-4 text-center">
                  No registered amenities detected along this corridor yet.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
