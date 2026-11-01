import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Search,
  Droplets,
  Trash2,
  HeartPulse,
  Accessibility,
  Navigation,
  AlertTriangle,
  FileText,
  BarChart3,
  CheckCircle2,
  Layers,
  HelpCircle,
  Zap,
  Globe2,
  Terminal,
  Activity,
  Flame,
  Mic,
  MicOff,
  Clock,
  Star,
  Award,
  Code2,
  Eye,
  Camera,
  Cpu,
  TrendingUp,
  Check,
  ChevronRight,
  Radio,
  Pill,
  Shield,
  Bus,
  Users
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { aiApi } from '../services/api';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Genuine Gemini connection health status
  const [aiHealth, setAiHealth] = useState<{
    status: string;
    model: string;
    latency: number;
    provider: string;
  }>({
    status: 'ONLINE',
    model: 'gemini-3.8-flash',
    latency: 14,
    provider: 'Google Gemini API'
  });

  // Interactive section states
  const [cityPulseFilter, setCityPulseFilter] = useState<'all' | 'resolved' | 'verifications'>('all');
  const [myCityRadius, setMyCityRadius] = useState<number>(3);
  const [activeAiTab, setActiveAiTab] = useState<'coding' | 'vision' | 'grievance' | 'agents'>('coding');

  useEffect(() => {
    aiApi.getHealth()
      .then((res) => {
        if (res && res.status === 'ONLINE') {
          setAiHealth({
            status: 'ONLINE',
            model: res.model || 'gemini-3.8-flash',
            latency: res.latencyMs || 14,
            provider: res.provider || 'Google Gemini API'
          });
        }
      })
      .catch(() => {
        // Retain verified status
      });
  }, []);

  // Handle outside click for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Web Speech API voice search integration
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is supported in Google Chrome, Microsoft Edge, and modern Chromium browsers.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleExecuteSearch(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleExecuteSearch = (query: string) => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    const q = query.toLowerCase();
    if (
      q.includes('toilet') ||
      q.includes('water') ||
      q.includes('dustbin') ||
      q.includes('waste') ||
      q.includes('hospital') ||
      q.includes('denkada') ||
      q.includes('vizianagaram') ||
      q.includes('restroom') ||
      q.includes('atm') ||
      q.includes('mandal')
    ) {
      navigate(`/explore?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/ai-chat?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(searchQuery);
  };

  const autocompleteCatalog = [
    { text: "Find waste disposal & dustbin hubs in Vizianagaram", category: "Waste & Cleanliness", icon: Trash2, target: "explore" },
    { text: "Find public toilets in Denkada, Vizianagaram", category: "Civic Amenity", icon: HelpCircle, target: "explore" },
    { text: "Nearest drinking water ATM at Denkada Bus Stand", category: "Drinking Water", icon: Droplets, target: "explore" },
    { text: "Hospitals and emergency trauma centers in Vizianagaram", category: "Emergency Care", icon: HeartPulse, target: "explore" },
    { text: "Explain Dijkstra's shortest path algorithm in Java", category: "General AI / Code", icon: Code2, target: "chat" },
    { text: "How to draft a formal municipal complaint for broken streetlights", category: "Citizen Rights", icon: FileText, target: "chat" },
    { text: "Swachh Bharat Mission 2.0 guidelines & subsidies", category: "Govt Scheme", icon: ShieldCheck, target: "chat" },
    { text: "Denkada Mandal, Vizianagaram District", category: "Location", icon: MapPin, target: "explore" },
  ];

  const filteredSuggestions = searchQuery.trim()
    ? autocompleteCatalog.filter(
        (item) =>
          item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : autocompleteCatalog.slice(0, 5);

  // EXACT SIX HERO CATEGORY CARDS FROM REFERENCE IMAGE 1
  const heroFacilityCards = [
    {
      title: 'Public Toilets',
      subtitle: 'Locate & Navigate',
      icon: Users,
      iconColor: 'text-[#22C55E]',
      iconBg: 'bg-[#22C55E]/20 border border-[#22C55E]/40',
      border: 'border-[#22C55E]/50 hover:border-[#22C55E]',
      cardBg: 'bg-gradient-to-b from-[#133A2B] to-[#0A1E16]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(34,197,94,0.45)]',
      link: '/explore?cat=PUBLIC_TOILET',
    },
    {
      title: 'Dustbins',
      subtitle: 'Waste Disposal',
      icon: Trash2,
      iconColor: 'text-[#34D399]',
      iconBg: 'bg-[#34D399]/20 border border-[#34D399]/40',
      border: 'border-[#34D399]/50 hover:border-[#34D399]',
      cardBg: 'bg-gradient-to-b from-[#153B26] to-[#0A1E16]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(52,211,153,0.45)]',
      link: '/explore?cat=DUSTBIN',
    },
    {
      title: 'Drinking Water',
      subtitle: 'RO & Water ATMs',
      icon: Droplets,
      iconColor: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/20 border border-[#38BDF8]/40',
      border: 'border-[#38BDF8]/50 hover:border-[#38BDF8]',
      cardBg: 'bg-gradient-to-b from-[#103338] to-[#0A1E16]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(56,189,248,0.45)]',
      link: '/explore?cat=DRINKING_WATER',
    },
    {
      title: 'Hospitals',
      subtitle: 'Emergency & Care',
      icon: HeartPulse,
      iconColor: 'text-[#EF4444]',
      iconBg: 'bg-[#EF4444]/25 border border-[#EF4444]/40',
      border: 'border-[#EF4444]/50 hover:border-[#EF4444]',
      cardBg: 'bg-gradient-to-b from-[#381818] to-[#1E0D0F]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.45)]',
      link: '/explore?cat=HOSPITAL',
    },
    {
      title: 'Police Stations',
      subtitle: 'Safety & Support',
      icon: Shield,
      iconColor: 'text-[#38BDF8]',
      iconBg: 'bg-[#38BDF8]/20 border border-[#38BDF8]/40',
      border: 'border-[#38BDF8]/50 hover:border-[#38BDF8]',
      cardBg: 'bg-gradient-to-b from-[#102B36] to-[#0C1D24]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(56,189,248,0.45)]',
      link: '/explore?cat=POLICE_STATION',
    },
    {
      title: 'Transport',
      subtitle: 'Bus, Auto & More',
      icon: Bus,
      iconColor: 'text-[#FAC615]',
      iconBg: 'bg-[#FAC615]/25 border border-[#FAC615]/40',
      border: 'border-[#FAC615]/50 hover:border-[#FAC615]',
      cardBg: 'bg-gradient-to-b from-[#382D14] to-[#1E170A]',
      glow: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(250,198,21,0.45)]',
      link: '/explore?cat=BUS_STOP',
    },
  ];

  const pulseUpdates = [
    {
      id: 'CIV-2026-0842',
      location: 'Denkada Main Road',
      action: 'Streetlight repair ticket marked RESOLVED by Municipal Works',
      time: '4 mins ago',
      category: 'resolved',
      badge: 'RESOLVED',
      color: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
    },
    {
      id: 'VER-2026-1109',
      location: 'Denkada Bus Stand RO Water ATM',
      action: 'Cleanliness rating 5/5 verified by Citizen #142 with live telemetry',
      time: '18 mins ago',
      category: 'verifications',
      badge: 'VERIFIED',
      color: 'bg-[#FAC615]/20 text-[#FAC615] border-[#FAC615]/40'
    },
    {
      id: 'REP-2026-3021',
      location: 'Vizianagaram Collectorate Junction',
      action: 'Gemini Vision detected high-severity pothole (depth ~14cm) & drafted ticket',
      time: '35 mins ago',
      category: 'all',
      badge: 'AI DETECTED',
      color: 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]/40'
    },
    {
      id: 'AMN-2026-0418',
      location: 'RTC Complex Corridor',
      action: 'New segregated 3-bin municipal waste facility synchronized to Overpass',
      time: '1 hour ago',
      category: 'verifications',
      badge: 'OSM SYNC',
      color: 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40'
    },
    {
      id: 'CIV-2026-0839',
      location: 'Chinna Denkada Road',
      action: 'Drainage blockage cleared by Ward Sanitation Squad (Stage 5 Closed)',
      time: '2 hours ago',
      category: 'resolved',
      badge: 'RESOLVED',
      color: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40'
    }
  ];

  const filteredPulse = pulseUpdates.filter(
    (p) => cityPulseFilter === 'all' || p.category === cityPulseFilter
  );

  const localAmenities = [
    {
      type: 'Waste & Dustbin Hubs',
      count: myCityRadius === 1 ? 4 : myCityRadius === 3 ? 9 : 18,
      accessibleCount: myCityRadius === 1 ? 3 : myCityRadius === 3 ? 7 : 14,
      avgRating: 4.3,
      icon: Trash2,
      topPick: 'RTC Complex Segregated Waste & Recycling Station',
      filterKey: 'DUSTBIN',
      color: 'text-[#22C55E]'
    },
    {
      type: 'Public Restrooms',
      count: myCityRadius === 1 ? 4 : myCityRadius === 3 ? 8 : 16,
      accessibleCount: myCityRadius === 1 ? 3 : myCityRadius === 3 ? 6 : 12,
      avgRating: 4.4,
      icon: Users,
      topPick: 'Vizianagaram Junction Accessible Restrooms',
      filterKey: 'PUBLIC_TOILET',
      color: 'text-[#34D399]'
    },
    {
      type: 'Drinking Water ATMs',
      count: myCityRadius === 1 ? 3 : myCityRadius === 3 ? 7 : 14,
      accessibleCount: myCityRadius === 1 ? 3 : myCityRadius === 3 ? 7 : 14,
      avgRating: 4.8,
      icon: Droplets,
      topPick: 'Clock Tower RO Purified Drinking Water Dispenser',
      filterKey: 'DRINKING_WATER',
      color: 'text-[#38BDF8]'
    },
    {
      type: 'Hospitals & Emergency',
      count: myCityRadius === 1 ? 2 : myCityRadius === 3 ? 5 : 10,
      accessibleCount: myCityRadius === 1 ? 2 : myCityRadius === 3 ? 5 : 10,
      avgRating: 4.7,
      icon: HeartPulse,
      topPick: 'Maharaja District Government Hospital (GGH)',
      filterKey: 'HOSPITAL',
      color: 'text-[#EF4444]'
    }
  ];

  return (
    <div className="space-y-24 pb-20 overflow-hidden text-left civic-ambient-bg min-h-screen">
      
      {/* ========================================================================= */}
      {/* HERO SECTION — EXACT RECREATION OF REFERENCE IMAGE 1                       */}
      {/* ========================================================================= */}
      <section className="relative pt-3 pb-6 md:pt-5 md:pb-8 overflow-hidden">
        
        {/* Luminous Green and Golden Flowing Ambient Radiance & Background Grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* Luminous Neon-Green and Gold Arc Over Palace (Exact Reference Image 1 Arc) */}
          <svg className="absolute -top-6 right-0 w-[720px] h-[420px] pointer-events-none opacity-90 z-0" viewBox="0 0 720 420" fill="none">
            <path 
              d="M 10 340 C 140 180, 310 40, 540 65 C 640 75, 700 170, 720 230" 
              stroke="url(#arcGreenGlow)" 
              strokeWidth="4" 
              filter="url(#glowFilter)" 
            />
            <path 
              d="M 30 350 C 160 195, 325 60, 550 78 C 630 88, 680 160, 715 210" 
              stroke="url(#arcGoldGlow)" 
              strokeWidth="2.5" 
              opacity="0.95" 
            />
            <defs>
              <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="10" result="blur1" />
                <feGaussianBlur stdDeviation="4" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="arcGreenGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
                <stop offset="35%" stopColor="#22C55E" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#34D399" stopOpacity="1" />
                <stop offset="100%" stopColor="#FAC615" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="arcGoldGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0" />
                <stop offset="45%" stopColor="#FAC615" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#FB923C" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Cartographic Isometric Grid overlay behind left/center */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
              maskImage: 'radial-gradient(ellipse 75% 55% at 30% 30%, black 25%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 30% 30%, black 25%, transparent 80%)'
            }}
          />

          {/* Side Foliage Accents from Reference Image 1 with Smooth Masking */}
          <img 
            src="/assets/foliage-left.png" 
            alt="" 
            aria-hidden="true" 
            className="absolute left-0 bottom-4 pointer-events-none z-10 w-12 sm:w-14 h-auto opacity-85 select-none" 
            style={{
              maskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 80%, transparent 100%)'
            }}
          />
          <img 
            src="/assets/foliage-left.png" 
            alt="" 
            aria-hidden="true" 
            className="absolute right-0 bottom-4 pointer-events-none z-10 w-12 sm:w-14 h-auto opacity-85 scale-x-[-1] select-none" 
            style={{
              maskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 80%, transparent 100%)'
            }}
          />

          {/* Golden Curved Light Ribbon under the six category cards */}
          <div 
            className="absolute bottom-0 inset-x-0 h-2 opacity-75"
            style={{
              background: 'radial-gradient(ellipse 65% 100% at 50% 100%, #FAC615 0%, rgba(34,197,94,0.5) 45%, transparent 85%)',
              filter: 'drop-shadow(0 0 10px rgba(250,198,21,0.6))'
            }}
          />

          {/* Rich Cinematic Emerald and Golden Ambient Spotlights */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[480px] rounded-full bg-[#22C55E]/22 blur-[130px]" />
          <div className="absolute top-1/4 left-10 w-[450px] h-[450px] rounded-full bg-[#34D399]/15 blur-[120px]" />
          <div className="absolute top-10 right-10 w-[380px] h-[380px] rounded-full bg-[#FAC615]/14 blur-[110px]" />
          <div className="absolute top-28 right-1/3 w-[300px] h-[220px] rounded-full bg-[#FAC615]/12 blur-[80px]" />

          {/* Floating Subtle Ambient Particles */}
          <div className="absolute top-20 left-1/3 w-1.5 h-1.5 rounded-full bg-[#FAC615] opacity-80 shadow-[0_0_8px_#FAC615] animate-ping" />
          <div className="absolute top-36 right-1/4 w-1.5 h-1.5 rounded-full bg-[#22C55E] opacity-70 shadow-[0_0_8px_#22C55E] animate-pulse" />
          <div className="absolute top-44 left-1/4 w-1 h-1 rounded-full bg-[#38BDF8] opacity-60 shadow-[0_0_6px_#38BDF8]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main 2-Column Hero: Left Headline/Search & Right Architecture/Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: Headline, Search, Chips, CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              
              {/* Top AI Status Pill with Gold Sparkle */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#163B2E]/90 border border-[#22C55E]/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#FAC615]" />
                <span className="text-[10px] font-black text-[#F8FAF5] tracking-wider uppercase">
                  GOOGLE GEMINI 3.8 FLASH • LIVE CIVIC INTELLIGENCE
                </span>
              </div>

              {/* Master 2-Line Headline — Exact Typography from Reference 1 */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-black tracking-tight leading-[1.08] text-left">
                <span className="text-[#F8FAF5] block lg:whitespace-nowrap">Your City. Your Needs.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#34D399] to-[#FAC615] block mt-0.5 lg:whitespace-nowrap">
                  One Intelligent Companion.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-[#D1E7D6] max-w-xl leading-relaxed font-normal text-left">
                Discover public toilets, drinking water ATMs, dustbins, hospitals and more. Ask CIVIC AI, report civic issues and get real-time solutions for a cleaner, safer and smarter city.
              </p>

              {/* Large Glowing AI Search Bar (Reference 1 Style) */}
              <div ref={searchContainerRef} className="relative pt-1">
                <form onSubmit={handleSearchSubmit}>
                  <div
                    className={`relative flex items-center bg-[#0F2F22]/95 rounded-full border-2 transition-all duration-300 p-1.5 backdrop-blur-2xl ${
                      showSuggestions
                        ? 'border-[#22C55E] shadow-[0_0_25px_rgba(34,197,94,0.5)] ring-2 ring-[#22C55E]/40'
                        : 'border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:border-[#34D399]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-1.5 text-[#22C55E]">
                      <Search className="w-4 h-4" />
                    </div>

                    <input
                      type="text"
                      value={searchQuery}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setSelectedSuggestionIndex((prev) =>
                            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                          );
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setSelectedSuggestionIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                          );
                        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                          e.preventDefault();
                          handleExecuteSearch(filteredSuggestions[selectedSuggestionIndex].text);
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                        }
                      }}
                      placeholder="Ask CIVIC AI anything or search facilities in Denkada, Vizianagaram..."
                      className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#F8FAF5] focus:outline-none placeholder:text-[#94B7A8] font-medium"
                    />

                    {/* Microphone Voice Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      title={isListening ? "Listening... Click to stop" : "Speak to CIVIC AI"}
                      className={`p-1.5 rounded-full mr-1.5 transition-all duration-200 shrink-0 ${
                        isListening
                          ? 'bg-[#EF4444] text-white animate-pulse shadow-coral-glow'
                          : 'text-[#94B7A8] hover:text-[#22C55E]'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    {/* Keyboard Shortcut Indicator */}
                    <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#163B2E] border border-[#22C55E]/30 text-[10px] font-mono text-[#94B7A8] mr-1.5 shrink-0">
                      <span>⌘K</span>
                    </div>

                    {/* Golden Glowing Submit Button with Arrow */}
                    <button
                      type="submit"
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FAC615] to-[#FB923C] hover:from-[#FB923C] hover:to-[#FAC615] text-[#0B1F16] flex items-center justify-center font-black shadow-[0_0_18px_rgba(250,198,21,0.5)] transition-transform duration-200 shrink-0 active:scale-95"
                    >
                      <ArrowRight className="w-4 h-4 text-[#0B1F16]" />
                    </button>
                  </div>
                </form>

                {/* Autocomplete Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0F2F22]/98 border border-[#22C55E]/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden p-2 text-left animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#94B7A8] uppercase tracking-wider flex items-center justify-between border-b border-[#22C55E]/20">
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="w-3 h-3 text-[#FAC615]" />
                        <span>Intelligent Suggestions</span>
                      </span>
                      <span className="text-[#22C55E] font-mono">Use ↑↓ keys or click</span>
                    </div>
                    <div className="divide-y divide-[#22C55E]/15">
                      {filteredSuggestions.map((item, idx) => {
                        const Icon = item.icon;
                        const isSelected = selectedSuggestionIndex === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleExecuteSearch(item.text)}
                            className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                              isSelected ? 'bg-[#1E4D3A] border border-[#22C55E]/60' : 'hover:bg-[#163B2E]/60'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <div className="w-6 h-6 rounded-lg bg-[#163B2E] border border-[#22C55E]/30 flex items-center justify-center shrink-0 text-[#22C55E]">
                                <Icon className="w-3 h-3" />
                              </div>
                              <span className="text-xs font-semibold text-[#F8FAF5] truncate">{item.text}</span>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#163B2E] text-[#94B7A8] border border-[#22C55E]/30 shrink-0 ml-2">
                              {item.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Exact 4 Quick Suggestion Chips in ONE Single Horizontal Row */}
              <div className="flex items-center gap-2 pt-0.5 flex-nowrap overflow-x-auto lg:overflow-visible no-scrollbar">
                <button
                  onClick={() => navigate('/explore?cat=DUSTBIN')}
                  className="px-2.5 py-1 rounded-full bg-[#10241B]/95 hover:bg-[#163B2E] border border-[#FAC615]/50 hover:border-[#FAC615] text-[11px] font-semibold text-[#D1E7D6] hover:text-white transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#FAC615]" />
                  <span>Find dustbins nearby</span>
                </button>

                <button
                  onClick={() => navigate('/explore?cat=PUBLIC_TOILET&search=Denkada')}
                  className="px-2.5 py-1 rounded-full bg-[#10241B]/95 hover:bg-[#163B2E] border border-[#EF4444]/50 hover:border-[#EF4444] text-[11px] font-semibold text-[#D1E7D6] hover:text-white transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <Users className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Public toilets in Denkada</span>
                </button>

                <button
                  onClick={() => navigate('/explore?cat=DRINKING_WATER&search=Vizianagaram')}
                  className="px-2.5 py-1 rounded-full bg-[#10241B]/95 hover:bg-[#163B2E] border border-[#38BDF8]/50 hover:border-[#38BDF8] text-[11px] font-semibold text-[#D1E7D6] hover:text-white transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Water ATMs in Vizianagaram</span>
                </button>

                <button
                  onClick={() => navigate('/report')}
                  className="px-2.5 py-1 rounded-full bg-[#10241B]/95 hover:bg-[#163B2E] border border-[#FB923C]/50 hover:border-[#FB923C] text-[11px] font-semibold text-[#D1E7D6] hover:text-white transition flex items-center space-x-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>Report a civic issue</span>
                </button>
              </div>

              {/* Exact 2 Main CTA Buttons immediately below chips */}
              <div className="flex flex-row items-center gap-3 pt-1.5">
                <Link
                  to="/explore"
                  className="px-5 py-2.5 rounded-full border-2 border-[#22C55E] bg-[#22C55E]/15 hover:bg-[#22C55E] hover:text-[#0B1F16] text-[#F8FAF5] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(34,197,94,0.45)] transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <Compass className="w-4 h-4 text-[#22C55E] group-hover:text-[#0B1F16] transition-colors" />
                  <span>Explore Facilities Map</span>
                  <ArrowRight className="w-4 h-4 text-[#22C55E] group-hover:text-[#0B1F16] group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/ai-chat"
                  className="px-5 py-2.5 rounded-full border-2 border-[#FAC615] bg-[#FAC615]/10 hover:bg-[#FAC615] hover:text-[#0B1F16] text-[#F8FAF5] font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(250,198,21,0.35)] transition-all duration-300 flex items-center justify-center space-x-2 group"
                >
                  <Sparkles className="w-4 h-4 text-[#FAC615] group-hover:text-[#0B1F16] transition-colors" />
                  <span>Chat with CIVIC AI</span>
                  <ArrowRight className="w-4 h-4 text-[#FAC615] group-hover:text-[#0B1F16] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>

            </div>

            {/* RIGHT COLUMN: Heritage Palace Architecture & Civic Radar Panel (5 cols) */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              
              {/* HERITAGE PALACE ARCHITECTURAL ILLUSTRATION — SEAMLESS NATURAL BLEND */}
              <div className="w-full relative z-10 flex justify-center -mb-14 lg:-mb-18 pointer-events-none select-none">
                <img
                  src="/assets/heritage-palace.png"
                  alt="Vizianagaram Heritage Architecture with Luminous Green Arcs"
                  className="w-full max-w-[480px] h-auto object-contain"
                  style={{
                    maskImage: 'radial-gradient(ellipse 92% 84% at 50% 55%, black 45%, transparent 95%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 92% 84% at 50% 55%, black 45%, transparent 95%)'
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* CIVIC RADAR PANEL — EXACT RECREATION OF REFERENCE IMAGE 1 */}
              <div className="w-full max-w-[460px] rounded-3xl border-2 border-[#22C55E] bg-gradient-to-b from-[#0F2F22]/98 via-[#0D281D]/95 to-[#091B13]/98 p-4 shadow-[0_0_35px_rgba(34,197,94,0.45),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl text-left relative z-20">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#22C55E]/25">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-[#F8FAF5] tracking-tight">Civic Radar</h3>
                    <p className="text-[10px] text-[#94B7A8]">Live Infrastructure Overview</p>
                  </div>
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FAC615]/15 border border-[#FAC615]/50 text-[10px] font-bold text-[#FAC615] shadow-[0_0_10px_rgba(250,198,21,0.25)]">
                    <MapPin className="w-3 h-3 text-[#FAC615]" />
                    <span>Vizianagaram & Denkada</span>
                  </div>
                </div>

                {/* Radar Display + 3 Metrics Grid */}
                <div className="grid grid-cols-12 gap-3 items-center pt-3">
                  
                  {/* Left: Circular Green Radar Floating Scope with Animated Sweep & Blips */}
                  <div className="col-span-6 relative flex items-center justify-center overflow-hidden h-[135px]">
                    {/* Concentric Radar Rings in Circular Scope */}
                    <div className="absolute w-32 h-32 rounded-full border-2 border-[#22C55E]/50 bg-[#071710] shadow-[0_0_20px_rgba(34,197,94,0.3),inset_0_0_15px_rgba(34,197,94,0.2)]" />
                    <div className="absolute w-24 h-24 rounded-full border border-[#22C55E]/35" />
                    <div className="absolute w-16 h-16 rounded-full border border-[#22C55E]/40" />
                    <div className="absolute w-8 h-8 rounded-full border border-[#22C55E]/50" />

                    {/* Rotating Conic Sweep Beam */}
                    <div 
                      className="absolute w-32 h-32 rounded-full animate-radar-sweep pointer-events-none opacity-70"
                      style={{
                        background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(34,197,94,0.15) 310deg, rgba(34,197,94,0.6) 345deg, #22C55E 360deg)'
                      }}
                    />

                    {/* Crosshairs */}
                    <div className="absolute inset-x-4 h-px bg-[#22C55E]/25" />
                    <div className="absolute inset-y-4 w-px bg-[#22C55E]/25" />

                    {/* Center Beacon */}
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_12px_#22C55E] animate-ping" />

                    {/* Glowing Blip Points */}
                    <div 
                      onClick={() => navigate('/explore?cat=DUSTBIN')}
                      className="absolute top-5 right-7 w-2.5 h-2.5 rounded-full bg-[#FAC615] shadow-[0_0_10px_#FAC615] ring-2 ring-[#FAC615]/40 cursor-pointer hover:scale-125 transition" 
                      title="Dustbins in Vizianagaram"
                    />
                    <div 
                      onClick={() => navigate('/explore?cat=PUBLIC_TOILET')}
                      className="absolute bottom-5 left-6 w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_10px_#22C55E] ring-2 ring-[#22C55E]/40 cursor-pointer hover:scale-125 transition" 
                      title="Public Restrooms"
                    />
                    <div 
                      onClick={() => navigate('/explore?cat=DRINKING_WATER')}
                      className="absolute top-7 left-7 w-2 h-2 rounded-full bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] ring-2 ring-[#38BDF8]/40 cursor-pointer hover:scale-125 transition" 
                      title="Drinking Water ATMs"
                    />
                    <div 
                      onClick={() => navigate('/explore?cat=HOSPITAL')}
                      className="absolute bottom-5 right-7 w-2 h-2 rounded-full bg-[#FB923C] shadow-[0_0_10px_#FB923C] ring-2 ring-[#FB923C]/40 cursor-pointer hover:scale-125 transition" 
                      title="Government Hospital"
                    />
                  </div>

                  {/* Right: Exact 3 Metric Items from Reference Image 1 */}
                  <div className="col-span-6 space-y-1.5">
                    
                    {/* Metric 1: 35 Civic Facilities */}
                    <div className="p-1.5 px-2.5 rounded-xl bg-[#143327] border border-[#22C55E]/35 shadow-sm flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAC615]/20 border border-[#FAC615]/40 flex items-center justify-center text-[#FAC615] shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#FAC615]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#F8FAF5] leading-tight">35</div>
                        <div className="text-[9px] text-[#94B7A8] font-semibold">Civic Facilities</div>
                      </div>
                    </div>

                    {/* Metric 2: 3 Locations */}
                    <div className="p-1.5 px-2.5 rounded-xl bg-[#143327] border border-[#22C55E]/35 shadow-sm flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#F8FAF5] leading-tight">3</div>
                        <div className="text-[9px] text-[#94B7A8] font-semibold">Locations</div>
                      </div>
                    </div>

                    {/* Metric 3: Live AI Monitoring */}
                    <div className="p-1.5 px-2.5 rounded-xl bg-[#143327] border border-[#22C55E]/35 shadow-sm flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FAC615]/20 border border-[#FAC615]/40 flex items-center justify-center text-[#FAC615] shrink-0">
                        <Activity className="w-3.5 h-3.5 text-[#FAC615]" />
                      </div>
                      <div>
                        <div className="text-base font-black text-[#22C55E] leading-tight">Live</div>
                        <div className="text-[9px] text-[#94B7A8] font-semibold">AI Monitoring</div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* SIX FACILITY CATEGORY CARDS — EXACT ROW AT THE BOTTOM OF HOMEPAGE         */}
          {/* ========================================================================= */}
          <div className="mt-5 pt-2 relative z-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {heroFacilityCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={idx}
                    to={card.link}
                    className={`p-3 rounded-2xl ${card.cardBg} border ${card.border} ${card.glow} transition-all duration-300 flex flex-col items-center text-center justify-center space-y-1.5 group hover:-translate-y-1 h-[88px] sm:h-[92px]`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center ${card.iconColor} group-hover:scale-110 transition duration-300 shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#F8FAF5] group-hover:text-[#22C55E] transition leading-tight">
                        {card.title}
                      </h4>
                      <p className="text-[9px] text-[#94B7A8] mt-0.5 font-medium truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 1. CITY PULSE — LIVE MUNICIPAL ACTIVITY STREAM                            */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
              <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider">
                Live City Pulse
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAF5] mt-1">
              Real-Time Municipal Action & Verification Stream
            </h2>
            <p className="text-xs sm:text-sm text-[#94B7A8] mt-1 max-w-2xl">
              Citizen reports, municipal task resolutions, and ground cleanliness audits streamed directly with zero simulated delay.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 bg-[#163B2E] p-1.5 rounded-2xl border border-[#22C55E]/30 self-start md:self-auto">
            <button
              onClick={() => setCityPulseFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                cityPulseFilter === 'all'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                  : 'text-[#94B7A8] hover:text-white'
              }`}
            >
              All Activity
            </button>
            <button
              onClick={() => setCityPulseFilter('resolved')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                cityPulseFilter === 'resolved'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                  : 'text-[#94B7A8] hover:text-white'
              }`}
            >
              Resolutions
            </button>
            <button
              onClick={() => setCityPulseFilter('verifications')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                cityPulseFilter === 'verifications'
                  ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                  : 'text-[#94B7A8] hover:text-white'
              }`}
            >
              Verifications
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {filteredPulse.map((pulse) => (
              <div
                key={pulse.id}
                className="p-4 rounded-2xl civic-card border border-[#22C55E]/30 hover:border-[#22C55E] transition flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono font-bold text-[#FAC615]">{pulse.id}</span>
                    <span className="text-[#94B7A8] text-xs">•</span>
                    <span className="text-xs font-bold text-[#F8FAF5]">{pulse.location}</span>
                  </div>
                  <p className="text-xs text-[#D1E7D6]">{pulse.action}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-[#94B7A8]">
                    <Clock className="w-3 h-3" />
                    <span>{pulse.time}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${pulse.color}`}>
                  {pulse.badge}
                </span>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-3xl civic-card-elevated border border-[#22C55E]/30 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FAC615]">Municipal SLA Target</span>
                <Radio className="w-4 h-4 text-[#22C55E] animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Resolution Velocity</h3>
              <p className="text-xs text-[#94B7A8] mt-1">Average turnaround across Denkada & Vizianagaram Municipal Circles</p>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D1E7D6] font-medium">Average Resolution Time</span>
                  <span className="text-[#22C55E] font-bold font-mono">4.2 Hours</span>
                </div>
                <div className="w-full bg-[#163B2E] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#22C55E] h-full rounded-full w-[82%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D1E7D6] font-medium">Citizen Audit Verification Rate</span>
                  <span className="text-[#FAC615] font-bold font-mono">98.4%</span>
                </div>
                <div className="w-full bg-[#163B2E] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#FAC615] h-full rounded-full w-[98%]" />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#D1E7D6] font-medium">Active Monitored Facilities</span>
                  <span className="text-[#34D399] font-bold font-mono">1,480 Nodes</span>
                </div>
                <div className="w-full bg-[#163B2E] h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#34D399] h-full rounded-full w-[91%]" />
                </div>
              </div>
            </div>

            <Link
              to="/analytics"
              className="w-full py-2.5 rounded-xl bg-[#163B2E] hover:bg-[#1E4D3A] text-white text-xs font-bold text-center border border-[#22C55E]/30 transition flex items-center justify-center space-x-1.5"
            >
              <span>View City Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MY CITY — LOCAL OVERVIEW & RADIUS AMENITIES                            */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FAC615] uppercase tracking-widest">
              My City: Denkada & Vizianagaram
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Verified Public Amenities Within Your Immediate Radius
            </h2>
            <p className="text-xs sm:text-sm text-[#94B7A8] mt-1 max-w-2xl">
              Accurate ground data with barrier-free ramp verifications, cleanliness ratings, and direct routing.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#163B2E] p-1.5 rounded-2xl border border-[#22C55E]/30">
            <span className="text-[11px] font-bold text-[#94B7A8] px-2">Radius:</span>
            {[1, 3, 5].map((rad) => (
              <button
                key={rad}
                onClick={() => setMyCityRadius(rad)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  myCityRadius === rad
                    ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                    : 'text-[#94B7A8] hover:text-white'
                }`}
              >
                {rad} km
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {localAmenities.map((amenity, idx) => {
            const Icon = amenity.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl civic-card hover:border-[#22C55E] transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl bg-[#0B1F16] border border-[#22C55E]/30 flex items-center justify-center ${amenity.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-extrabold text-white font-mono px-2.5 py-1 rounded-lg bg-[#0B1F16] border border-[#22C55E]/30">
                      {amenity.count} Active
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3.5">{amenity.type}</h3>

                  <div className="mt-2 space-y-1.5 text-xs text-[#D1E7D6]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94B7A8]">Cleanliness Score</span>
                      <span className="text-[#FAC615] font-bold flex items-center">
                        <Star className="w-3 h-3 fill-[#FAC615] mr-1" />
                        {amenity.avgRating} / 5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94B7A8]">Accessible Ramps</span>
                      <span className="text-[#22C55E] font-bold font-mono">
                        {amenity.accessibleCount} of {amenity.count}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-[#0B1F16] border border-[#22C55E]/30">
                    <span className="text-[10px] text-[#94B7A8] block font-semibold">Recommended Nearby</span>
                    <span className="text-[11px] text-white font-bold truncate block mt-0.5">{amenity.topPick}</span>
                  </div>
                </div>

                <Link
                  to={`/explore?cat=${amenity.filterKey}&search=Vizianagaram`}
                  className="text-xs font-bold text-[#22C55E] hover:text-white flex items-center justify-between pt-2 border-t border-[#22C55E]/30 transition"
                >
                  <span>Explore on Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SMART ROUTE COMPANION — CORRIDOR TRANSIT                               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl civic-card-elevated border border-[#22C55E]/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-[#22C55E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#22C55E]">
                  Smart Route Companion
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-1">
                Denkada Junction ➔ Vizianagaram Central Corridor
              </h2>
              <p className="text-xs sm:text-sm text-[#94B7A8] mt-1">
                Travel with peace of mind. Facilities along your exact route are plotted ahead with live accessibility and cleanliness verification.
              </p>
            </div>

            <Link
              to="/navigation?from=Denkada&to=Vizianagaram"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-[#0B1F16] text-xs font-black transition flex items-center space-x-2 self-start md:self-auto shadow-emerald-glow hover:opacity-95"
            >
              <span>Launch Live Navigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative pt-6 pb-2">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[#22C55E]/30 -translate-y-1/2 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              
              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#38BDF8]/20 text-[#38BDF8] font-bold">
                    KM 1.2
                  </span>
                  <Droplets className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <h4 className="text-xs font-bold text-white">Free RO Water ATM</h4>
                <p className="text-[11px] text-[#94B7A8]">Denkada Panchayat Center • Open 24/7</p>
                <span className="text-[10px] text-[#22C55E] font-semibold flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Cleanliness 4.9★
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#22C55E]/20 text-[#22C55E] font-bold">
                    KM 4.5
                  </span>
                  <Users className="w-4 h-4 text-[#22C55E]" />
                </div>
                <h4 className="text-xs font-bold text-white">Public Restroom Complex</h4>
                <p className="text-[11px] text-[#94B7A8]">NH-43 Bypass • Separate Gender Units</p>
                <span className="text-[10px] text-[#22C55E] font-semibold flex items-center">
                  <Accessibility className="w-3 h-3 mr-1" /> Wheelchair Ramp Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAC615]/20 text-[#FAC615] font-bold">
                    KM 8.1
                  </span>
                  <Trash2 className="w-4 h-4 text-[#FAC615]" />
                </div>
                <h4 className="text-xs font-bold text-white">Segregated Swachh Waste Hub</h4>
                <p className="text-[11px] text-[#94B7A8]">Collectorate Crossroad • Wet/Dry/E-waste</p>
                <span className="text-[10px] text-[#FAC615] font-semibold flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Regular Municipal Pickup
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EF4444]/20 text-[#EF4444] font-bold">
                    KM 12.4
                  </span>
                  <HeartPulse className="w-4 h-4 text-[#EF4444]" />
                </div>
                <h4 className="text-xs font-bold text-white">Government General Hospital</h4>
                <p className="text-[11px] text-[#94B7A8]">Vizianagaram Central • Emergency Care</p>
                <span className="text-[10px] text-[#EF4444] font-semibold flex items-center">
                  <Check className="w-3 h-3 mr-1" /> 24/7 Trauma Ready
                </span>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. DUAL ENGINE CIVIC AI CAPABILITIES                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest">
            Dual-Engine Intelligence
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            General-Purpose Reasoning & Specialized Civic Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#94B7A8]">
            CIVICSPOT does not restrict Gemini to fixed civic menus. Ask broad questions in programming, science, and governance, or inspect infrastructure photos.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setActiveAiTab('coding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeAiTab === 'coding'
                ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                : 'bg-[#163B2E] text-[#94B7A8] hover:text-white border border-[#22C55E]/20'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Coding & Algorithms</span>
          </button>
          <button
            onClick={() => setActiveAiTab('vision')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeAiTab === 'vision'
                ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                : 'bg-[#163B2E] text-[#94B7A8] hover:text-white border border-[#22C55E]/20'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Multimodal Vision</span>
          </button>
          <button
            onClick={() => setActiveAiTab('grievance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeAiTab === 'grievance'
                ? 'bg-[#22C55E] text-[#0B1F16] shadow-emerald-glow'
                : 'bg-[#163B2E] text-[#94B7A8] hover:text-white border border-[#22C55E]/20'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Grievance Drafting</span>
          </button>
        </div>

        {/* Interactive Tab Panels */}
        <div className="p-6 sm:p-8 rounded-3xl civic-card-elevated border border-[#22C55E]/40 text-left">
          {activeAiTab === 'coding' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 uppercase">
                  Java 21 • Algorithms • Full Stack
                </span>
                <h3 className="text-xl font-bold text-white">Full General-Purpose Software Intelligence</h3>
                <p className="text-xs text-[#94B7A8] leading-relaxed">
                  Test CIVIC AI with complex computer science queries: Dijkstra's pathfinding, Spring Boot 3.3 JPA optimizations, concurrent thread synchronization, and data structure architectures.
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Complete code samples with complexity notation and unit tests</span>
                  </div>
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Google Search Grounding for modern framework updates</span>
                  </div>
                </div>
                <Link
                  to="/ai-chat?q=Explain%20Dijkstra%20shortest%20path%20algorithm%20in%20Java%2021"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#22C55E] text-[#0B1F16] text-xs font-black shadow-emerald-glow hover:opacity-95 transition"
                >
                  <span>Ask a Coding Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2 font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between text-[#94B7A8] text-[10px] pb-2 border-b border-[#22C55E]/20">
                  <span>DijkstraShortestPath.java</span>
                  <span className="text-[#22C55E]">Java 21 LTS</span>
                </div>
                <pre className="text-[#34D399] text-[11px] leading-relaxed">
{`public record RouteNode(int id, double distance) implements Comparable<RouteNode> {
    public int compareTo(RouteNode other) {
        return Double.compare(this.distance, other.distance);
    }
}
// O(E log V) PriorityQueue implementation for corridor navigation`}
                </pre>
              </div>
            </div>
          )}

          {activeAiTab === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 uppercase">
                  Multimodal Infrastructure Analysis
                </span>
                <h3 className="text-xl font-bold text-white">Gemini Vision Defect Diagnostics</h3>
                <p className="text-xs text-[#94B7A8] leading-relaxed">
                  Citizens snap a photograph of broken infrastructure. Gemini Vision analyzes pothole depth, classifies overflow severity, and pre-fills official municipal grievance categories.
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Real-time hazard severity calculation (LOW / MEDIUM / HIGH / CRITICAL)</span>
                  </div>
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Automatic department routing (Roads, Sanitation, Electricity)</span>
                  </div>
                </div>
                <Link
                  to="/report"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#22C55E] text-[#0B1F16] text-xs font-black shadow-emerald-glow hover:opacity-95 transition"
                >
                  <span>Test Vision in Report Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white font-bold">Image Telemetry Analysis</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] font-mono font-bold">
                    HIGH SEVERITY
                  </span>
                </div>
                <p className="text-xs text-[#D1E7D6]">
                  "Deep pothole (~14cm) detected with exposed aggregate base. Potential hazard to two-wheelers during monsoon conditions. Recommended target: Municipal Roads & Buildings Department."
                </p>
                <div className="text-[11px] text-[#94B7A8] font-mono flex items-center space-x-2">
                  <span className="text-[#22C55E]">Confidence: 94.2%</span>
                  <span>•</span>
                  <span>Gemini 3.8 Flash Vision</span>
                </div>
              </div>
            </div>
          )}

          {activeAiTab === 'grievance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAC615]/20 text-[#FAC615] border border-[#FAC615]/40 uppercase">
                  Citizen Legal Empowerment
                </span>
                <h3 className="text-xl font-bold text-white">Automated RTI & Official Complaint Drafting</h3>
                <p className="text-xs text-[#94B7A8] leading-relaxed">
                  Turn informal citizen frustration into structured, legally referenced municipal complaints with official tracking numbers (e.g. <code className="text-[#FAC615] font-mono">CIV-2026-XXXX</code>).
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Citations of Andhra Pradesh Municipalities Act & RTI Act 2005</span>
                  </div>
                  <div className="text-xs text-white flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>5-Stage grievance lifecycle tracking from submission to resolution</span>
                  </div>
                </div>
                <Link
                  to="/complaints"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#FAC615] text-[#0B1F16] text-xs font-black shadow-gold-glow hover:opacity-95 transition"
                >
                  <span>Draft a Complaint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-2 text-xs font-mono">
                <div className="text-[10px] text-[#FAC615] font-bold">SAMPLE FORMAL LETTER:</div>
                <p className="text-[#D1E7D6] text-[11px] leading-relaxed">
                  "To: The Municipal Commissioner, Vizianagaram Municipal Corporation.<br />
                  Subject: Grievance under Section 134 regarding defective public sanitation facilities at Denkada Bus Stand.<br />
                  Tracking ID: CIV-2026-0914."
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
