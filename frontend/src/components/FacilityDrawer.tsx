import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Star,
  MapPin,
  Clock,
  Accessibility,
  Navigation,
  AlertTriangle,
  Send,
  MessageSquare
} from 'lucide-react';
import { Facility, FacilityReview } from '../types';
import { facilityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getCategoryIcon, getSourceMeta } from './FacilityCard';

interface FacilityDrawerProps {
  facility: Facility | null;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const FacilityDrawer: React.FC<FacilityDrawerProps> = ({
  facility,
  onClose,
  onReviewSubmitted,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<FacilityReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [cleanlinessLevel, setCleanlinessLevel] = useState<string>('CLEAN');
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!facility) return;
    setReviewSuccess(false);
    setLoadingReviews(true);
    facilityApi.getReviews(facility.id)
      .then((data) => setReviews(data))
      .catch((err) => console.warn('Failed to load reviews:', err))
      .finally(() => setLoadingReviews(false));
  }, [facility?.id]);

  if (!facility) return null;

  const categoryMeta = getCategoryIcon(facility.category);
  const sourceMeta = getSourceMeta(facility.source);
  const IconComponent = categoryMeta.icon;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      const newReview = await facilityApi.addReview(facility.id, {
        rating,
        cleanlinessLevel,
        comment,
      });
      setReviews([newReview, ...reviews]);
      setComment('');
      setReviewSuccess(true);
      onReviewSubmitted?.();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDirections = () => {
    navigate(`/navigation?destLat=${facility.latitude}&destLng=${facility.longitude}&destName=${encodeURIComponent(facility.name)}`);
  };

  const handleReport = () => {
    navigate(`/report?facilityId=${facility.id}&facilityName=${encodeURIComponent(facility.name)}&lat=${facility.latitude}&lng=${facility.longitude}`);
  };

  return (
    <>
      {/* Backdrop for click outside */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] animate-in fade-in duration-200"
      />
      <div className="fixed inset-y-0 right-0 z-[1000] w-full max-w-md bg-[#0F2F22]/95 backdrop-blur-2xl border-l border-[#163B2E] shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 text-left">
      
      {/* Header */}
      <div className="p-6 border-b border-[#163B2E] flex items-start justify-between bg-[#163B2E]/60">
        <div className="flex items-start space-x-3.5">
          <div className={`w-12 h-12 rounded-2xl ${categoryMeta.bg} border ${categoryMeta.border} flex items-center justify-center shrink-0 shadow-lg`}>
            <IconComponent className={`w-6 h-6 ${categoryMeta.color}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryMeta.bg} ${categoryMeta.color} border ${categoryMeta.border} uppercase`}>
                {categoryMeta.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sourceMeta.color}`}>
                {sourceMeta.label}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-[#F8FAF5] mt-1.5 leading-snug">{facility.name}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#94B7A8] hover:text-[#F8FAF5] hover:bg-[#1E4D3A] border border-[#163B2E] transition active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-semibold">Location Area</span>
            <p className="text-[#D1E7D6] font-medium mt-1 truncate">{facility.area || 'Ground Verified'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-semibold">Cleanliness Rating</span>
            <div className="flex items-center space-x-1 mt-1 text-[#FAC615] font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{facility.cleanlinessRating != null ? facility.cleanlinessRating.toFixed(1) : '4.0'} / 5.0</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-semibold">Operational Hours</span>
            <p className="text-[#D1E7D6] font-medium mt-1">{facility.openingHours || '24/7'}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E]">
            <span className="text-[10px] text-[#94B7A8] uppercase font-semibold">Accessibility</span>
            <p className="text-[#22C55E] font-semibold mt-1">
              {facility.isAccessible ? '♿ Barrier-Free Access' : 'Standard Entrance'}
            </p>
          </div>
        </div>

        {/* Address & Direct Actions */}
        <div className="p-4 rounded-2xl bg-[#1E4D3A] border border-[#163B2E] space-y-3">
          <div className="flex items-start space-x-2 text-xs text-[#D1E7D6]">
            <MapPin className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>{facility.address || facility.area || 'Detailed coordinates registered on OpenStreetMap'}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#163B2E]">
            <button
              onClick={handleDirections}
              className="py-2.5 px-3 rounded-xl bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_12px_rgba(34,197,94,0.4)] transition duration-200 active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>In-App Route</span>
            </button>
            <button
              onClick={handleReport}
              className="py-2.5 px-3 rounded-xl bg-[#163B2E] hover:bg-[#EF4444]/20 hover:text-[#EF4444] border border-[#163B2E] text-[#D1E7D6] font-semibold text-xs flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Citizen Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FAC615] flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Citizen Cleanliness Reviews ({reviews.length})</span>
            </h3>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-[#1E4D3A] border border-[#163B2E] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F8FAF5]">Rate Cleanliness:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-[#FAC615] hover:scale-110 transition"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-current' : 'text-[#163B2E]'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {['SPOTLESS', 'CLEAN', 'NEEDS_CLEANING'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCleanlinessLevel(lvl)}
                  className={`py-1 rounded-xl border text-center font-medium transition ${
                    cleanlinessLevel === lvl
                      ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E]'
                      : 'bg-[#163B2E] border-[#163B2E] text-[#94B7A8]'
                  }`}
                >
                  {lvl.replace('_', ' ')}
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share honest feedback about hygiene, water availability, or lighting..."
              rows={2}
              className="w-full bg-[#0B1F16] border border-[#163B2E] rounded-xl p-2.5 text-xs text-[#F8FAF5] placeholder-[#94B7A8] focus:outline-none focus:border-[#22C55E]"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.4)] transition flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingReview ? 'Submitting...' : 'Post Citizen Review'}</span>
            </button>

            {reviewSuccess && (
              <p className="text-[11px] text-[#22C55E] text-center font-semibold animate-in fade-in">
                ✓ Thank you! Your cleanliness rating has updated the facility's score.
              </p>
            )}
          </form>

          {/* Reviews List */}
          <div className="space-y-2.5">
            {loadingReviews ? (
              <p className="text-xs text-[#94B7A8] text-center py-4">Loading citizen reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-[#94B7A8] text-center py-4 bg-[#1E4D3A] rounded-2xl border border-[#163B2E]">
                No citizen reviews yet. Be the first to verify and rate this facility!
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-2xl bg-[#1E4D3A] border border-[#163B2E] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F8FAF5]">{rev.userName}</span>
                    <div className="flex items-center space-x-1 text-[#FAC615]">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="font-bold text-[11px]">{rev.rating}/5</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-semibold">
                    {rev.cleanlinessLevel}
                  </span>
                  {rev.comment && <p className="text-[#D1E7D6] text-[11px] mt-1">{rev.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
    </>
  );
};
