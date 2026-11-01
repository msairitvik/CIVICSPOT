import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Camera,
  MapPin,
  Sparkles,
  UploadCloud,
  X,
  ArrowRight,
  LocateFixed,
  HelpCircle,
  Trash2,
  Droplets,
  Lightbulb,
  Route,
  Accessibility,
  ShieldAlert
} from 'lucide-react';
import { reportApi, aiApi, geocodingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CitizenReportingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [issueCategory, setIssueCategory] = useState(searchParams.get('issue') || 'DIRTY_TOILET');
  const [facilityId] = useState<number | undefined>(
    searchParams.get('facilityId') ? Number(searchParams.get('facilityId')) : undefined
  );
  const [facilityName, setFacilityName] = useState(searchParams.get('facilityName') || '');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(
    searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined
  );
  const [longitude, setLongitude] = useState<number | undefined>(
    searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined
  );

  // Photo & AI analysis state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [aiAssessment, setAiAssessment] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          try {
            const rev = await geocodingApi.reverse(pos.coords.latitude, pos.coords.longitude);
            if (rev && rev.displayName) {
              setAddress(rev.displayName);
            } else {
              setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            }
          } catch (e) {
            setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        (err) => alert('Could not retrieve GPS location: ' + err.message)
      );
    }
  };

  useEffect(() => {
    if (!latitude && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          try {
            const rev = await geocodingApi.reverse(pos.coords.latitude, pos.coords.longitude);
            if (rev && rev.displayName) {
              setAddress(rev.displayName);
            }
          } catch (e) {
            console.log('Reverse geocoding error:', e);
          }
        },
        (err) => console.warn('GPS query fallback:', err.message)
      );
    }
  }, [latitude]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageBase64(base64);
        triggerAiAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAiAnalysis = async (base64: string) => {
    setAnalyzingImage(true);
    try {
      const res = await aiApi.analyzeImage({
        imageBase64: base64,
        contextPrompt: `Analyze this image for civic issue: ${issueCategory}. Assess severity, municipal hazard, and necessary remediation.`,
      });
      setAiAssessment(res.assessment);
      if (res.severityEstimate && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(res.severityEstimate)) {
        setSeverity(res.severityEstimate as any);
      }
    } catch (e) {
      console.warn('AI analysis skipped:', e);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/report' } } });
      return;
    }

    if (!description.trim()) {
      setError('Please provide a short description of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reportApi.create({
        facilityId,
        facilityName: facilityName || undefined,
        issueCategory,
        description,
        latitude,
        longitude,
        address,
        severity,
        imageBase64: imageBase64 || undefined,
      });

      navigate('/my-reports');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const issueCategories = [
    { value: 'DIRTY_TOILET', label: 'Dirty / Unhygienic Restroom', icon: HelpCircle, color: '#22C55E' },
    { value: 'BROKEN_INFRASTRUCTURE', label: 'Broken Plumbing / Fixtures', icon: ShieldAlert, color: '#EF4444' },
    { value: 'OVERFLOWING_DUSTBIN', label: 'Overflowing Waste Receptacle', icon: Trash2, color: '#FAC615' },
    { value: 'NO_DRINKING_WATER', label: 'No Drinking Water / Broken Tap', icon: Droplets, color: '#38BDF8' },
    { value: 'BROKEN_STREETLIGHT', label: 'Non-Functional Streetlight', icon: Lightbulb, color: '#FAC615' },
    { value: 'DAMAGED_ROAD', label: 'Road Pothole / Footpath Damage', icon: Route, color: '#FB923C' },
    { value: 'ACCESSIBILITY_BARRIER', label: 'Blocked Ramp / Barrier', icon: Accessibility, color: '#22C55E' },
    { value: 'OTHER', label: 'Other Civic Defect', icon: AlertTriangle, color: '#34D399' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      
      {/* Header Matching Reference Image 2 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAF5] tracking-tight">
          Report a Civic Issue
        </h1>
        <p className="text-sm text-[#94B7A8] max-w-md mx-auto font-medium">
          Help us keep your city better
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-[#1E4D3A] border border-[#163B2E] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22C55E] via-[#FAC615] to-[#34D399]" />
        
        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-2xl text-xs text-[#EF4444] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Category, Location, Description */}
            <div className="space-y-5">
              
              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAF5] tracking-wide">
                  Issue Category *
                </label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value)}
                  className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] px-4 py-3 text-xs text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] cursor-pointer"
                >
                  {issueCategories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#0B1F16] text-[#F8FAF5]">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAF5] tracking-wide">
                  Location *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter location or area..."
                    className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] pl-4 pr-36 py-3 text-xs text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] placeholder-[#94B7A8]"
                  />
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="absolute right-2 px-3 py-1.5 bg-[#163B2E] hover:bg-[#22C55E] text-[#22C55E] hover:text-[#0B1F16] text-[11px] font-bold rounded-xl transition flex items-center space-x-1"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    <span>Detect my location</span>
                  </button>
                </div>
              </div>

              {/* Describe Issue */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAF5] tracking-wide">
                  Describe the issue *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Broken street light near main road, overflowing dustbin in residential area..."
                  className="w-full bg-[#0B1F16] rounded-2xl border border-[#163B2E] p-4 text-xs text-[#F8FAF5] focus:outline-none focus:border-[#22C55E] placeholder-[#94B7A8] transition"
                />
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F8FAF5] tracking-wide">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2 text-[11px]">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-xl font-bold transition border ${
                        severity === sev
                          ? 'bg-[#22C55E] text-[#0B1F16] border-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                          : 'bg-[#0B1F16] text-[#94B7A8] border-[#163B2E] hover:text-[#F8FAF5]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Upload Photos Dropzone */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#F8FAF5] tracking-wide">
                Upload Photos
              </label>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />

              {!imageBase64 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#163B2E] hover:border-[#22C55E] rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition bg-[#0B1F16]/70 group hover:bg-[#0B1F16] min-h-[260px] flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#163B2E] flex items-center justify-center text-[#22C55E] group-hover:scale-110 transition">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#F8FAF5]">Drag & drop or click to upload</p>
                    <p className="text-[11px] text-[#94B7A8] mt-1">JPG, PNG, up to 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-3xl overflow-hidden border border-[#163B2E] bg-[#0B1F16] max-h-64 flex items-center justify-center">
                    <img src={imageBase64} alt="Report evidence" className="w-full h-full object-cover rounded-3xl" />
                    <button
                      type="button"
                      onClick={() => { setImageBase64(null); setAiAssessment(null); }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0B1F16]/80 text-[#F8FAF5] hover:bg-[#EF4444] transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Gemini AI Assessment */}
                  {analyzingImage ? (
                    <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#163B2E] text-xs flex items-center space-x-3 text-[#F8FAF5]">
                      <div className="w-4 h-4 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                      <span>Gemini Vision AI is analyzing image defects & severity...</span>
                    </div>
                  ) : aiAssessment ? (
                    <div className="p-4 rounded-2xl bg-[#0B1F16] border border-[#22C55E]/40 space-y-1.5 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-[#22C55E]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FAC615]" />
                        <span>Gemini Vision Assessment</span>
                      </div>
                      <p className="text-xs text-[#D1E7D6] leading-relaxed font-medium">
                        {aiAssessment}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

          </div>

          {/* Bottom Gold CTA Button Matching Reference Image 2 */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-full bg-[#FAC615] hover:bg-[#eab308] text-[#0B1F16] text-xs font-black shadow-[0_0_20px_rgba(250,198,21,0.5)] transition duration-200 flex items-center space-x-2 disabled:opacity-50 active:scale-95 tracking-wide"
            >
              <span>{submitting ? 'Submitting Issue...' : 'Submit Issue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
