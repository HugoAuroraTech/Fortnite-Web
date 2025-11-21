/* eslint-disable @typescript-eslint/no-explicit-any */

// ==================== Tipos Comuns ====================

export interface ApiType {
  value: string;
  displayValue: string;
  backendValue: string;
}

export interface ApiRarity {
  value: string;
  displayValue: string;
  backendValue: string;
}

export interface ApiSeries {
  value: string;
  image: string;
  colors: string[];
  backendValue: string;
}

export interface ApiSet {
  value: string;
  text: string;
  backendValue: string;
}

export interface ApiIntroduction {
  chapter: string;
  season: string;
  text: string;
  backendValue: number;
}

export interface ApiVariantOption {
  tag: string;
  name: string;
  unlockRequirements?: string;
  image?: string;
}

export interface ApiVariant {
  channel: string;
  type: string;
  options: ApiVariantOption[];
}

export interface ApiBRImages {
  smallIcon?: string;
  icon?: string;
  featured?: string;
  lego?: {
    small?: string;
    large?: string;
    wide?: string;
  };
  bean?: {
    small?: string;
    large?: string;
  };
  other?: Record<string, any>;
}

export interface ApiSimpleImages {
  small?: string;
  large?: string;
  wide?: string;
}

// ==================== Items BR ====================

export interface ApiBRItem {
  id: string;
  name: string;
  description?: string;
  exclusiveDescription?: string;
  unlockRequirements?: string;
  customExclusiveCallout?: string;
  type?: ApiType;
  rarity?: ApiRarity;
  series?: ApiSeries;
  set?: ApiSet;
  introduction?: ApiIntroduction;
  images?: ApiBRImages;
  variants?: ApiVariant[];
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
  added?: string;
  shopHistory?: string[];
}

// ==================== Tracks ====================

export interface ApiTrackDifficulty {
  vocals?: number;
  guitar?: number;
  bass?: number;
  plasticBass?: number;
  drums?: number;
  plasticDrums?: number;
}

export interface ApiTrack {
  id: string;
  devName?: string;
  title?: string;
  artist?: string;
  album?: string;
  releaseYear?: number;
  bpm?: number;
  duration?: number;
  difficulty?: ApiTrackDifficulty;
  gameplayTags?: string[];
  genres?: string[];
  albumArt?: string;
  added?: string;
  shopHistory?: string[];
}

// ==================== Instruments ====================

export interface ApiInstrument {
  id: string;
  name: string;
  description?: string;
  type?: ApiType;
  rarity?: ApiRarity;
  images?: ApiSimpleImages;
  series?: ApiSeries;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  added?: string;
  shopHistory?: string[];
}

// ==================== Cars ====================

export interface ApiCar {
  id: string;
  vehicleId?: string;
  name: string;
  description?: string;
  type?: ApiType;
  rarity?: ApiRarity;
  images?: ApiSimpleImages;
  series?: ApiSeries;
  gameplayTags?: string[];
  path?: string;
  showcaseVideo?: string;
  added?: string;
  shopHistory?: string[];
}

// ==================== Lego ====================

export interface ApiLegoItem {
  id: string;
  cosmeticId?: string;
  soundLibraryTags?: string[];
  images?: ApiSimpleImages;
  path?: string;
  added?: string;
}

export interface ApiLegoKit {
  id: string;
  name: string;
  type?: ApiType;
  series?: ApiSeries;
  gameplayTags?: string[];
  images?: ApiSimpleImages;
  path?: string;
  added?: string;
  shopHistory?: string[];
}

// ==================== Beans ====================

export interface ApiBean {
  id: string;
  cosmeticId?: string;
  name?: string;
  gender?: string;
  gameplayTags?: string[];
  images?: ApiSimpleImages;
  path?: string;
  added?: string;
}

// ==================== Shop ====================

export interface ApiBundle {
  name: string;
  info?: string;
  image?: string;
}

export interface ApiBanner {
  value?: string;
  intensity?: string;
  backendValue?: string;
}

export interface ApiOfferTag {
  id?: string;
  text?: string;
}

export interface ApiLayout {
  id?: string;
  name?: string;
  category?: string;
  index?: number;
  [key: string]: any;
}

export interface ApiShopEntry {
  regularPrice?: number;
  finalPrice?: number;
  devName?: string;
  offerId?: string;
  inDate?: string;
  outDate?: string;
  timeoutDate?: string;
  bundle?: ApiBundle;
  banner?: ApiBanner;
  offerTag?: ApiOfferTag;
  giftable?: boolean;
  refundable?: boolean;
  sortPriority?: number;
  layoutId?: string;
  layout?: ApiLayout;
  brItems?: ApiBRItem[];
  tracks?: ApiTrack[];
  instruments?: ApiInstrument[];
  cars?: ApiCar[];
  legoKits?: ApiLegoKit[];
  // Design properties
  colors?: {
    color1?: string;
    color3?: string;
    textBackgroundColor?: string;
  };
  tileSize?: string;
  displayAssetPath?: string;
  newDisplayAssetPath?: string;
  newDisplayAsset?: any;
}

export interface ApiShopData {
  hash?: string;
  date?: string;
  vbuckIcon?: string;
  entries?: ApiShopEntry[];
}

// ==================== Cosmetics Endpoint ====================

export interface ApiCosmeticsData {
  br?: ApiBRItem[];
  tracks?: ApiTrack[];
  instruments?: ApiInstrument[];
  cars?: ApiCar[];
  lego?: ApiLegoItem[];
  legoKits?: ApiLegoKit[];
  beans?: ApiBean[];
}

// ==================== New Cosmetics Endpoint ====================

export interface ApiNewCosmeticsItems {
  br?: ApiBRItem[];
  tracks?: ApiTrack[];
  instruments?: ApiInstrument[];
  cars?: ApiCar[];
  lego?: ApiLegoItem[];
  legoKits?: ApiLegoKit[];
  beans?: ApiBean[];
}

export interface ApiNewCosmeticsData {
  date?: string;
  build?: string;
  previousBuild?: string;
  hashes?: Record<string, string>;
  lastAdditions?: Record<string, string>;
  items?: ApiNewCosmeticsItems;
}

// ==================== Respostas da API ====================

export interface CosmeticsApiResponse {
  status: number;
  data: ApiCosmeticsData;
}

export interface NewCosmeticsApiResponse {
  status: number;
  data: ApiNewCosmeticsData;
}

export interface ShopApiResponse {
  status: number;
  data: ApiShopData;
}
