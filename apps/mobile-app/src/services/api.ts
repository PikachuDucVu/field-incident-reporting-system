import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface ReportData {
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  pollutionType: 'traffic' | 'infrastructure' | 'road' | 'industrial_waste' | 'environment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  images?: string[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  pollutionType: string;
  severity: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  reporterId: {
    username: string;
    email: string;
  };
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export const auth = {
  login: (email: string, password: string) => 
    apiClient.post<LoginResponse>('/auth/login', { email, password }),
  
  register: (userData: RegisterData) => 
    apiClient.post<LoginResponse>('/auth/register', userData),
  
  getProfile: () => 
    apiClient.get('/auth/profile'),
};

export const reports = {
  create: (reportData: ReportData) => 
    apiClient.post('/reports', reportData),
  
  getAll: (params?: { status?: string; page?: number; limit?: number }) => 
    apiClient.get('/reports', { params }),
  
  getById: (id: string) => 
    apiClient.get(`/reports/${id}`),
  
  updateStatus: (id: string, status: string, adminNotes?: string) => 
    apiClient.put(`/reports/${id}/status`, { status, adminNotes }),
  
  getNearby: (latitude: number, longitude: number, radius?: number) => 
    apiClient.get('/reports/nearby', { 
      params: { latitude, longitude, radius } 
    }),
};

// Convenience exports
export const login = auth.login;
export const register = auth.register;
export const getProfile = auth.getProfile;
export const createReport = reports.create;
export const getReports = reports.getAll;
export const getReportById = reports.getById;
export const getNearbyReports = reports.getNearby;
