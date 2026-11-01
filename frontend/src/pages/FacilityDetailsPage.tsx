import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  Accessibility,
  Navigation,
  AlertTriangle,
  Bookmark,
  Share2,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { facilityApi } from '../services/api';
import { Facility } from '../types';
import { FacilityMap } from '../components/FacilityMap';
import { getCategoryIcon, getSourceMeta } from '../components/FacilityCard';
import { useAuth } from '../context/AuthContext';

export const FacilityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [facility, setFacility] = useState<Facility | null>(null);
  const [nearby, setNearby] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadFacility = async () => {
      setLoading(true);
      try {
        const data = await facilityApi.getById(Number(id));
        setFacility(data);

        // Fetch other nearby facilities
        const alt = await facilityApi.getNearby({
          lat: data.latitude,
          lng: data.longitude,
          radius: 5,
        });
        setNearby(alt.filter((f) => f.id !== data.id).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadFacility();
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!facility) return;
    try {
      const res = await facilityApi.toggleSave(facility.id);
      setIsSaved(res.saved);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#94B7A8] bg-[#1E4D3A] rounded-3xl border border-[#163B2E] mt-8">
        <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading facility information...</span>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-[#1E4D3A] rounded-3xl border border-[#163B2E] mt-8 p-8">
        <h2 className="text-lg font-bold text-[#F8FAF5]">Facility not found</h2>
        <button
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 bg-[#22C55E] text-[#0B1F16] rounded-full text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 transition"
        >
          Return to Explore Map
        </button>
      </div>
    );
  }

  const categoryMeta = getCategoryIcon(facility.category);
  const sourceMeta = getSourceMeta(facility.source);
  const IconComponent = categoryMeta.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1.5 text-xs text-[#94B7A8] hover:text-[#22C55E] transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to results</span>
      </button>

      {/* Main Hero Card */}
      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#1E4D3A]">
          <div className="flex items-start space-x-4">
            <div className={`w-14 h-14 rounded-2xl ${categoryMeta.bg} border ${categoryMeta.border} flex items-center justify-center shrink-0 shadow-lg`}>
              <IconComponent className={`w-7 h-7 ${categoryMeta.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border} uppercase`}>
                  {categoryMeta.label}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sourceMeta.color}`}>
                  {sourceMeta.label}
                </span>
                {facility.isFree ? (
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                    Free Public Access
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-full">
                    {facility.fee || 'Regulated Fee'}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAF5] mt-2">{facility.name}</h1>
              <p className="text-xs text-[#94B7A8] flex items-center space-x-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>{facility.address || facility.area || 'Ground coordinates verified on OpenStreetMap'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-start md:self-auto">
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-2xl border transition ${
                isSaved
                  ? 'bg-[#FAC615]/20 border-[#FAC615] text-[#FAC615]'
                  : 'bg-[#0B1F16] border-[#1E4D3A] text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => navigate(`/navigation?destLat=${facility.latitude}&destLng=${facility.longitude}&destName=${encodeURIComponent(facility.name)}`)}
              className="px-6 py-3 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-2 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Start Directions</span>
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold">Cleanliness Rating</span>
            <div className="flex items-center space-x-1 mt-1 text-[#FAC615] font-black text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span>{facility.cleanlinessRating != null ? facility.cleanlinessRating.toFixed(1) : '4.0'} / 5.0</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold">Operating Hours</span>
            <p className="text-[#F8FAF5] font-bold mt-1">{facility.openingHours || '24 Hours Open'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold">Accessibility</span>
            <p className="text-[#22C55E] font-bold mt-1">
              {facility.isAccessible ? '♿ Barrier-Free Access' : 'Standard Access'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold">Status</span>
            <p className="text-[#22C55E] font-bold mt-1">
              {facility.operationalStatus || 'OPERATIONAL'}
            </p>
          </div>
        </div>

        {/* Embedded Map */}
        <div className="rounded-3xl overflow-hidden border border-[#1E4D3A] shadow-2xl">
          <FacilityMap
            facilities={[facility]}
            selectedFacility={facility}
            center={[facility.latitude, facility.longitude]}
            zoom={16}
            height="400px"
          />
        </div>
      </div>

    </div>
  );
};
