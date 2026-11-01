import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Sparkles, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1F16] text-[#D1E7D6] border-t border-[#163B2E] text-left relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#22C55E]/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <img 
                src="/assets/civicspot-icon.png" 
                alt="CIVICSPOT" 
                className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]"
              />
              <span className="text-xl font-black tracking-tight text-[#F8FAF5]">
                CIVIC<span className="text-[#22C55E]">SPOT</span>
              </span>
            </div>
            <p className="text-xs text-[#94B7A8] leading-relaxed font-medium">
              Your City. Your Needs. One Intelligent Companion. Discover verified public infrastructure, access government schemes, and solve civic issues in real time.
            </p>
            <div className="flex items-center space-x-2 pt-1 text-[11px] text-[#34D399] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
              <span>Grounded in Official Portals & OSM Contributors</span>
            </div>
          </div>

          {/* Emergency Numbers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAC615] flex items-center space-x-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#FB923C]" />
              <span>Emergency Services</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex justify-between items-center py-1.5 border-b border-[#163B2E]">
                <span className="text-[#D1E7D6] font-medium">National Emergency</span>
                <span className="font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-lg text-[11px]">112</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#163B2E]">
                <span className="text-[#D1E7D6] font-medium">Ambulance</span>
                <span className="font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-lg text-[11px]">108 / 102</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#163B2E]">
                <span className="text-[#D1E7D6] font-medium">Police Control Room</span>
                <span className="font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-lg text-[11px]">100</span>
              </li>
              <li className="flex justify-between items-center py-1.5 border-b border-[#163B2E]">
                <span className="text-[#D1E7D6] font-medium">Fire & Rescue</span>
                <span className="font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-lg text-[11px]">101</span>
              </li>
              <li className="flex justify-between items-center py-1.5">
                <span className="text-[#D1E7D6] font-medium">Disaster Management</span>
                <span className="font-bold text-[#FAC615] bg-[#FAC615]/15 border border-[#FAC615]/30 px-2 py-0.5 rounded-lg text-[11px]">1070</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">Civic Modules</h4>
            <ul className="space-y-2 text-xs text-[#94B7A8]">
              <li><Link to="/explore" className="hover:text-[#22C55E] transition">Public Facility Discovery</Link></li>
              <li><Link to="/ai-chat" className="hover:text-[#22C55E] transition">CIVIC AI Assistant</Link></li>
              <li><Link to="/navigation" className="hover:text-[#22C55E] transition">Smart Route Discovery</Link></li>
              <li><Link to="/report" className="hover:text-[#22C55E] transition">Citizen Issue Reporting</Link></li>
              <li><Link to="/complaints" className="hover:text-[#22C55E] transition">Official Grievance Tracking</Link></li>
              <li><Link to="/schemes" className="hover:text-[#22C55E] transition">Government Schemes Directory</Link></li>
              <li><Link to="/analytics" className="hover:text-[#22C55E] transition">Civic Intelligence Dashboard</Link></li>
            </ul>
          </div>

          {/* Grounding & Data Attribution */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#34D399]">Official Grounding</h4>
            <ul className="space-y-2 text-xs text-[#94B7A8]">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-[#F8FAF5] transition">
                  <span>National Portal of India</span>
                  <ExternalLink className="w-3 h-3 text-[#94B7A8]" />
                </a>
              </li>
              <li>
                <a href="https://www.myscheme.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-[#F8FAF5] transition">
                  <span>myScheme Portal (MoHUA)</span>
                  <ExternalLink className="w-3 h-3 text-[#94B7A8]" />
                </a>
              </li>
              <li>
                <a href="https://swachhbharaturban.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-[#F8FAF5] transition">
                  <span>Swachh Bharat Mission - Urban</span>
                  <ExternalLink className="w-3 h-3 text-[#94B7A8]" />
                </a>
              </li>
              <li>
                <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-[#F8FAF5] transition">
                  <span>OpenStreetMap GeoData</span>
                  <ExternalLink className="w-3 h-3 text-[#94B7A8]" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-[#163B2E] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#94B7A8] gap-4">
          <p>© 2026 CIVICSPOT. Autonomous Civic Intelligence Platform.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5 text-[#34D399]">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Google Gemini 3.8 Flash Engine</span>
            </span>
            <span>•</span>
            <span className="text-[#FAC615]">Vizianagaram & Denkada Ground Truth</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
