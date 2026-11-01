import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Compass } from 'lucide-react';
import { facilityApi } from '../services/api';
import { Facility } from '../types';
import { FacilityCard } from '../components/FacilityCard';
import { useAuth } from '../context/AuthContext';

export const SavedFacilitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadSaved = async () => {
      try {
        const data = await facilityApi.getSaved();
        setFacilities(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadSaved();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#F8FAF5] tracking-tight">Saved Public Facilities</h1>
          <p className="text-xs text-[#94B7A8] mt-1">Your bookmarked public restrooms, water points, and health centers.</p>
        </div>
        <button
          onClick={() => navigate('/explore')}
          className="px-5 py-2.5 bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-1.5 active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-[#1E4D3A] rounded-3xl border border-[#163B2E] text-xs text-[#94B7A8]">
          <div className="w-6 h-6 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading bookmarked facilities...</span>
        </div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-20 bg-[#1E4D3A] rounded-3xl border border-[#163B2E] p-8 space-y-4 shadow-2xl">
          <Bookmark className="w-12 h-12 text-[#FAC615] mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAF5]">No bookmarked facilities yet</h3>
          <p className="text-xs text-[#94B7A8] max-w-sm mx-auto">Tap the bookmark icon on any facility card in the Explore map to save it for quick reference or travel.</p>
          <button
            onClick={() => navigate('/explore')}
            className="px-6 py-2.5 bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-95 transition"
          >
            Discover Facilities
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <FacilityCard key={facility.id} facility={facility} />
          ))}
        </div>
      )}
    </div>
  );
};
