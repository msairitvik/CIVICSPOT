export type Role = 'CITIZEN' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  preferredLanguage: string; // 'en' | 'hi' | 'te'
  wheelchairUser: boolean;
  audioAssistance: boolean;
  highContrast: boolean;
}

export type FacilityCategory =
  | 'PUBLIC_TOILET'
  | 'DRINKING_WATER'
  | 'DUSTBIN'
  | 'HOSPITAL'
  | 'PHARMACY'
  | 'POLICE_STATION'
  | 'BUS_STOP'
  | 'RAILWAY_STATION'
  | 'PUBLIC_PARK'
  | 'REST_AREA'
  | 'EV_CHARGING'
  | 'ACCESSIBLE_FACILITY'
  | 'PUBLIC_WIFI'
  | 'GOVT_CENTRE'
  | 'COMMUNITY_CENTRE'
  | 'OTHER';

export interface Facility {
  id: number;
  name: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  address?: string;
  area?: string;
  isAccessible: boolean;
  hasRamp: boolean;
  isFree: boolean;
  fee?: string;
  openingHours?: string;
  operationalStatus?: string;
  cleanlinessRating?: number;
  totalReviews?: number;
  osmId?: string;
  verified: boolean;
  source?: string;
  additionalDetails?: string;
  distanceKm?: number;
  createdAt?: string;
}

export interface FacilityReport {
  id: number;
  facilityId?: number;
  facilityName?: string;
  userId?: number;
  userName?: string;
  issueCategory: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  imageUrl?: string;
  aiAssessment?: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ComplaintEvidence {
  id: number;
  imageUrl: string;
  aiAnalysis?: string;
  uploadedAt: string;
}

export interface Complaint {
  id: number;
  trackingNumber: string;
  userId?: number;
  userName?: string;
  title: string;
  category: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  evidence: ComplaintEvidence[];
  statusHistory?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GovernmentScheme {
  id: number;
  schemeName: string;
  ministry: string;
  category: string;
  description: string;
  eligibilityCriteria?: string;
  benefits?: string;
  documentsRequired?: string;
  applicationProcedure?: string;
  officialUrl?: string;
  lastVerifiedDate?: string;
  source?: string;
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface FunctionCallLog {
  name: string;
  arguments: Record<string, any>;
  result: any;
}

export interface AgentLog {
  agentName: string;
  query: string;
  step: string;
  status: string;
  executionTimeMs: number;
  details: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  routingCategory: string;
  citations: Citation[];
  functionCalls: FunctionCallLog[];
  agentLogs: AgentLog[];
  facilityCards: Facility[];
  actionRequired: boolean;
  actionType?: string;
  actionData?: Record<string, any>;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResponse {
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  coordinates: [number, number][]; // [lon, lat]
  steps: RouteStep[];
  facilitiesAlongRoute: Facility[];
  travelMode: string;
  summary: string;
}

export interface InfrastructureGap {
  area: string;
  missingFacilityType: string;
  populationDensityScore: number;
  currentCoverageScore: number;
  urgencyScore: number;
  recommendation: string;
}

export interface FacilityReview {
  id: number;
  facilityId: number;
  facilityName: string;
  userId?: number;
  userName: string;
  rating: number; // 1-5
  cleanlinessLevel: string;
  comment: string;
  evidencePhotoUrl?: string;
  createdAt: string;
}

export interface FacilityRecommendation {
  facility: Facility;
  recommendationScore: number;
  recommendationReason: string;
  keyStrengths: string[];
  statusNotice: string;
}

export interface GeocodingResult {
  displayName: string;
  latitude: number;
  longitude: number;
  placeType?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface OverviewAnalytics {
  totalFacilities: number;
  totalReports: number;
  totalComplaints: number;
  resolvedComplaints: number;
  averageCleanlinessScore: number;
  facilitiesByCategory: { category: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  complaintsByStatus: { status: string; count: number }[];
  reportsByIssueType: { category: string; count: number }[];
  infrastructureGaps: InfrastructureGap[];
}
