import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Accessibility,
  Navigation,
  AlertTriangle,
  Bookmark,
  Clock,
  Trash2,
  Droplets,
  HeartPulse,
  Pill,
  Shield,
  Bus,
  Train,
  TreePine,
  Zap,
  Building2,
  HelpCircle,
  Sparkles,
  GitCompare
} from 'lucide-react';
import { Facility, FacilityCategory } from '../types';
import { facilityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FacilityCardProps {
  facility: Facility;
  onSelect?: (facility: Facility) => void;
  compact?: boolean;
  recommendationReason?: string;
  keyStrengths?: string[];
  rankBadge?: number;
  onToggleCompare?: (facility: Facility) => void;
  isCompared?: boolean;
}

export const getCategoryIcon = (category: FacilityCategory | string) => {
  const norm = String(category || '').toUpperCase();
  if (norm === 'PUBLIC_TOILET' || norm === 'TOILET' || norm === 'TOILETS') {
    return {
      icon: HelpCircle,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/15',
      border: 'border-[#22C55E]/30',
      borderAccent: 'border-t-[#22C55E]',
      label: 'Public Restroom'
    };
  }
  if (norm === 'DRINKING_WATER' || norm === 'WATER') {
    return {
      icon: Droplets,
      color: 'text-[#38BDF8]',
      bg: 'bg-[#38BDF8]/15',
      border: 'border-[#38BDF8]/30',
      borderAccent: 'border-t-[#38BDF8]',
      label: 'Drinking Water'
    };
  }
  if (norm === 'DUSTBIN' || norm === 'DUSTBINS' || norm === 'WASTE') {
    return {
      icon: Trash2,
      color: 'text-[#FAC615]',
      bg: 'bg-[#FAC615]/15',
      border: 'border-[#FAC615]/30',
      borderAccent: 'border-t-[#FAC615]',
      label: 'Waste & Dustbins'
    };
  }
  if (norm === 'HOSPITAL' || norm === 'HOSPITALS') {
    return {
      icon: HeartPulse,
      color: 'text-[#EF4444]',
      bg: 'bg-[#EF4444]/15',
      border: 'border-[#EF4444]/30',
      borderAccent: 'border-t-[#EF4444]',
      label: 'Hospital & Emergency'
    };
  }
  if (norm === 'PHARMACY' || norm === 'PHARMACIES') {
    return {
      icon: Pill,
      color: 'text-[#F43F5E]',
      bg: 'bg-[#F43F5E]/15',
      border: 'border-[#F43F5E]/30',
      borderAccent: 'border-t-[#F43F5E]',
      label: 'Pharmacy'
    };
  }
  if (norm === 'POLICE_STATION' || norm === 'POLICE') {
    return {
      icon: Shield,
      color: 'text-[#34D399]',
      bg: 'bg-[#34D399]/15',
      border: 'border-[#34D399]/30',
      borderAccent: 'border-t-[#34D399]',
      label: 'Police Station'
    };
  }
  if (norm === 'BUS_STOP' || norm === 'BUS') {
    return {
      icon: Bus,
      color: 'text-[#FAC615]',
      bg: 'bg-[#FAC615]/15',
      border: 'border-[#FAC615]/30',
      borderAccent: 'border-t-[#FAC615]',
      label: 'Bus Stop'
    };
  }
  if (norm === 'RAILWAY_STATION' || norm === 'RAILWAY') {
    return {
      icon: Train,
      color: 'text-[#38BDF8]',
      bg: 'bg-[#38BDF8]/15',
      border: 'border-[#38BDF8]/30',
      borderAccent: 'border-t-[#38BDF8]',
      label: 'Railway Station'
    };
  }
  if (norm === 'PUBLIC_PARK' || norm === 'PARK') {
    return {
      icon: TreePine,
      color: 'text-[#22C55E]',
      bg: 'bg-[#22C55E]/15',
      border: 'border-[#22C55E]/30',
      borderAccent: 'border-t-[#22C55E]',
      label: 'Public Park'
    };
  }
  if (norm === 'EV_CHARGING' || norm === 'EV') {
    return {
      icon: Zap,
      color: 'text-[#FAC615]',
      bg: 'bg-[#FAC615]/15',
      border: 'border-[#FAC615]/30',
      borderAccent: 'border-t-[#FAC615]',
      label: 'EV Charging'
    };
  }
  return {
    icon: Building2,
    color: 'text-[#D1E7D6]',
    bg: 'bg-[#163B2E]',
    border: 'border-[#163B2E]',
    borderAccent: 'border-t-[#22C55E]',
    label: 'Civic Facility'
  };
};

export const getSourceMeta = (source?: string) => {
  const norm = String(source || '').toUpperCase();
  if (norm.includes('OSM') || norm.includes('OPENSTREETMAP')) {
    return { label: 'OSM MAPPED', color: 'text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10' };
  }
  if (norm.includes('CITIZEN')) {
    return { label: 'CITIZEN REPORTED', color: 'text-[#FAC615] border-[#FAC615]/30 bg-[#FAC615]/10' };
  }
  if (norm.includes('COMMUNITY')) {
    return { label: 'COMMUNITY SUPPORTED', color: 'text-[#34D399] border-[#34D399]/30 bg-[#34D399]/10' };
  }
  if (norm.includes('OFFICIAL')) {
    return { label: 'OFFICIALLY VERIFIED', color: 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/15 font-black' };
  }
  if (norm.includes('ADMIN')) {
    return { label: 'ADMIN VERIFIED', color: 'text-[#22C55E] border-[#22C55E]/40 bg-[#22C55E]/15' };
  }
  return { label: 'CIVIC VERIFIED', color: 'text-[#94B7A8] border-[#163B2E] bg-[#163B2E]' };
};

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onSelect,
  compact = false,
  recommendationReason,
  keyStrengths,
  rankBadge,
  onToggleCompare,
  isCompared = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const categoryMeta = getCategoryIcon(facility.category);
  const sourceMeta = getSourceMeta(facility.source);
  const IconComponent = categoryMeta.icon;

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      const res = await facilityApi.toggleSave(facility.id);
      setIsSaved(res.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/navigation?destLat=${facility.latitude}&destLng=${facility.longitude}&destName=${encodeURIComponent(facility.name)}`);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/report?facilityId=${facility.id}&facilityName=${encodeURIComponent(facility.name)}&lat=${facility.latitude}&lng=${facility.longitude}`);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare?.(facility);
  };

  if (compact) {
    return (
      <div
        onClick={() => onSelect?.(facility)}
        className="p-3.5 bg-[#1E4D3A]/80 hover:bg-[#1E4D3A] border border-[#163B2E] hover:border-[#22C55E]/50 rounded-2xl transition cursor-pointer flex items-center justify-between space-x-3 group text-left shadow-lg"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${categoryMeta.bg} border ${categoryMeta.border} flex items-center justify-center shrink-0`}>
            <IconComponent className={`w-5 h-5 ${categoryMeta.color}`} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#F8FAF5] truncate group-hover:text-[#22C55E] transition">
              {facility.name}
            </h4>
            <div className="flex items-center space-x-2 text-[10px] text-[#94B7A8]">
              <span>{categoryMeta.label}</span>
              {facility.distanceKm !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-[#FAC615]">~{facility.distanceKm} km</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleDirections}
          className="p-2 bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] rounded-xl shrink-0 text-xs flex items-center space-x-1 shadow-[0_0_12px_rgba(34,197,94,0.4)] transition active:scale-95 font-bold"
          title="In-App Navigation"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect?.(facility)}
      className={`relative bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/60 border-t-[3px] ${categoryMeta.borderAccent} rounded-2xl p-5 flex flex-col justify-between space-y-4 cursor-pointer group text-left shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition duration-200`}
    >
      {/* Top Ranked Recommendation Badge */}
      {rankBadge && (
        <div className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#FAC615] text-[#0B1F16] text-[10px] font-black tracking-widest flex items-center space-x-1.5 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10 uppercase">
          <Sparkles className="w-3 h-3 fill-current text-[#0B1F16]" />
          <span>Top #{rankBadge} Recommendation</span>
        </div>
      )}

      {/* Header Area */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className={`w-11 h-11 rounded-2xl ${categoryMeta.bg} border ${categoryMeta.border} flex items-center justify-center shrink-0 shadow-md`}>
              <IconComponent className={`w-6 h-6 ${categoryMeta.color}`} />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border} uppercase tracking-wider`}>
                  {categoryMeta.label}
                </span>

                {/* Evidence Source Badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sourceMeta.color}`}>
                  {sourceMeta.label}
                </span>

                {facility.isFree ? (
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/15 border border-[#22C55E]/30 px-2 py-0.5 rounded-full">
                    Free Access
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-full">
                    {facility.fee || 'Regulated Fee'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-extrabold text-[#F8FAF5] mt-1.5 line-clamp-1 group-hover:text-[#22C55E] transition">
                {facility.name}
              </h3>
            </div>
          </div>

          {/* Action Icons: Compare & Bookmark */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {onToggleCompare && (
              <button
                type="button"
                onClick={handleCompareClick}
                className={`p-2 rounded-xl border transition text-xs flex items-center space-x-1 ${
                  isCompared
                    ? 'bg-[#22C55E] text-[#0B1F16] border-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                    : 'bg-[#163B2E] border-[#163B2E] text-[#94B7A8] hover:text-[#F8FAF5] hover:border-[#22C55E]/50'
                }`}
                title={isCompared ? "Remove from comparison" : "Add to side-by-side comparison"}
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`p-2 rounded-xl border transition ${
                isSaved
                  ? 'bg-[#FAC615]/20 border-[#FAC615] text-[#FAC615]'
                  : 'bg-[#163B2E] border-[#163B2E] text-[#94B7A8] hover:text-[#F8FAF5] hover:border-[#22C55E]/40'
              }`}
              title="Save facility"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Address & Proximity */}
        <div className="mt-3 space-y-1.5 text-xs text-[#94B7A8]">
          <div className="flex items-start space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
            <span className="line-clamp-2 text-[#D1E7D6]">
              {facility.address || facility.area || 'Ground coordinates verified'}
            </span>
          </div>

          <div className="flex items-center space-x-4 pt-1 text-[11px]">
            {facility.openingHours && (
              <div className="flex items-center space-x-1 text-[#94B7A8]">
                <Clock className="w-3 h-3 text-[#22C55E]" />
                <span>{facility.openingHours}</span>
              </div>
            )}
            {facility.distanceKm !== undefined && (
              <div className="flex items-center space-x-1 font-bold text-[#FAC615]">
                <Navigation className="w-3 h-3" />
                <span>~{facility.distanceKm} km away</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Reason Banner */}
        {recommendationReason && (
          <div className="mt-3 p-3 rounded-2xl bg-[#163B2E]/90 border border-[#163B2E] text-xs">
            <p className="text-[11px] text-[#D1E7D6] leading-snug font-medium">
              💡 <span className="text-[#F8FAF5] font-semibold">{recommendationReason}</span>
            </p>
            {keyStrengths && keyStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {keyStrengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 font-semibold"
                  >
                    ✓ {str}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reviews & Actions Footer */}
      <div className="pt-3 border-t border-[#163B2E] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {/* Cleanliness Rating with Review Count */}
          <div className="flex items-center space-x-1 bg-[#163B2E] px-2.5 py-1 rounded-xl border border-[#163B2E]">
            <Star className="w-3.5 h-3.5 text-[#FAC615] fill-current" />
            {facility.totalReviews && facility.totalReviews > 0 ? (
              <>
                <span className="font-bold text-[#F8FAF5] text-[11px]">
                  {facility.cleanlinessRating != null ? facility.cleanlinessRating.toFixed(1) : '4.0'}
                </span>
                <span className="text-[10px] text-[#94B7A8]">({facility.totalReviews})</span>
              </>
            ) : (
              <span className="text-[10px] text-[#94B7A8] font-medium">Verified Mapped</span>
            )}
          </div>

          {/* Genuine Accessibility Badge */}
          {facility.isAccessible && (
            <div
              className="flex items-center space-x-1 bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 px-2 py-1 rounded-xl text-[10px] font-bold"
              title="Verified Barrier-Free Ramp Access"
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Ramp Ready</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReport}
            className="p-2 rounded-xl text-[#94B7A8] hover:text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#163B2E] transition active:scale-95"
            title="Report facility problem or update details"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDirections}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.4)] transition duration-200 active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
