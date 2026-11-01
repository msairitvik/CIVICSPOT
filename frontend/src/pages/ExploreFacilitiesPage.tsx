import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Sliders,
  Accessibility,
  MapPin,
  List,
  Map,
  Layers,
  RefreshCw,
  LocateFixed,
  Sparkles,
  ChevronRight,
  GitCompare,
  AlertCircle,
  HelpCircle,
  Droplets,
  Trash2,
  HeartPulse,
  Pill,
  Shield,
  TreePine,
  Bus,
  Zap
} from 'lucide-react';
import { facilityApi, geocodingApi } from '../services/api';
import { Facility, FacilityCategory, FacilityRecommendation, GeocodingResult } from '../types';
import { FacilityCard } from '../components/FacilityCard';
import { FacilityMap } from '../components/FacilityMap';
import { FacilityDrawer } from '../components/FacilityDrawer';
import { SmartFacilityComparisonModal } from '../components/SmartFacilityComparisonModal';

// Helper to normalize category from URL or input to canonical Enum
export const normalizeCategory = (input?: string | null): FacilityCategory | 'ALL' => {
  if (!input) return 'ALL';
  const norm = input.trim().toUpperCase().replace('-', '_');
  if (norm === 'ALL' || norm === 'ANY') return 'ALL';
  if (norm === 'TOILET' || norm === 'TOILETS' || norm === 'RESTROOM' || norm === 'PUBLIC_TOILET') return 'PUBLIC_TOILET';
  if (norm === 'DUSTBIN' || norm === 'DUSTBINS' || norm === 'WASTE' || norm === 'TRASH') return 'DUSTBIN';
  if (norm === 'WATER' || norm === 'DRINKING_WATER' || norm === 'WATER_ATM') return 'DRINKING_WATER';
  if (norm === 'HOSPITAL' || norm === 'HOSPITALS' || norm === 'CLINIC') return 'HOSPITAL';
  if (norm === 'PHARMACY' || norm === 'PHARMACIES' || norm === 'MEDICAL') return 'PHARMACY';
  if (norm === 'POLICE' || norm === 'POLICE_STATION') return 'POLICE_STATION';
  if (norm === 'PARK' || norm === 'PARKS' || norm === 'PUBLIC_PARK') return 'PUBLIC_PARK';
  if (norm === 'BUS' || norm === 'BUS_STOP' || norm === 'BUS_STATION') return 'BUS_STOP';
  if (norm === 'TRAIN' || norm === 'RAILWAY' || norm === 'RAILWAY_STATION') return 'RAILWAY_STATION';
  if (norm === 'EV' || norm === 'EV_CHARGING') return 'EV_CHARGING';

  const validCategories: FacilityCategory[] = [
    'PUBLIC_TOILET', 'DRINKING_WATER', 'DUSTBIN', 'HOSPITAL',
    'PHARMACY', 'POLICE_STATION', 'BUS_STOP', 'RAILWAY_STATION',
    'PUBLIC_PARK', 'EV_CHARGING'
  ];
  if (validCategories.includes(norm as FacilityCategory)) {
    return norm as FacilityCategory;
  }
  return 'ALL';
};

export const getCategoryDisplayName = (cat: FacilityCategory | 'ALL'): string => {
  switch (cat) {
    case 'DUSTBIN': return 'Waste & Dustbins';
    case 'PUBLIC_TOILET': return 'Public Toilets';
    case 'DRINKING_WATER': return 'Drinking Water ATMs';
    case 'HOSPITAL': return 'Hospitals & Emergency';
    case 'PHARMACY': return 'Pharmacies';
    case 'POLICE_STATION': return 'Police Stations';
    case 'PUBLIC_PARK': return 'Public Parks';
    case 'BUS_STOP': return 'Transport & Bus Stops';
    case 'RAILWAY_STATION': return 'Railway Stations';
    case 'EV_CHARGING': return 'EV Charging';
    default: return 'All Facilities';
  }
};

export const ExploreFacilitiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [recommendations, setRecommendations] = useState<FacilityRecommendation[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  // Category Filter initialized from URL cat, category or search query
  const initialCat = normalizeCategory(
    searchParams.get('cat') || searchParams.get('category') || (
      searchParams.get('search')?.toLowerCase().includes('dustbin') ? 'DUSTBIN' :
      searchParams.get('search')?.toLowerCase().includes('toilet') ? 'PUBLIC_TOILET' :
      searchParams.get('search')?.toLowerCase().includes('water') ? 'DRINKING_WATER' :
      searchParams.get('search')?.toLowerCase().includes('hospital') ? 'HOSPITAL' :
      'ALL'
    )
  );
  const [category, setCategory] = useState<FacilityCategory | 'ALL'>(initialCat);

  // Location filter
  const [userLocation, setUserLocation] = useState<[number, number]>([18.1067, 83.3956]); // Vizianagaram Center
  const [locationName, setLocationName] = useState<string>('Vizianagaram & Denkada');
  const [locationInput, setLocationInput] = useState<string>('');
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodingResult[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  const debounceTimerRef = useRef<any>(null);

  // Additional Filters
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Side-by-side facility comparison
  const [comparedFacilities, setComparedFacilities] = useState<Facility[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Sync category changes with URL search params
  const handleCategorySelect = (newCat: FacilityCategory | 'ALL') => {
    setCategory(newCat);
    const newParams = new URLSearchParams(searchParams);
    if (newCat === 'ALL') {
      newParams.delete('cat');
      newParams.delete('category');
    } else {
      newParams.set('cat', newCat);
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Sync state if URL search query changes externally
  useEffect(() => {
    const urlCat = normalizeCategory(searchParams.get('cat') || searchParams.get('category'));
    if (urlCat !== category) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  // Handle Nominatim Location Input with debounced autocomplete
  const handleLocationInputChange = (val: string) => {
    setLocationInput(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!val || val.trim().length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await geocodingApi.search(val.trim());
        setLocationSuggestions(results);
        setShowLocationDropdown(results.length > 0);
      } catch (err) {
        console.error('Location search failed:', err);
      }
    }, 300);
  };

  const selectLocationSuggestion = (sug: GeocodingResult) => {
    setUserLocation([sug.latitude, sug.longitude]);
    setLocationName(sug.displayName.split(',')[0]);
    setLocationInput(sug.displayName.split(',')[0]);
    setShowLocationDropdown(false);
  };

  const handleUseGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLocationName('Your Current GPS');
          setLocationInput('Current GPS Location');
        },
        () => {
          alert('GPS access was denied. Showing default Vizianagaram coordinates.');
        }
      );
    }
  };

  // Fetch facilities
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await facilityApi.getNearby({
        lat: userLocation[0],
        lng: userLocation[1],
        radius: radiusKm,
        category: category === 'ALL' ? undefined : category,
        accessible: accessibleOnly,
      });

      // Strict client-side filter guarantee
      const strictlyFiltered = category === 'ALL'
        ? data
        : data.filter(f => f.category === category);

      setFacilities(strictlyFiltered);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      const recs = await facilityApi.getRecommendations({
        lat: userLocation[0],
        lng: userLocation[1],
        category: category === 'ALL' ? undefined : category,
        top: 3,
      });

      const strictlyFilteredRecs = category === 'ALL'
        ? recs
        : recs.filter(r => r.facility.category === category);

      setRecommendations(strictlyFilteredRecs);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    }
  };

  useEffect(() => {
    fetchFacilities();
    fetchRecommendations();
  }, [category, radiusKm, accessibleOnly, userLocation]);

  const displayFacilities = facilities.filter(
    (f) => category === 'ALL' || f.category === category
  );

  const displayRecommendations = recommendations.filter(
    (rec) => category === 'ALL' || rec.facility.category === category
  );

  const handleToggleCompare = (facility: Facility) => {
    setComparedFacilities((prev) => {
      const exists = prev.some((item) => item.id === facility.id);
      if (exists) {
        return prev.filter((item) => item.id !== facility.id);
      }
      if (prev.length >= 3) {
        alert("You can compare up to 3 facilities at a time. Please remove one to add another.");
        return prev;
      }
      return [...prev, facility];
    });
  };

  const categories: { label: string; value: FacilityCategory | 'ALL'; icon: any; color: string }[] = [
    { label: 'All Facilities', value: 'ALL', icon: Layers, color: '#22C55E' },
    { label: 'Public Toilets', value: 'PUBLIC_TOILET', icon: HelpCircle, color: '#22C55E' },
    { label: 'Dustbins', value: 'DUSTBIN', icon: Trash2, color: '#FAC615' },
    { label: 'Drinking Water', value: 'DRINKING_WATER', icon: Droplets, color: '#38BDF8' },
    { label: 'Hospitals', value: 'HOSPITAL', icon: HeartPulse, color: '#EF4444' },
    { label: 'Police Stations', value: 'POLICE_STATION', icon: Shield, color: '#34D399' },
    { label: 'Transport', value: 'BUS_STOP', icon: Bus, color: '#FAC615' },
    { label: 'Pharmacies', value: 'PHARMACY', icon: Pill, color: '#F43F5E' },
    { label: 'Public Parks', value: 'PUBLIC_PARK', icon: TreePine, color: '#22C55E' },
    { label: 'EV Charging', value: 'EV_CHARGING', icon: Zap, color: '#FAC615' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      
      {/* Top Filter & Location Search Panel */}
      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {/* Title, Status & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_10px_#22C55E]" />
              <h1 className="text-xl sm:text-2xl font-black text-[#F8FAF5] tracking-tight">
                Public Facility Discovery
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 tracking-wider uppercase">
                Geodata Engine
              </span>
            </div>
            <p className="text-xs text-[#94B7A8] mt-1 font-medium">
              Active region: <span className="text-[#22C55E] font-bold">{locationName}</span> • Radius: <span className="text-[#FAC615] font-bold">{radiusKm} km</span> • Showing: <span className="text-[#F8FAF5] font-bold">{getCategoryDisplayName(category)}</span>
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] p-1 self-start">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'split'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Full Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List Only</span>
            </button>
          </div>
        </div>

        {/* Location Resolution Bar & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Nominatim Place Search with Autocomplete */}
          <div className="md:col-span-6 relative">
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#22C55E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => { if (locationSuggestions.length > 0) setShowLocationDropdown(true); }}
                placeholder="Search place, town or village (e.g. Denkada, Vizianagaram)..."
                className="w-full bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus:border-[#22C55E] text-xs text-[#F8FAF5] pl-10 pr-28 py-3.5 focus:outline-none placeholder-[#94B7A8] font-medium transition shadow-inner"
              />
              <button
                type="button"
                onClick={handleUseGps}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#1E4D3A] hover:bg-[#22C55E] text-[#22C55E] hover:text-[#0B1F16] text-[11px] font-bold rounded-xl border border-[#1E4D3A] transition flex items-center space-x-1 shadow-sm active:scale-95"
                title="Detect GPS"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>My GPS</span>
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showLocationDropdown && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F2F22] border border-[#1E4D3A] rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl">
                {locationSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectLocationSuggestion(sug)}
                    className="w-full text-left px-4 py-3 hover:bg-[#1E4D3A] text-xs text-[#D1E7D6] flex items-start space-x-2.5 border-b border-[#1E4D3A]/60 last:border-none transition"
                  >
                    <MapPin className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#F8FAF5] leading-tight">{sug.displayName.split(',')[0]}</p>
                      <p className="text-[10px] text-[#94B7A8] truncate mt-0.5">{sug.displayName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Radius selector */}
          <div className="md:col-span-3 flex items-center space-x-2.5 bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] px-4 py-3">
            <Sliders className="w-4 h-4 text-[#22C55E] shrink-0" />
            <span className="text-xs text-[#94B7A8] whitespace-nowrap">Radius:</span>
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#22C55E] cursor-pointer"
            />
            <span className="text-xs font-bold text-[#FAC615] whitespace-nowrap font-mono">{radiusKm} km</span>
          </div>

          {/* Accessible toggle */}
          <div className="md:col-span-3 flex items-center justify-between bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] px-4 py-3">
            <div className="flex items-center space-x-2">
              <Accessibility className="w-4 h-4 text-[#22C55E]" />
              <span className="text-xs font-bold text-[#F8FAF5]">Accessible Only</span>
            </div>
            <input
              type="checkbox"
              checked={accessibleOnly}
              onChange={(e) => setAccessibleOnly(e.target.checked)}
              className="w-4 h-4 accent-[#22C55E] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Canonical Category Filter Pills Matching Reference Image 2 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                  isSelected
                    ? 'bg-[#22C55E] text-[#0B1F16] font-black shadow-[0_0_15px_rgba(34,197,94,0.45)]'
                    : 'bg-[#0B1F16] text-[#D1E7D6] hover:text-[#F8FAF5] hover:bg-[#1E4D3A] border border-[#1E4D3A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? '#0B1F16' : cat.color }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Floating Comparison Drawer Pill */}
      {comparedFacilities.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom duration-200">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#FAC615] text-[#0B1F16] font-black text-xs shadow-[0_0_20px_rgba(34,197,94,0.6)] flex items-center space-x-2 border border-[#22C55E] hover:scale-105 transition active:scale-95"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare ({comparedFacilities.length} of 3 Facilities)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {isComparisonOpen && (
        <SmartFacilityComparisonModal
          facilities={comparedFacilities}
          onClose={() => setIsComparisonOpen(false)}
          onRemove={(id) => setComparedFacilities((prev) => prev.filter((f) => f.id !== id))}
        />
      )}

      {/* Recommendations Banner */}
      {displayRecommendations.length > 0 ? (
        <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 sm:p-7 space-y-5 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E4D3A] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#F8FAF5]">
                Recommended {getCategoryDisplayName(category)} near {locationName.split(',')[0]}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#FAC615] font-mono bg-[#FAC615]/15 px-3 py-1 rounded-full border border-[#FAC615]/30 self-start sm:self-auto">
              {displayRecommendations.length} {displayRecommendations.length === 1 ? 'Result' : 'Results'} Ranked
            </span>
          </div>

          {/* Balanced Responsive Grid */}
          <div
            className={`grid gap-4 ${
              displayRecommendations.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : displayRecommendations.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {displayRecommendations.map((rec, index) => (
              <FacilityCard
                key={rec.facility.id}
                facility={rec.facility}
                rankBadge={index + 1}
                recommendationReason={rec.recommendationReason}
                keyStrengths={rec.keyStrengths}
                onSelect={(f) => setSelectedFacility(f)}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedFacilities.some((c) => c.id === rec.facility.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        category !== 'ALL' && !loading && (
          <div className="p-8 rounded-3xl bg-[#1E4D3A] border border-[#163B2E] text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#163B2E] border border-[#1E4D3A] flex items-center justify-center mx-auto text-[#FAC615]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAF5]">
              No {getCategoryDisplayName(category)} found within {radiusKm} km of {locationName.split(',')[0]}
            </h3>
            <p className="text-xs text-[#94B7A8] max-w-md mx-auto">
              There are currently no mapped facilities matching this exact category in this search radius. We never substitute unrelated facilities.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setRadiusKm((prev) => Math.min(50, prev + 15))}
                className="px-4 py-2 rounded-xl bg-[#22C55E] text-[#0B1F16] text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.4)] hover:bg-[#34D399] transition active:scale-95"
              >
                Expand Radius to {Math.min(50, radiusKm + 15)} km
              </button>
              <button
                onClick={() => handleCategorySelect('ALL')}
                className="px-4 py-2 rounded-xl bg-[#163B2E] border border-[#1E4D3A] text-[#D1E7D6] text-xs font-bold hover:text-white transition active:scale-95"
              >
                View All Categories
              </button>
            </div>
          </div>
        )
      )}

      {/* Main Content Area: Split, Map or List Mode */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-extrabold text-[#F8FAF5]">
              All Mapped Facilities
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#163B2E] text-[#94B7A8] border border-[#1E4D3A]">
              {displayFacilities.length}
            </span>
          </div>

          <button
            onClick={fetchFacilities}
            className="flex items-center space-x-1.5 text-xs text-[#94B7A8] hover:text-[#22C55E] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#22C55E]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* View Layouts */}
        {viewMode === 'map' && (
          <div className="rounded-3xl overflow-hidden border border-[#163B2E] shadow-2xl">
            <FacilityMap
              facilities={displayFacilities}
              selectedFacility={selectedFacility}
              onSelectFacility={(f) => setSelectedFacility(f)}
              center={userLocation}
              zoom={13}
              height="650px"
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFacilities.map((f) => (
              <FacilityCard
                key={f.id}
                facility={f}
                onSelect={(selected) => setSelectedFacility(selected)}
                onToggleCompare={handleToggleCompare}
                isCompared={comparedFacilities.some((c) => c.id === f.id)}
              />
            ))}
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Facilities List (5 cols) */}
            <div className="lg:col-span-5 space-y-3 max-h-[680px] overflow-y-auto pr-1">
              {displayFacilities.length > 0 ? (
                displayFacilities.map((f) => (
                  <FacilityCard
                    key={f.id}
                    facility={f}
                    compact={true}
                    onSelect={(selected) => setSelectedFacility(selected)}
                  />
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-[#1E4D3A] border border-[#163B2E] text-center text-xs text-[#94B7A8]">
                  No facilities in this area matching your filters.
                </div>
              )}
            </div>

            {/* Interactive Map (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-[#163B2E] shadow-2xl sticky top-20">
              <FacilityMap
                facilities={displayFacilities}
                selectedFacility={selectedFacility}
                onSelectFacility={(f) => setSelectedFacility(f)}
                center={userLocation}
                zoom={13}
                height="650px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Facility Detail Drawer */}
      {selectedFacility && (
        <FacilityDrawer
          facility={selectedFacility}
          onClose={() => setSelectedFacility(null)}
        />
      )}

    </div>
  );
};
