import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Sparkles,
  MapPin,
  Camera
} from 'lucide-react';
import { reportApi } from '../services/api';
import { FacilityReport } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reports, setReports] = useState<FacilityReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadReports = async () => {
      setLoading(true);
      try {
        const data = await reportApi.getUserReports();
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [user]);

  const filteredReports = filterStatus === 'ALL'
    ? reports
    : reports.filter((r) => r.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 font-bold';
      case 'IN_PROGRESS':
        return 'bg-[#FAC615]/15 text-[#FAC615] border border-[#FAC615]/40 font-bold';
      case 'UNDER_REVIEW':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 font-bold';
      default:
        return 'bg-[#163B2E] text-[#D1E7D6] border border-[#1E4D3A]';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">My Submitted Reports</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 uppercase tracking-wider">
              Citizen Ledger
            </span>
          </div>
          <p className="text-xs text-[#94B7A8] mt-1 font-medium">Track the status, Gemini Vision inspection, and official municipal resolution notes for issues you reported.</p>
        </div>

        <button
          onClick={() => navigate('/report')}
          className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-1.5 self-start active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
              filterStatus === st
                ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)] font-black'
                : 'bg-[#163B2E] text-[#D1E7D6] border border-[#1E4D3A] hover:bg-[#1E4D3A] hover:text-[#F8FAF5]'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="py-20 text-center text-[#94B7A8] bg-[#1E4D3A] rounded-3xl border border-[#163B2E]">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading citizen reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center text-[#94B7A8] bg-[#1E4D3A] rounded-3xl border border-[#163B2E] space-y-3">
          <p className="text-sm font-bold text-[#F8FAF5]">No reports matching this status filter.</p>
          <button
            onClick={() => navigate('/report')}
            className="px-5 py-2.5 rounded-full bg-[#22C55E] text-[#0B1F16] text-xs font-bold"
          >
            Report an Issue Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((r) => (
            <div
              key={r.id}
              className="bg-[#1E4D3A] border border-[#163B2E] rounded-3xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#163B2E]">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-3 py-1 rounded-full ${getStatusBadge(r.status)}`}>
                    {r.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAC615]/15 text-[#FAC615] border border-[#FAC615]/30">
                    {r.severity} Priority
                  </span>
                </div>
                <span className="text-xs text-[#94B7A8]">
                  Reported on {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F8FAF5]">{r.facilityName || r.issueCategory.replace(/_/g, ' ')}</h3>
                <p className="text-xs text-[#D1E7D6] mt-1 leading-relaxed">{r.description}</p>
                {r.address && (
                  <p className="text-xs text-[#94B7A8] flex items-center space-x-1 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{r.address}</span>
                  </p>
                )}
              </div>

              {/* Gemini Vision Assessment Banner */}
              {r.aiAssessment && (
                <div className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/30 space-y-1 text-xs">
                  <span className="font-bold text-[#22C55E] flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FAC615]" />
                    <span>Gemini Vision Assessment</span>
                  </span>
                  <p className="text-[#D1E7D6]">{r.aiAssessment}</p>
                </div>
              )}

              {/* Official Resolution Note */}
              {r.adminNotes && (
                <div className="p-3.5 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#F8FAF5] space-y-1">
                  <span className="font-bold text-[#22C55E]">✓ Municipal Resolution Note:</span>
                  <p>{r.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
