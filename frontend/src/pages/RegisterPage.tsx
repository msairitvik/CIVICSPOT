import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('en');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        phone,
        preferredLanguage,
      });
      navigate('/explore');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full space-y-8 bg-[#163B2E] p-8 sm:p-10 border border-[#1E4D3A] rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <img src="/assets/civicspot-icon.png" alt="CIVICSPOT" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAF5]">Create Citizen Account</h2>
          <p className="text-xs text-[#94B7A8]">Join CivicSpot to track reports, save facilities and participate in local governance.</p>
        </div>

        {error && (
          <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl flex items-start space-x-2 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Full Name</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <User className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Email Address</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <Mail className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Password</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <Lock className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Phone Number</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <Phone className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Preferred Language</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] px-3.5 py-3 transition shadow-inner">
              <Globe className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as Language)}
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#0B1F16]">English</option>
                <option value="hi" className="bg-[#0B1F16]">हिंदी (Hindi)</option>
                <option value="te" className="bg-[#0B1F16]">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
          >
            <span>{loading ? 'Creating Account...' : 'Register as Citizen'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#94B7A8]">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-[#22C55E] hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
