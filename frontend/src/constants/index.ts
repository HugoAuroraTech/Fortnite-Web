// Constantes da aplicação

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const RARITIES = [
  'Comum',
  'Incomum',
  'Raro',
  'Épico',
  'Lendário',
  'Icônico',
  'Mítico',
  'Exótico',
] as const;

export const COSMETIC_TYPES = [
  'Traje',
  'Picareta',
  'Asa-delta',
  'Emote',
  'Mochila',
  'Pintura',
  'Rastro',
  'Tela de Carregamento',
  'Música',
  'Grafite',
  'Emoji',
  'Estandarte',
  'Brinquedo',
] as const;

export const RARITY_COLORS: Record<string, string> = {
  'Comum': 'bg-gray-500',
  'Incomum': 'bg-green-500',
  'Raro': 'bg-blue-500',
  'Épico': 'bg-purple-500',
  'Lendário': 'bg-orange-500',
  'Icônico': 'bg-cyan-500',
  'Mítico': 'bg-yellow-500',
  'Exótico': 'bg-pink-500',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  SHOP: '/shop',
  COSMETICS: '/cosmetics',
  COSMETIC_DETAIL: '/cosmetics/:id',
  NEW_ITEMS: '/cosmetics/new',
  ON_SALE: '/cosmetics/on-sale',
  PROFILE: '/profile',
  WISHLIST: '/wishlist',
  STATS: '/stats',
} as const;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'fortnite_token',
  USER: 'fortnite_user',
  WISHLIST: 'fortnite_wishlist',
  THEME: 'fortnite_theme',
  SEARCH_HISTORY: 'fortnite_search_history',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  SHOP: 'shop',
  COSMETICS: 'cosmetics',
  COSMETIC: 'cosmetic',
  STATS: 'stats',
  PROFILE: 'profile',
  HISTORY: 'history',
  USER_COSMETICS: 'user_cosmetics',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
} as const;
