import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-5 bg-[#1E4D3A] p-10 rounded-3xl border border-[#163B2E] shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] mx-auto shadow-[0_0_15px_rgba(34,197,94,0.4)]">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-[#F8FAF5]">404</h1>
        <h2 className="text-base font-bold text-[#F8FAF5]">Location Not Found</h2>
        <p className="text-xs text-[#94B7A8] leading-relaxed">
          The civic resource or page you are looking for has moved or does not exist in our urban repository.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] transition flex items-center space-x-1.5 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
