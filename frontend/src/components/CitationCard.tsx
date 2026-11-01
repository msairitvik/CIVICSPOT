import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Citation } from '../types';

interface CitationCardProps {
  citations: Citation[];
}

export const CitationCard: React.FC<CitationCardProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3.5 pt-3 border-t border-[#163B2E]">
      <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#FAC615] mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
        <span>Verified Citations & Grounded Sources</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {citations.map((c, idx) => {
          let domain = '';
          try {
            domain = new URL(c.url).hostname.replace('www.', '');
          } catch {
            domain = 'Official Portal';
          }

          return (
            <a
              key={idx}
              href={c.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#0B1F16] border border-[#163B2E] hover:border-[#22C55E] text-xs font-semibold text-[#D1E7D6] hover:text-[#F8FAF5] transition group shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] group-hover:scale-125 transition-transform" />
              <span className="truncate max-w-[200px]">{c.title || domain}</span>
              <span className="text-[10px] text-[#94B7A8] font-normal">({domain})</span>
              <ExternalLink className="w-3 h-3 text-[#94B7A8] group-hover:text-[#22C55E] shrink-0" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
