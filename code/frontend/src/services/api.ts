import axios from 'axios';

// Base API URL - use relative path in development to work with Vite proxy
// In production, use the full API URL from environment variable
const API_BASE_URL = import.meta.env.PROD 
  ? ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000')
  : ''; // Empty string means use relative paths in dev mode

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('agriconnect_auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('agriconnect_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API endpoints
export const userAPI = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    nic: string;
    address: string;
    division: string;
    district: string;
    role: 'farmer' | 'admin';
    isBlocked?: boolean;
  }) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/api/users/login', credentials);
      return response.data;
    } catch (error: any) {
      // Re-throw with better error handling
      throw error;
    }
  },
};

// Farm API endpoints
export const farmAPI = {
  createFarm: async (farmData: {
    farmName: string;
    location: string;
    crop: string;
    sizeInAcres: number;
    farmerNIC: string;
    district: string;
    status?: string;
  }) => {
    const response = await api.post('/api/farms', farmData);
    return response.data;
  },

  updateFarm: async (farmId: string, farmData: {
    farmName?: string;
    location?: string;
    crop?: string;
    sizeInAcres?: number;
    district?: string;
    status?: string;
  }) => {
    const response = await api.put(`/api/farms/${farmId}`, farmData);
    return response.data;
  },

  deleteFarm: async (farmId: string) => {
    const response = await api.delete(`/api/farms/${farmId}`);
    return response.data;
  },

  addHarvestAndPoints: async (harvestData: {
    farmId: string;
    season: string;
    year: string;
    harvestQty: number;
  }) => {
    const response = await api.post('/api/farms/addharvestandpoints', harvestData);
    return response.data;
  },

  getAllFarms: async () => {
    const response = await api.get('/api/farms');
    return response.data;
  },

  getFarmById: async (farmId: string) => {
    const response = await api.get(`/api/farms/${farmId}`);
    return response.data;
  },
};

// Average Yield API endpoints
export const avgYieldAPI = {
  getAll: async () => {
    const response = await api.get('/api/avgYields');
    return response.data;
  },

  create: async (yieldData: {
    crop: string;
    location: string;
    avgYield: number;
  }) => {
    const response = await api.post('/api/avgYields', yieldData);
    return response.data;
  },
};

// Export the axios instance for custom requests
export default api;
