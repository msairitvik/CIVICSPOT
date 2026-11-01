import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Globe,
  Accessibility,
  Volume2,
  Sun,
  ShieldCheck,
  Save,
  LogOut,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../i18n/translations';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { language, setLanguage, highContrast, toggleHighContrast } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [wheelchairUser, setWheelchairUser] = useState(user?.wheelchairUser || false);
  const [audioAssistance, setAudioAssistance] = useState(user?.audioAssistance || false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateProfile({
        name,
        phone,
        preferredLanguage: language,
        wheelchairUser,
        audioAssistance,
        highContrast,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#F8FAF5] tracking-tight">Citizen Profile & Accessibility</h1>
        <p className="text-xs text-[#94B7A8]">Customize your language, barrier-free mobility needs, and civic preferences.</p>
      </div>

      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {savedSuccess && (
          <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E]/40 rounded-2xl text-xs text-[#22C55E] flex items-center space-x-2 font-bold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile and accessibility settings updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Full Name</label>
              <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
                <User className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Email Address (Registered)</label>
              <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] px-3.5 py-3 opacity-70">
                <Mail className="w-4 h-4 text-[#94B7A8] mr-2 shrink-0" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-transparent text-xs text-[#94B7A8] focus:outline-none cursor-not-allowed font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Phone Number</label>
              <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
                <Phone className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Interface Language</label>
              <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] px-3.5 py-3 transition shadow-inner">
                <Globe className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none cursor-pointer"
                >
                  <option value="en" className="bg-[#0B1F16]">English</option>
                  <option value="hi" className="bg-[#0B1F16]">हिंदी (Hindi)</option>
                  <option value="te" className="bg-[#0B1F16]">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="pt-4 border-t border-[#1E4D3A] space-y-3">
            <span className="text-[10px] font-bold text-[#FAC615] uppercase tracking-wider block">
              Inclusive Civic Navigation Preferences
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A] flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Accessibility className="w-4 h-4 text-[#22C55E]" />
                  <span className="font-bold text-[#F8FAF5]">Wheelchair User</span>
                </div>
                <input
                  type="checkbox"
                  checked={wheelchairUser}
                  onChange={(e) => setWheelchairUser(e.target.checked)}
                  className="w-4 h-4 accent-[#22C55E] rounded"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A] flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-[#38BDF8]" />
                  <span className="font-bold text-[#F8FAF5]">Audio Prompts</span>
                </div>
                <input
                  type="checkbox"
                  checked={audioAssistance}
                  onChange={(e) => setAudioAssistance(e.target.checked)}
                  className="w-4 h-4 accent-[#22C55E] rounded"
                />
              </label>

              <label className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#1E4D3A] flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-[#FAC615]" />
                  <span className="font-bold text-[#F8FAF5]">High Contrast</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={toggleHighContrast}
                  className="w-4 h-4 accent-[#22C55E] rounded"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#1E4D3A]">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/15 border border-[#EF4444]/30 transition flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
