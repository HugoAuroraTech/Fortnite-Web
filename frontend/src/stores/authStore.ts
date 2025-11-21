import { create } from 'zustand';
import { authApi, userApi } from '@/lib/api';
import { LOCAL_STORAGE_KEYS } from '@/constants';
import type { User, LoginDto, RegisterDto } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(data);

      // Salvar token e usuário no localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.access_token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  register: async (data: RegisterDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);

      // Salvar token e usuário no localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, response.access_token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao registrar';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: () => {
    // Remover token e usuário do localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateUser: (user: User) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    set({ user });
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedUser = await userApi.getProfile(user.id);
      get().updateUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Função para inicializar o estado de autenticação do localStorage
export const initializeAuth = () => {
  try {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);

    if (token && userStr && userStr !== 'undefined') {
      const user = JSON.parse(userStr) as User;
      useAuthStore.setState({
        user,
        token,
        isAuthenticated: true,
      });
    } else {
      // Limpar dados inválidos
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Erro ao carregar dados de autenticação:', error);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }
};
