import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Check,
  AlertCircle,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { complaintApi } from '../services/api';
import { Complaint } from '../types';
import { useAuth } from '../context/AuthContext';

export const ComplaintTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'track' | 'new'>('track');
  const [trackingInput, setTrackingInput] = useState(searchParams.get('track') || '');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  // New Complaint Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SANITATION');
  const [department, setDepartment] = useState('MUNICIPAL_CORPORATION');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const trackCode = searchParams.get('track');
    if (trackCode) {
      setTrackingInput(trackCode);
      executeSearch(trackCode);
    }
  }, [searchParams]);

  const executeSearch = async (num: string) => {
    if (!num.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchedComplaint(null);

    try {
      const c = await complaintApi.track(num.trim());
      setSearchedComplaint(c);
    } catch (e: any) {
      setSearchError('No official grievance found matching tracking number: ' + num);
    } finally {
      setSearching(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(trackingInput);
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/complaints' } } });
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setSubmitSuccess(null);

    try {
      const created = await complaintApi.create({
        title,
        category,
        description,
        department,
        priority,
        address,
      });

      setSubmitSuccess(created.trackingNumber);
      setTitle('');
      setDescription('');
      setAddress('');
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to file grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pipelineStages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Under Review' },
    { key: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
  ];

  const getStageIndex = (status: string) => {
    const idx = pipelineStages.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">
          Grievance & Complaint Portal
        </h1>
        <p className="text-sm text-[#94B7A8] max-w-lg mx-auto">
          File official municipal complaints, track progress step-by-step, and verify municipal resolution notes.
        </p>

        {/* Tab switcher */}
        <div className="flex items-center justify-center pt-4">
          <div className="bg-[#163B2E] border border-[#1E4D3A] p-1.5 rounded-full flex space-x-1.5 shadow-xl">
            <button
              onClick={() => setActiveTab('track')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
                activeTab === 'track'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
            >
              Track by Code
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition active:scale-95 ${
                activeTab === 'new'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : 'text-[#94B7A8] hover:text-[#F8FAF5]'
              }`}
            >
              File New Grievance
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: TRACKING */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          
          {/* Tracking Search Input Card */}
          <div className="bg-[#1E4D3A] p-6 sm:p-8 border border-[#163B2E] rounded-3xl max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-[#F8FAF5] uppercase tracking-wider">
                Enter Official Tracking Code
              </label>
              <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#163B2E] focus-within:border-[#22C55E] px-4 py-3 transition shadow-inner">
                <Search className="w-4 h-4 text-[#22C55E] mr-2" />
                <input
                  type="text"
                  required
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="e.g. CIV-2026-9F4A1C"
                  className="w-full bg-transparent text-xs text-[#F8FAF5] font-mono uppercase focus:outline-none placeholder-[#94B7A8] font-bold"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="px-5 py-2 bg-[#FAC615] text-[#0B1F16] rounded-xl text-xs font-black hover:bg-[#eab308] transition shrink-0 shadow-[0_0_12px_rgba(250,198,21,0.4)] active:scale-95"
                >
                  {searching ? 'Tracking...' : 'Track'}
                </button>
              </div>
              <p className="text-[11px] text-[#94B7A8]">
                Demo grievance code: <button type="button" onClick={() => executeSearch('CIV-2026-9F4A1C')} className="font-mono text-[#FAC615] font-bold underline">CIV-2026-9F4A1C</button>
              </p>
            </form>

            {searchError && (
              <div className="mt-4 p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-2xl text-xs text-[#EF4444] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Searched Complaint Display */}
          {searchedComplaint && (
            <div className="bg-[#1E4D3A] p-6 sm:p-10 border border-[#163B2E] rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#163B2E]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-[#22C55E]/15 text-[#22C55E] px-3 py-1 rounded-full border border-[#22C55E]/30">
                      #{searchedComplaint.trackingNumber}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAC615]/15 text-[#FAC615] border border-[#FAC615]/30">
                      {searchedComplaint.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#F8FAF5] mt-2">{searchedComplaint.title}</h2>
                  <p className="text-xs text-[#94B7A8] flex items-center space-x-1.5 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Department: {searchedComplaint.department.replace(/_/g, ' ')}</span>
                  </p>
                </div>

                <div className="text-right text-xs text-[#94B7A8]">
                  <span>Filed on {new Date(searchedComplaint.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Timeline Pipeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#FAC615] uppercase tracking-wider">
                  5-Stage Resolution Status Pipeline
                </h3>
                
                <div className="grid grid-cols-5 gap-2 relative">
                  {pipelineStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(searchedComplaint.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center space-y-2">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                            isCompleted
                              ? 'bg-[#22C55E] text-[#0B1F16] shadow-[0_0_12px_rgba(34,197,94,0.4)] border border-[#22C55E]'
                              : 'bg-[#0B1F16] border border-[#163B2E] text-[#94B7A8]'
                          } ${isCurrent ? 'ring-4 ring-[#FAC615]/40' : ''}`}
                        >
                          {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span className={`text-[10px] ${isCurrent ? 'font-bold text-[#22C55E]' : 'text-[#94B7A8]'}`}>
                          {stage.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description & Address */}
              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] space-y-2 text-xs">
                <span className="font-bold text-[#F8FAF5] uppercase text-[10px] tracking-wider">Official Description</span>
                <p className="text-[#D1E7D6] leading-relaxed">{searchedComplaint.description}</p>
                {searchedComplaint.address && (
                  <p className="text-[11px] text-[#94B7A8] flex items-center space-x-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{searchedComplaint.address}</span>
                  </p>
                )}
              </div>

              {/* Resolution Note if resolved */}
              {searchedComplaint.resolutionNotes && (
                <div className="p-4 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 space-y-1.5 text-xs">
                  <span className="font-bold text-[#22C55E] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#FAC615]" />
                    <span>Municipal Action & Resolution Note</span>
                  </span>
                  <p className="text-[#F8FAF5]">{searchedComplaint.resolutionNotes}</p>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* TAB 2: FILE NEW GRIEVANCE */}
      {activeTab === 'new' && (
        <div className="bg-[#1E4D3A] p-6 sm:p-10 border border-[#163B2E] rounded-3xl max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
          
          {submitSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E] text-xs text-[#22C55E] space-y-1">
              <p className="font-bold text-sm">✓ Grievance registered successfully!</p>
              <p>Your official municipal tracking number is: <span className="font-mono font-black text-[#FAC615]">{submitSuccess}</span></p>
              <p className="text-[11px] text-[#94B7A8]">You can use this code in the "Track by Code" tab to check realtime updates.</p>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444] text-xs text-[#EF4444]">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateComplaint} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#F8FAF5]">Grievance Subject / Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken RO Water Tap at Bus Station, Garbage Piles..."
                className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] placeholder-[#94B7A8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#F8FAF5]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="SANITATION">Sanitation & Garbage</option>
                  <option value="WATER">Drinking Water</option>
                  <option value="ROADS">Roads & Pavements</option>
                  <option value="STREETLIGHTS">Streetlighting</option>
                  <option value="PUBLIC_HEALTH">Public Health</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#F8FAF5]">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="MUNICIPAL_CORPORATION">Municipal Corporation</option>
                  <option value="PUBLIC_WORKS">Public Works (PWD)</option>
                  <option value="WATER_BOARD">Water & Sewerage Board</option>
                  <option value="ELECTRICITY_BOARD">Electricity Board</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#F8FAF5]">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#F8FAF5]">Location Address / Landmark</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or landmark near Vizianagaram or Denkada..."
                className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] placeholder-[#94B7A8]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#F8FAF5]">Detailed Description *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem, hazard severity, and duration..."
                className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-3 text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] placeholder-[#94B7A8]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-[#FAC615] hover:bg-[#eab308] text-[#0B1F16] font-black text-xs shadow-[0_0_20px_rgba(250,198,21,0.5)] transition active:scale-95"
            >
              {submitting ? 'Registering Grievance...' : 'Submit Official Grievance'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
