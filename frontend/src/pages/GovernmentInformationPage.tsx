import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  FileCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Sprout
} from 'lucide-react';
import { schemeApi } from '../services/api';
import { GovernmentScheme } from '../types';

export const GovernmentInformationPage: React.FC = () => {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const apiCategory = category === 'All' ? undefined : (
        category === 'Sanitation' ? 'Sanitation & Waste Management' :
        category === 'Health' ? 'Healthcare' :
        category === 'Water' ? 'Water Supply' :
        category === 'Housing' ? 'Urban Livelihoods & Street Infrastructure' :
        category
      );

      const data = await schemeApi.search({
        search: searchQuery.trim() || undefined,
        category: apiCategory,
      });
      setSchemes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  // Canonical categories matching Reference Image 2 exactly:
  // All, Sanitation, Health, Water, Housing
  const categories = ['All', 'Sanitation', 'Health', 'Water', 'Housing'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header Matching Reference Image 2 */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">
          Government Schemes
        </h1>
        <p className="text-sm text-[#94B7A8] font-medium">
          Find and explore citizen schemes
        </p>
      </div>

      {/* Search & Horizontal Category Filter Pills */}
      <div className="bg-[#163B2E] border border-[#1E4D3A] rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-[#22C55E] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes by name, ministry, or keyword..."
            className="w-full bg-[#0B1F16] rounded-2xl border border-[#1E4D3A] focus:border-[#22C55E] text-xs text-[#F8FAF5] pl-11 pr-24 py-3.5 focus:outline-none placeholder-[#94B7A8] font-medium transition shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-black rounded-xl transition shadow-[0_0_10px_rgba(34,197,94,0.4)] active:scale-95"
          >
            Search
          </button>
        </form>

        {/* Category Pills matching Reference Image 2 */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 justify-center no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition duration-200 active:scale-95 ${
                category === cat
                  ? 'bg-[#22C55E] text-[#0B1F16] font-black shadow-[0_0_15px_rgba(34,197,94,0.45)]'
                  : 'bg-[#0B1F16] text-[#D1E7D6] hover:text-[#F8FAF5] hover:bg-[#1E4D3A] border border-[#1E4D3A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Official Grounding Portals Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <a
          href="https://www.myscheme.gov.in"
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/50 text-xs flex items-center justify-between group transition"
        >
          <div>
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">MoHUA / MeitY</span>
            <p className="font-bold text-[#F8FAF5] group-hover:text-[#22C55E] transition mt-0.5">myScheme Portal</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#34D399]" />
        </a>

        <a
          href="https://swachhbharaturban.gov.in"
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/50 text-xs flex items-center justify-between group transition"
        >
          <div>
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Urban Sanitation</span>
            <p className="font-bold text-[#F8FAF5] group-hover:text-[#22C55E] transition mt-0.5">Swachh Bharat Urban</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#34D399]" />
        </a>

        <a
          href="https://accessibleindia.gov.in"
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/50 text-xs flex items-center justify-between group transition"
        >
          <div>
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Accessibility</span>
            <p className="font-bold text-[#F8FAF5] group-hover:text-[#22C55E] transition mt-0.5">Sugamya Bharat</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#34D399]" />
        </a>

        <a
          href="https://www.india.gov.in"
          target="_blank"
          rel="noreferrer"
          className="p-4 rounded-2xl bg-[#1E4D3A] hover:bg-[#1E4D3A]/90 border border-[#163B2E] hover:border-[#22C55E]/50 text-xs flex items-center justify-between group transition"
        >
          <div>
            <span className="text-[10px] text-[#94B7A8] uppercase font-bold tracking-wider">Central Government</span>
            <p className="font-bold text-[#F8FAF5] group-hover:text-[#22C55E] transition mt-0.5">National Portal</p>
          </div>
          <ExternalLink className="w-4 h-4 text-[#34D399]" />
        </a>
      </div>

      {/* Schemes List with Leaf Icon & Gold "Know More ->" Buttons */}
      {loading ? (
        <div className="py-20 text-center text-[#94B7A8] bg-[#1E4D3A] rounded-3xl border border-[#163B2E]">
          <div className="w-8 h-8 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Fetching verified government schemes...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="py-16 text-center text-[#94B7A8] bg-[#1E4D3A] rounded-3xl border border-[#163B2E] p-6">
          <p className="text-sm font-bold text-[#F8FAF5]">No government schemes found matching your search</p>
          <p className="text-xs mt-1">Try another search term or click "All".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => {
            const isExpanded = expandedId === scheme.id;
            return (
              <div
                key={scheme.id}
                className="bg-[#1E4D3A] hover:bg-[#1E4D3A]/95 rounded-3xl border border-[#163B2E] hover:border-[#22C55E]/50 overflow-hidden shadow-lg transition duration-200"
              >
                <div
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="flex items-start space-x-4 min-w-0">
                    {/* Green Leaf Icon in Circle Matching Reference Image 2 */}
                    <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center shrink-0 text-[#22C55E] shadow-sm">
                      <Sprout className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 uppercase">
                          {scheme.category}
                        </span>
                        <span className="text-[11px] text-[#94B7A8] flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5 text-[#34D399]" />
                          <span>{scheme.ministry}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-[#F8FAF5] leading-snug">
                        {scheme.schemeName}
                      </h3>
                      <p className="text-xs text-[#D1E7D6] leading-relaxed line-clamp-2 font-medium">
                        {scheme.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Gold "Know More ->" Button & Details Toggle */}
                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                      className="px-5 py-2.5 rounded-full bg-[#FAC615] hover:bg-[#eab308] text-[#0B1F16] text-xs font-black shadow-[0_0_15px_rgba(250,198,21,0.4)] transition flex items-center space-x-1.5 active:scale-95"
                    >
                      <span>{isExpanded ? 'Show Less' : 'Know More'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                      className="p-2.5 rounded-full bg-[#163B2E] text-[#22C55E] border border-[#163B2E]"
                      title="Toggle Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#163B2E] space-y-4 text-xs animate-in fade-in duration-200">
                    
                    {/* Eligibility & Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {scheme.eligibilityCriteria && (
                        <div className="p-4 rounded-2xl bg-[#163B2E] border border-[#163B2E] space-y-1.5">
                          <h4 className="font-bold text-[#22C55E] flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Eligibility Criteria</span>
                          </h4>
                          <p className="text-[#D1E7D6] leading-relaxed">{scheme.eligibilityCriteria}</p>
                        </div>
                      )}

                      {scheme.benefits && (
                        <div className="p-4 rounded-2xl bg-[#163B2E] border border-[#163B2E] space-y-1.5">
                          <h4 className="font-bold text-[#FAC615] flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Citizen Benefits</span>
                          </h4>
                          <p className="text-[#D1E7D6] leading-relaxed">{scheme.benefits}</p>
                        </div>
                      )}
                    </div>

                    {/* Required Documents */}
                    {scheme.documentsRequired && (
                      <div className="p-4 rounded-2xl bg-[#163B2E] border border-[#163B2E] space-y-1.5">
                        <h4 className="font-bold text-[#F8FAF5] flex items-center space-x-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-[#34D399]" />
                          <span>Required Documents</span>
                        </h4>
                        <p className="text-[#D1E7D6] leading-relaxed">{scheme.documentsRequired}</p>
                      </div>
                    )}

                    {/* Official Portal Button */}
                    {scheme.officialUrl && (
                      <div className="pt-2 flex justify-end">
                        <a
                          href={scheme.officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#22C55E] hover:bg-[#34D399] text-[#0B1F16] text-xs font-bold shadow-[0_0_12px_rgba(34,197,94,0.4)] transition duration-200 active:scale-95"
                        >
                          <span>Visit Official Government Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
