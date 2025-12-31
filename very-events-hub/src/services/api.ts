import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API - VeryChat Integration
export const authApi = {
  // Step 1: Request verification code via VeryChat
  requestCode: async (handleId: string) => {
    const { data } = await api.post('/api/auth/request-code', { handleId });
    return data;
  },

  // Step 2: Verify code only (no login)
  verifyCode: async (handleId: string, verificationCode: string) => {
    const { data } = await api.post('/api/auth/verify-code', { handleId, verificationCode });
    return data;
  },

  // Step 3: Login - verify code and get tokens
  login: async (handleId: string, verificationCode: string, walletAddress?: string) => {
    const { data } = await api.post('/api/auth/login', { handleId, verificationCode, walletAddress });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('handle_id', handleId);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  // Refresh tokens
  refreshToken: async () => {
    const handleId = localStorage.getItem('handle_id');
    const refreshToken = localStorage.getItem('refresh_token');
    if (!handleId || !refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await api.post('/api/auth/refresh', { handleId, refreshToken });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data;
  },

  // Get current user from API
  getMe: async () => {
    const { data } = await api.get('/api/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('handle_id');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

// Events API
export const eventsApi = {
  getAll: async () => {
    const { data } = await api.get('/api/events');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/api/events/${id}`);
    return data;
  },

  create: async (eventData: {
    name: string;
    description: string;
    location: string;
    isVirtual: boolean;
    date: string;
    ticketPrice: number;
    maxTickets: number;
    category: string;
    imageUrl?: string;
  }) => {
    const { data } = await api.post('/api/events', eventData);
    return data;
  },

  activate: async (id: string, contractAddress: string) => {
    const { data } = await api.patch(`/api/events/${id}/activate`, { contractAddress });
    return data;
  },
};

// Tickets API
export const ticketsApi = {
  buy: async (eventId: string, txHash?: string, tokenId?: number) => {
    const { data } = await api.post('/api/tickets/buy', { eventId, txHash, tokenId });
    return data;
  },

  getMyTickets: async () => {
    const { data } = await api.get('/api/tickets/my');
    return data;
  },

  checkin: async (ticketId: string) => {
    const { data } = await api.post(`/api/tickets/${ticketId}/checkin`);
    return data;
  },
};

// Health check
export const healthCheck = async () => {
  const { data } = await api.get('/api/health');
  return data;
};

export default api;
