import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '@/constants';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  PaginatedResponse,
  Cosmetic,
  ShopResponse,
  StatsResponse,
  QueryCosmeticsDto,
  PurchaseDto,
  PurchaseHistoryItem,
} from '@/types';

// Criar instância do Axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT nas requisições
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Se receber 401, remover token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ENDPOINTS ==========

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// ========== USER ENDPOINTS ==========

export const userApi = {
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  getUserCosmetics: async (userId: string): Promise<Cosmetic[]> => {
    const response = await api.get<Cosmetic[]>(`/users/${userId}/cosmetics`);
    return response.data;
  },
};

// ========== COSMETICS ENDPOINTS ==========

export const cosmeticsApi = {
  getAll: async (params?: QueryCosmeticsDto): Promise<PaginatedResponse<Cosmetic>> => {
    const response = await api.get<PaginatedResponse<Cosmetic>>('/cosmetics', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Cosmetic> => {
    const response = await api.get<Cosmetic>(`/cosmetics/${id}`);
    return response.data;
  },

  getNew: async (params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Cosmetic>> => {
    const response = await api.get<PaginatedResponse<Cosmetic>>('/cosmetics/new', { params });
    return response.data;
  },

  getOnSale: async (params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Cosmetic>> => {
    const response = await api.get<PaginatedResponse<Cosmetic>>('/cosmetics/on-sale', { params });
    return response.data;
  },

  getFeatured: async (params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Cosmetic>> => {
    const response = await api.get<PaginatedResponse<Cosmetic>>('/cosmetics/featured', { params });
    return response.data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>('/cosmetics/stats/summary');
    return response.data;
  },

  sync: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/cosmetics/sync');
    return response.data;
  },
};

// ========== SHOP ENDPOINTS ==========

export const shopApi = {
  getCurrent: async (userId?: string): Promise<ShopResponse> => {
    const params = userId ? { userId } : undefined;
    const response = await api.get<ShopResponse>('/shop/current', { params });
    return response.data;
  },

  buy: async (data: PurchaseDto): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/shop/buy', data);
    return response.data;
  },

  refund: async (data: PurchaseDto): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/shop/refund', data);
    return response.data;
  },

  getHistory: async (): Promise<PurchaseHistoryItem[]> => {
    const response = await api.get<PurchaseHistoryItem[]>('/shop/history');
    return response.data;
  },
};

export default api;
