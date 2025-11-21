// Tipos baseados no schema Prisma do backend

export const TransactionType = {
  PURCHASE: 'PURCHASE',
  REFUND: 'REFUND',
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const CosmeticCategory = {
  BR: 'BR',
  TRACK: 'TRACK',
  INSTRUMENT: 'INSTRUMENT',
  CAR: 'CAR',
  LEGO: 'LEGO',
  LEGOKIT: 'LEGOKIT',
  BEAN: 'BEAN',
} as const;
export type CosmeticCategory = typeof CosmeticCategory[keyof typeof CosmeticCategory];

export interface User {
  id: string;
  email: string;
  vbucks: number;
  cosmetics?: UserCosmetic[];
  transactions?: Transaction[];
  createdAt: string;
}

export interface Cosmetic {
  id: string;
  name: string;
  description?: string;
  type?: string;
  rarity?: string;
  series?: string;
  setName?: string;
  category: CosmeticCategory;
  shopHistory?: string[];
  addedAt?: string;
  createdAt: string;
  updatedAt: string;
  brCosmetic?: BRCosmetic;
  track?: Track;
  instrument?: Instrument;
  car?: Car;
  legoItem?: LegoItem;
  legoKit?: LegoKit;
  bean?: Bean;
  bundles?: BundleCosmetic[];
  shopEntries?: ShopEntry[];
}

export interface BRCosmetic {
  id: string;
  exclusiveDescription?: string;
  unlockRequirements?: string;
  customExclusiveCallout?: string;
  imageSmallIcon?: string;
  imageIcon?: string;
  imageFeatured?: string;
  imageLegoSmall?: string;
  imageLegoLarge?: string;
  imageLegoWide?: string;
  imageBeanSmall?: string;
  imageBeanLarge?: string;
  variants?: Variant[];
  introduction?: Introduction;
  builtInEmoteIds?: string[];
  searchTags?: string[];
  gameplayTags?: string[];
  metaTags?: string[];
  showcaseVideo?: string;
  dynamicPakId?: string;
  itemPreviewHeroPath?: string;
  displayAssetPath?: string;
  definitionPath?: string;
  path?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface Variant {
  channel: string;
  type: string;
  options: VariantOption[];
}

export interface VariantOption {
  tag: string;
  name: string;
  image?: string;
}

export interface Introduction {
  chapter: string;
  season: string;
  text: string;
  backendValue: number;
}

export interface Track {
  id: string;
  devName?: string;
  title?: string;
  artist?: string;
  album?: string;
  releaseYear?: number;
  bpm?: number;
  duration?: number;
  difficulty?: TrackDifficulty;
  genres?: string[];
  albumArt?: string;
  gameplayTags?: string[];
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface TrackDifficulty {
  vocals?: number;
  guitar?: number;
  bass?: number;
  plasticBass?: number;
  drums?: number;
  plasticDrums?: number;
}

export interface Instrument {
  id: string;
  imageSmall?: string;
  imageLarge?: string;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface Car {
  id: string;
  vehicleId?: string;
  imageSmall?: string;
  imageLarge?: string;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface LegoItem {
  id: string;
  cosmeticId?: string;
  soundLibraryTags?: string[];
  imageSmall?: string;
  imageLarge?: string;
  imageWide?: string;
  path?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface LegoKit {
  id: string;
  imageSmall?: string;
  imageLarge?: string;
  imageWide?: string;
  gameplayTags?: string[];
  path?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface Bean {
  id: string;
  cosmeticId?: string;
  gender?: string;
  imageSmall?: string;
  imageLarge?: string;
  gameplayTags?: string[];
  path?: string;
  price?: number;
  isNew: boolean;
  isOnSale: boolean;
}

export interface Bundle {
  id: string;
  name: string;
  info?: string;
  imageUrl?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
  cosmetics?: BundleCosmetic[];
}

export interface BundleCosmetic {
  id: string;
  bundleId: string;
  cosmeticId: string;
  Bundle?: Bundle;
  Cosmetic?: Cosmetic;
}

export interface ShopEntry {
  id: string;
  offerId?: string;
  devName?: string;
  regularPrice?: number;
  finalPrice?: number;
  bannerText?: string;
  bannerValue?: string;
  bannerIntensity?: string;
  bannerBackendValue?: string;
  offerTagId?: string;
  offerTagText?: string;
  inDate?: string;
  outDate?: string;
  layoutId?: string;
  layoutName?: string;
  sortPriority?: number;
  isGiftable?: boolean;
  isRefundable?: boolean;
  bundleId?: string;
  cosmeticId?: string;
  category?: string;
  rawData?: any;
  Bundle?: Bundle;
  Cosmetic?: Cosmetic;
}

export interface UserCosmetic {
  id: string;
  userId: string;
  cosmeticId: string;
  acquiredAt: string;
  refundedAt?: string;
  isActive: boolean;
  User?: User;
  Cosmetic?: Cosmetic;
}

export interface Transaction {
  id: string;
  userId: string;
  cosmeticId?: string;
  bundleId?: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
  User?: User;
  Cosmetic?: Cosmetic;
  Bundle?: Bundle;
}

// Tipos de resposta da API

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ShopSection {
  title: string;
  items: ShopItem[];
  count: number;
}

export interface ShopResponse {
  refreshDate: string;
  sections: {
    bundles: ShopSection;
    featured: ShopSection;
    daily: ShopSection;
    special: ShopSection;
  };
  totalItems: number;
}

export interface ShopItem {
  type: 'bundle' | 'item';
  offerId: string;
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  regularPrice: number;
  isOnSale: boolean;
  discount: number;
  banner?: {
    text: string;
    value: string;
    intensity: string;
  };
  tag?: {
    id: string;
    text: string;
  };
  isNew: boolean;
  owned: boolean;
  isGiftable: boolean;
  isRefundable: boolean;
  expiresAt?: string;
  // Para itens individuais
  itemType?: string;
  rarity?: string;
  series?: string;
  category?: string;
  // Para bundles
  items?: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    category: string;
    image?: string;
    owned: boolean;
  }[];
}

export interface StatsResponse {
  total: number;
  byType: {
    br: number;
    tracks: number;
    instruments: number;
    cars: number;
    lego: number;
    legoKits: number;
    beans: number;
  };
  byCategory: {
    category: string;
    count: number;
  }[];
  byRarity: {
    rarity: string;
    count: number;
  }[];
  recentlyAdded: Cosmetic[];
}

export interface QueryCosmeticsDto {
  category?: CosmeticCategory;
  rarity?: string;
  type?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PurchaseDto {
  cosmeticId?: string;
  bundleId?: string;
}

export interface PurchaseHistoryItem {
  id: string;
  type: TransactionType;
  amount: number;
  createdAt: string;
  cosmetic?: Cosmetic;
  bundle?: Bundle;
}
