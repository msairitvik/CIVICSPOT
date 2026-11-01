import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  AlertTriangle,
  FileText,
  Navigation,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Droplets,
  HelpCircle,
  Trash2,
  HeartPulse,
  Activity,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportApi, complaintApi, facilityApi } from '../services/api';
import { FacilityReport, Complaint, Facility } from '../types';

export const CitizenDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<FacilityReport[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [savedFacilities, setSavedFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [repData, compData, savedData] = await Promise.allSettled([
          reportApi.getUserReports(),
          complaintApi.getUserComplaints(),
          facilityApi.getSaved(),
        ]);

        if (repData.status === 'fulfilled') setReports(repData.value);
        if (compData.status === 'fulfilled') setComplaints(compData.value);
        if (savedData.status === 'fulfilled') setSavedFacilities(savedData.value);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Public Restrooms',
      desc: 'Wheelchair & hygiene verified',
      icon: HelpCircle,
      color: 'text-[#22C55E]',
      border: 'border-t-[#22C55E]',
      bg: 'bg-[#22C55E]/15',
      link: '/explore?category=TOILETS'
    },
    {
      title: 'Drinking Water ATMs',
      desc: 'Free municipal & RO water plants',
      icon: Droplets,
      color: 'text-[#38BDF8]',
      border: 'border-t-[#38BDF8]',
      bg: 'bg-[#38BDF8]/15',
      link: '/explore?category=DRINKING_WATER'
    },
    {
      title: 'Hospital & Trauma',
      desc: '24/7 casualty & emergency care',
      icon: HeartPulse,
      color: 'text-[#EF4444]',
      border: 'border-t-[#EF4444]',
      bg: 'bg-[#EF4444]/15',
      link: '/explore?category=HOSPITALS'
    },
    {
      title: 'Waste & Dustbins',
      desc: 'Segregated municipal disposal hubs',
      icon: Trash2,
      color: 'text-[#FAC615]',
      border: 'border-t-[#FAC615]',
      bg: 'bg-[#FAC615]/15',
      link: '/explore?category=DUSTBINS'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Welcome Banner */}
      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* User Profile & Badges */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#22C55E] text-[#0B1F16] font-black text-xl sm:text-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center shrink-0 border border-[#22C55E]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[11px] font-black border border-[#22C55E]/30 tracking-wider uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  <span>My City Citizen Hub</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#34D399]/15 text-[#34D399] text-[11px] font-bold border border-[#34D399]/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Citizen</span>
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAF5]">
                Welcome back, {user ? user.name.split(' ')[0] : 'Citizen'}
              </h1>
              
              <p className="text-xs text-[#94B7A8] max-w-xl leading-relaxed flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                <span>Vizianagaram & Denkada District • Manage community reports, track official grievances & access verified amenities.</span>
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-y-2">
            <button
              onClick={() => navigate('/ai-chat')}
              className="px-5 py-3 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#0B1F16]" />
              <span>Ask CIVIC AI</span>
            </button>
            <button
              onClick={() => navigate('/report')}
              className="px-5 py-3 rounded-full bg-[#1E4D3A] hover:bg-[#EF4444]/20 text-[#F8FAF5] hover:text-[#EF4444] text-xs font-bold border border-[#163B2E] transition flex items-center space-x-2 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span>Report Problem</span>
            </button>
            <button
              onClick={() => navigate('/navigation')}
              className="px-4 py-3 rounded-full bg-[#1E4D3A] hover:bg-[#FAC615]/20 text-[#D1E7D6] hover:text-[#FAC615] text-xs font-bold border border-[#163B2E] transition flex items-center space-x-1.5 active:scale-95"
            >
              <Navigation className="w-4 h-4 text-[#FAC615]" />
              <span className="hidden sm:inline">Navigate</span>
            </button>
          </div>

        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Grievances */}
        <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#22C55E] rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94B7A8] uppercase tracking-wider">Active Grievances</span>
            <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center border border-[#22C55E]/30">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#22C55E]">
            {complaints.filter((c) => c.status !== 'RESOLVED').length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94B7A8] pt-1 border-t border-[#163B2E]">
            <span>{complaints.length} Total Filed</span>
            <Link to="/complaints" className="text-[#22C55E] font-bold hover:underline">Track &gt;</Link>
          </div>
        </div>

        {/* Card 2: Community Issue Reports */}
        <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#FAC615] rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94B7A8] uppercase tracking-wider">Issue Reports</span>
            <div className="w-8 h-8 rounded-xl bg-[#FAC615]/15 text-[#FAC615] flex items-center justify-center border border-[#FAC615]/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#FAC615]">
            {reports.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94B7A8] pt-1 border-t border-[#163B2E]">
            <span className="text-[#22C55E] font-semibold">{reports.filter((r) => r.status === 'RESOLVED').length} Resolved</span>
            <Link to="/my-reports" className="text-[#FAC615] font-bold hover:underline">View All &gt;</Link>
          </div>
        </div>

        {/* Card 3: Saved Amenities */}
        <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#38BDF8] rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94B7A8] uppercase tracking-wider">Saved Amenities</span>
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center border border-[#38BDF8]/30">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#38BDF8]">
            {savedFacilities.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94B7A8] pt-1 border-t border-[#163B2E]">
            <span>Fast Offline Access</span>
            <Link to="/saved" className="text-[#38BDF8] font-bold hover:underline">Saved &gt;</Link>
          </div>
        </div>

        {/* Card 4: Civic Trust Level */}
        <div className="bg-[#1E4D3A] border border-[#163B2E] border-t-[3px] border-t-[#34D399] rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#94B7A8] uppercase tracking-wider">Civic Trust Tier</span>
            <div className="w-8 h-8 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center border border-[#34D399]/30">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#34D399]">
            Level 1 Verified
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#94B7A8] pt-1 border-t border-[#163B2E]">
            <span className="text-[#34D399] font-semibold">Active Contributor</span>
            <Link to="/profile" className="text-[#34D399] font-bold hover:underline">Profile &gt;</Link>
          </div>
        </div>

      </div>

      {/* Quick Discovery Shortcuts */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-[#F8FAF5] uppercase tracking-wider flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#22C55E]" />
          <span>Quick Discovery Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(act.link)}
                className={`bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/50 border-t-[3px] ${act.border} rounded-2xl p-4 text-left transition duration-200 shadow-md group`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl ${act.bg} flex items-center justify-center ${act.color} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-[#F8FAF5] truncate group-hover:text-[#22C55E] transition">
                      {act.title}
                    </h3>
                    <p className="text-[10px] text-[#94B7A8] truncate mt-0.5">{act.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
