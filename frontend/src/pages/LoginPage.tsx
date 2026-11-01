import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/explore';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('Unable to login with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-md w-full space-y-8 bg-[#163B2E] p-8 sm:p-10 border border-[#1E4D3A] rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 items-center justify-center text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <img src="/assets/civicspot-icon.png" alt="CIVICSPOT" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-2xl font-black text-[#F8FAF5]">Welcome to CivicSpot</h2>
          <p className="text-xs text-[#94B7A8]">Sign in to access personalized civic services, saved facilities and reports.</p>
        </div>

        {error && (
          <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl flex items-start space-x-2 text-xs text-[#EF4444]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#F8FAF5] mb-1.5 uppercase">Email Address</label>
            <div className="relative flex items-center bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus-within:border-[#22C55E] px-3.5 py-3 transition shadow-inner">
              <Mail className="w-4 h-4 text-[#22C55E] mr-2 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicspot.org"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-[#F8FAF5] focus:outline-none placeholder-[#94B7A8] font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-black shadow-[0_0_15px_rgba(34,197,94,0.4)] transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* One-click Demo Credentials */}
        <div className="pt-4 border-t border-[#1E4D3A] space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-[#FAC615] block text-center tracking-wider">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@civicspot.org', 'citizen123')}
              className="p-3 rounded-2xl bg-[#0B1F16] hover:bg-[#1E4D3A] text-left text-xs border border-[#1E4D3A] transition group active:scale-95"
            >
              <div className="flex items-center space-x-1.5 text-[#22C55E] font-bold text-[11px]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Citizen</span>
              </div>
              <p className="text-[10px] text-[#94B7A8] mt-0.5 truncate">citizen@civicspot.org</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@civicspot.org', 'admin123')}
              className="p-3 rounded-2xl bg-[#0B1F16] hover:bg-[#1E4D3A] text-left text-xs border border-[#1E4D3A] transition group active:scale-95"
            >
              <div className="flex items-center space-x-1.5 text-[#FAC615] font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-[#94B7A8] mt-0.5 truncate">admin@civicspot.org</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#94B7A8]">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-[#22C55E] hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
