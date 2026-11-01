import React from 'react';
import { X, Check, AlertCircle, Star, Navigation } from 'lucide-react';
import { Facility } from '../types';
import { getCategoryIcon, getSourceMeta } from './FacilityCard';
import { useNavigate } from 'react-router-dom';

interface SmartFacilityComparisonModalProps {
  facilities: Facility[];
  onClose: () => void;
  onRemove: (id: number) => void;
}

export const SmartFacilityComparisonModal: React.FC<SmartFacilityComparisonModalProps> = ({
  facilities,
  onClose,
  onRemove,
}) => {
  const navigate = useNavigate();

  if (facilities.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-5xl bg-[#163B2E] border border-[#1E4D3A] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {/* Header */}
        <div className="p-6 border-b border-[#1E4D3A] flex items-center justify-between bg-[#0F2F22]/70">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]" />
              <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest">
                Smart Facility Intelligence
              </span>
            </div>
            <h2 className="text-xl font-black text-[#F8FAF5] mt-1">
              Side-by-Side Facility Comparison ({facilities.length} of 3)
            </h2>
            <p className="text-xs text-[#94B7A8] mt-0.5">
              Verified ground comparisons across accessibility, cleanliness, cost, and reliability.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E] hover:bg-[#22C55E] text-[#94B7A8] hover:text-[#0B1F16] transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid Table */}
        <div className="p-6 overflow-x-auto overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-4 min-w-[700px]">
            
            {/* Criteria Column */}
            <div className="space-y-4 pt-16 text-xs font-semibold text-[#94B7A8]">
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Category</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Proximity</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Cleanliness Rating</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Wheelchair Accessibility</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Ramp Access</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Access Fee / Tariff</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Operating Hours</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Operating Status</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Data Verification Source</div>
              <div className="p-3 rounded-xl bg-[#0B1F16] border border-[#1E4D3A]">Direct Navigation</div>
            </div>

            {/* Facility Columns */}
            {facilities.map((f) => {
              const catMeta = getCategoryIcon(f.category);
              const sourceMeta = getSourceMeta(f.source);
              return (
                <div key={f.id} className="space-y-4 bg-[#1E4D3A] p-4 rounded-2xl border border-[#163B2E] relative">
                  
                  {/* Remove pill */}
                  <div className="flex items-start justify-between pb-2 border-b border-[#163B2E]">
                    <div className="min-w-0 pr-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color} border ${catMeta.border}`}>
                        {catMeta.label}
                      </span>
                      <h4 className="text-sm font-bold text-[#F8FAF5] truncate mt-1.5">{f.name}</h4>
                      <p className="text-[11px] text-[#94B7A8] truncate">{f.address || f.area || 'Ground verified'}</p>
                    </div>
                    <button
                      onClick={() => onRemove(f.id)}
                      className="p-1 rounded-lg text-[#94B7A8] hover:text-[#EF4444] hover:bg-[#EF4444]/15"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Category */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold text-[#F8FAF5]">
                    {catMeta.label}
                  </div>

                  {/* Proximity */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold text-[#FAC615]">
                    {f.distanceKm !== undefined ? `~${f.distanceKm} km` : 'Near Vizianagaram'}
                  </div>

                  {/* Cleanliness Rating */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold text-[#FAC615] flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{f.cleanlinessRating != null ? f.cleanlinessRating.toFixed(1) : '4.0'} / 5.0</span>
                  </div>

                  {/* Accessibility */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold">
                    {f.isAccessible ? (
                      <span className="text-[#22C55E] flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Barrier-Free</span>
                      </span>
                    ) : (
                      <span className="text-[#94B7A8] flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Standard</span>
                      </span>
                    )}
                  </div>

                  {/* Ramp Access */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold">
                    {f.hasRamp ? (
                      <span className="text-[#22C55E] flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ramp Available</span>
                      </span>
                    ) : (
                      <span className="text-[#94B7A8]">No Ramp</span>
                    )}
                  </div>

                  {/* Fee */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold text-[#FAC615]">
                    {f.isFree ? 'Free Access' : f.fee || 'Regulated Fee'}
                  </div>

                  {/* Operating Hours */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-medium text-[#D1E7D6]">
                    {f.openingHours || '24/7 Service'}
                  </div>

                  {/* Operating Status */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-bold text-[#22C55E]">
                    {f.operationalStatus || 'OPERATIONAL'}
                  </div>

                  {/* Data Verification Source */}
                  <div className="p-3 rounded-xl bg-[#0B1F16] text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${sourceMeta.color}`}>
                      {sourceMeta.label}
                    </span>
                  </div>

                  {/* Navigation */}
                  <div className="pt-2">
                    <button
                      onClick={() => navigate(`/navigation?destLat=${f.latitude}&destLng=${f.longitude}&destName=${encodeURIComponent(f.name)}`)}
                      className="w-full py-2 px-3 rounded-xl bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-[0_0_12px_rgba(34,197,94,0.4)] transition active:scale-95"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Route</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
