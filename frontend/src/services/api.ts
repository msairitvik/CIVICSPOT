import axios from 'axios';
import {
  User,
  Facility,
  FacilityCategory,
  FacilityReport,
  Complaint,
  ChatResponse,
  RouteResponse,
  GovernmentScheme,
  OverviewAnalytics,
  AgentLog,
  FacilityReview,
  FacilityRecommendation,
  GeocodingResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('civicspot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ token: string } & User>('/auth/login', { email, password });
    return res.data;
  },
  register: async (data: { name: string; email: string; password: string; phone?: string; preferredLanguage?: string }) => {
    const res = await apiClient.post<{ token: string } & User>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  updateProfile: async (data: Partial<User>) => {
    const res = await apiClient.put<User>('/auth/profile', data);
    return res.data;
  },
};

export const geocodingApi = {
  search: async (query: string, limit: number = 5) => {
    const res = await apiClient.get<GeocodingResult[]>('/geocoding/search', { params: { query, limit } });
    return res.data;
  },
  reverse: async (lat: number, lng: number) => {
    const res = await apiClient.get<GeocodingResult>('/geocoding/reverse', { params: { lat, lng } });
    return res.data;
  },
};

export const facilityApi = {
  getNearby: async (params: { lat?: number; lng?: number; radius?: number; category?: FacilityCategory; accessible?: boolean }) => {
    const res = await apiClient.get<Facility[]>('/facilities/nearby', { params });
    return res.data;
  },
  getRecommendations: async (params: { lat?: number; lng?: number; radius?: number; category?: FacilityCategory; accessible?: boolean; top?: number }) => {
    const res = await apiClient.get<FacilityRecommendation[]>('/facilities/recommendations', { params });
    return res.data;
  },
  getAll: async (params?: { category?: FacilityCategory; search?: string }) => {
    const res = await apiClient.get<Facility[]>('/facilities', { params });
    return res.data;
  },
  getById: async (id: number, lat?: number, lng?: number) => {
    const res = await apiClient.get<Facility>(`/facilities/${id}`, { params: { lat, lng } });
    return res.data;
  },
  toggleSave: async (id: number) => {
    const res = await apiClient.post<{ saved: boolean }>(`/facilities/${id}/save`);
    return res.data;
  },
  getSaved: async () => {
    const res = await apiClient.get<Facility[]>('/facilities/saved');
    return res.data;
  },
  create: async (data: Partial<Facility>) => {
    const res = await apiClient.post<Facility>('/facilities', data);
    return res.data;
  },
  getReviews: async (facilityId: number) => {
    const res = await apiClient.get<FacilityReview[]>(`/facilities/${facilityId}/reviews`);
    return res.data;
  },
  addReview: async (facilityId: number, data: { rating: number; cleanlinessLevel?: string; comment?: string; evidencePhotoUrl?: string }) => {
    const res = await apiClient.post<FacilityReview>(`/facilities/${facilityId}/reviews`, data);
    return res.data;
  },
};

export const aiApi = {
  getHealth: async () => {
    const res = await apiClient.get<{
      status: string;
      provider: string;
      model: string;
      fallbackModel: string;
      apiKeyConfigured: boolean;
      searchGrounding: boolean;
      multimodalVision: boolean;
      latencyMs: number;
      timestamp: string;
    }>('/ai/health');
    return res.data;
  },
  chat: async (data: { message: string; sessionId?: string; latitude?: number; longitude?: number; imageBase64?: string; mimeType?: string }) => {
    const res = await apiClient.post<ChatResponse>('/ai/chat', data);
    return res.data;
  },
  analyzeImage: async (data: { imageBase64: string; mimeType?: string; contextPrompt?: string }) => {
    const res = await apiClient.post<{ assessment: string; detectedIssueCategory: string; severityEstimate: string; detectedFeatures: string[]; disclaimer: string }>('/ai/analyze-image', data);
    return res.data;
  },
  getSessions: async () => {
    const res = await apiClient.get<{ id: string; title: string; createdAt: string; updatedAt: string }[]>('/ai/sessions');
    return res.data;
  },
  deleteSession: async (id: string) => {
    await apiClient.delete(`/ai/sessions/${id}`);
  },
};

export const reportApi = {
  create: async (data: { facilityId?: number; facilityName?: string; issueCategory: string; description: string; latitude?: number; longitude?: number; address?: string; severity?: string; imageBase64?: string }) => {
    const res = await apiClient.post<FacilityReport>('/reports', data);
    return res.data;
  },
  getAll: async (status?: string) => {
    const res = await apiClient.get<FacilityReport[]>('/reports', { params: { status } });
    return res.data;
  },
  getUserReports: async () => {
    const res = await apiClient.get<FacilityReport[]>('/reports/user');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<FacilityReport>(`/reports/${id}`);
    return res.data;
  },
  updateStatus: async (id: number, status: string, adminNotes?: string) => {
    const res = await apiClient.patch<FacilityReport>(`/reports/${id}/status`, { status, adminNotes });
    return res.data;
  },
};

export const complaintApi = {
  create: async (data: { title: string; category: string; description: string; latitude?: number; longitude?: number; address?: string; department?: string; priority?: string; imageBase64?: string }) => {
    const res = await apiClient.post<Complaint>('/complaints', data);
    return res.data;
  },
  getAll: async (status?: string) => {
    const res = await apiClient.get<Complaint[]>('/complaints', { params: { status } });
    return res.data;
  },
  getUserComplaints: async () => {
    const res = await apiClient.get<Complaint[]>('/complaints/user');
    return res.data;
  },
  track: async (trackingNumber: string) => {
    const res = await apiClient.get<Complaint>(`/complaints/track/${encodeURIComponent(trackingNumber)}`);
    return res.data;
  },
  updateStatus: async (id: number, status: string, resolutionNotes?: string) => {
    const res = await apiClient.patch<Complaint>(`/complaints/${id}/status`, { status, resolutionNotes });
    return res.data;
  },
};

export const navigationApi = {
  getRoute: async (data: { originLat: number; originLng: number; originName?: string; destinationLat: number; destinationLng: number; destinationName?: string; travelMode?: string }) => {
    const res = await apiClient.post<RouteResponse>('/navigation/route', data);
    return res.data;
  },
};

export const schemeApi = {
  search: async (params?: { search?: string; category?: string }) => {
    const res = await apiClient.get<GovernmentScheme[]>('/civic-information/schemes', { params });
    return res.data;
  },
  getById: async (id: number) => {
    const res = await apiClient.get<GovernmentScheme>(`/civic-information/schemes/${id}`);
    return res.data;
  },
};

export const analyticsApi = {
  getOverview: async () => {
    const res = await apiClient.get<OverviewAnalytics>('/analytics/overview');
    return res.data;
  },
};

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get<Record<string, any>>('/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await apiClient.get<User[]>('/admin/users');
    return res.data;
  },
  getLogs: async () => {
    const res = await apiClient.get<AgentLog[]>('/admin/logs');
    return res.data;
  },
  getHealth: async () => {
    const res = await apiClient.get<Record<string, any>>('/admin/health');
    return res.data;
  },
};

export default apiClient;
