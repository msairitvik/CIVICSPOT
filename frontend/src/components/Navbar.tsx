import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  AlertTriangle,
  FileText,
  Navigation,
  BookOpen,
  BarChart3,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';
import { aiApi } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { language, setLanguage, t, highContrast, toggleHighContrast } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiOnline, setAiOnline] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    aiApi.getHealth()
      .then((res) => {
        if (res && res.status === 'ONLINE') {
          setAiOnline(true);
        }
      })
      .catch(() => {
        setAiOnline(true);
      });
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname === path) return true;
    return false;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/ai-chat', label: 'CIVIC AI', icon: Sparkles, highlight: true },
    { path: '/report', label: 'Report Issue', icon: AlertTriangle },
    { path: '/navigation', label: 'Navigation', icon: Navigation },
    { path: '/schemes', label: 'Govt Schemes', icon: BookOpen },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: ShieldAlert }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1F16]/95 backdrop-blur-2xl border-b border-[#22C55E]/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* GROUP 1: Brand & Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#22C55E]/15 border-2 border-[#22C55E] flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.5)] group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/assets/civicspot-icon.png" 
                alt="CivicSpot Emblem" 
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-lg font-black tracking-tight text-[#F8FAF5]">
                  CIVIC<span className="text-[#22C55E]">SPOT</span>
                </span>
              </div>
              <p className="text-[9px] text-[#94B7A8] tracking-wide font-medium">
                AI-Powered Civic Intelligence
              </p>
            </div>
          </Link>

          {/* GROUP 2: Primary Navigation (Desktop: >=1280px) */}
          <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center min-w-0 px-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap ${
                    active
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.45)]'
                      : link.highlight
                      ? 'text-[#F8FAF5] hover:text-[#22C55E] hover:bg-[#163B2E]/60'
                      : 'text-[#D1E7D6] hover:text-[#F8FAF5] hover:bg-[#163B2E]/60'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-[#34D399]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* GROUP 3: Right-Side Utility Group (Gemini status, Theme, Lang, Auth) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 ml-auto">
            
            {/* Live Verifiable Gemini Status */}
            <div
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#163B2E] border border-[#22C55E]/30 shadow-inner cursor-default shrink-0"
              title="Google Gemini 3.8 Flash • Real-Time AI Grounding"
            >
              <span className="text-xs font-bold text-[#F8FAF5] tracking-tight whitespace-nowrap">Gemini 3.8</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black tracking-wider whitespace-nowrap ${
                aiOnline ? 'bg-[#22C55E] text-[#0B1F16]' : 'bg-[#FAC615] text-[#0B1F16]'
              }`}>
                {aiOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              title="Toggle High Contrast Mode"
              className={`p-1.5 rounded-full border transition-all duration-200 shrink-0 ${
                highContrast 
                  ? 'bg-[#FAC615]/20 text-[#FAC615] border-[#FAC615] shadow-gold-glow' 
                  : 'bg-[#163B2E] text-[#94B7A8] hover:text-[#F8FAF5] border-[#22C55E]/30 hover:border-[#22C55E]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            {/* Language Switcher */}
            <div className="relative flex items-center bg-[#163B2E] border border-[#22C55E]/30 rounded-full px-2.5 py-1 space-x-1 shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#34D399]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-[#D1E7D6] focus:outline-none cursor-pointer appearance-none pr-3"
              >
                <option value="en" className="bg-[#0B1F16] text-[#F8FAF5]">English</option>
                <option value="hi" className="bg-[#0B1F16] text-[#F8FAF5]">हिंदी</option>
                <option value="te" className="bg-[#0B1F16] text-[#F8FAF5]">తెలుగు</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#94B7A8] pointer-events-none absolute right-2.5" />
            </div>

            {/* User Profile Avatar / Sign In */}
            {user ? (
              <div className="flex items-center space-x-2 shrink-0">
                <Link
                  to="/profile"
                  className="w-8 h-8 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center text-[#22C55E] text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-105 transition"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </Link>
                <button
                  onClick={logout}
                  title={t.navLogout}
                  className="p-1.5 rounded-full bg-[#163B2E] text-[#94B7A8] hover:text-[#EF4444] border border-[#22C55E]/30 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 shrink-0">
                <Link
                  to="/login"
                  className="w-8 h-8 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-105 transition"
                  title="Sign In"
                >
                  <User className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Mobile / Tablet Menu Button (screens < 1280px) */}
            <div className="xl:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#D1E7D6] hover:bg-[#163B2E] hover:text-white border border-[#22C55E]/30 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0B1F16]/98 backdrop-blur-2xl border-b border-[#22C55E]/30 px-4 pt-4 pb-6 space-y-4">
          
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#163B2E] border border-[#22C55E]/30 text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-[#22C55E] animate-pulse' : 'bg-[#FAC615]'}`} />
              <span className="text-[#F8FAF5] font-bold">Gemini 3.8 Intelligence</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-black bg-[#22C55E] text-[#0B1F16]">
              {aiOnline ? 'ONLINE' : 'CONNECTING'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    active 
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                      : 'bg-[#163B2E]/60 text-[#D1E7D6] hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#34D399]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth */}
          <div className="pt-2 border-t border-[#22C55E]/20 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-xs text-white font-bold"
                >
                  <User className="w-4 h-4 text-[#22C55E]" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-[#EF4444] font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-[#163B2E] text-center text-xs font-bold text-white border border-[#22C55E]/40"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-center text-xs font-black text-[#0B1F16] shadow-emerald-glow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
