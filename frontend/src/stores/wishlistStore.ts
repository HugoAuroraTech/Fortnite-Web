import { create } from 'zustand';
import { LOCAL_STORAGE_KEYS } from '@/constants';

interface WishlistState {
  wishlist: Set<string>;
  addToWishlist: (cosmeticId: string) => void;
  removeFromWishlist: (cosmeticId: string) => void;
  toggleWishlist: (cosmeticId: string) => void;
  isInWishlist: (cosmeticId: string) => boolean;
  clearWishlist: () => void;
}

// Carregar wishlist do localStorage
const loadWishlist = (): Set<string> => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST);
  if (stored) {
    try {
      const array = JSON.parse(stored) as string[];
      return new Set(array);
    } catch (error) {
      console.error('Erro ao carregar wishlist:', error);
      return new Set();
    }
  }
  return new Set();
};

// Salvar wishlist no localStorage
const saveWishlist = (wishlist: Set<string>) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify(Array.from(wishlist)));
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: loadWishlist(),

  addToWishlist: (cosmeticId: string) => {
    set((state) => {
      const newWishlist = new Set(state.wishlist);
      newWishlist.add(cosmeticId);
      saveWishlist(newWishlist);
      return { wishlist: newWishlist };
    });
  },

  removeFromWishlist: (cosmeticId: string) => {
    set((state) => {
      const newWishlist = new Set(state.wishlist);
      newWishlist.delete(cosmeticId);
      saveWishlist(newWishlist);
      return { wishlist: newWishlist };
    });
  },

  toggleWishlist: (cosmeticId: string) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = get();
    if (isInWishlist(cosmeticId)) {
      removeFromWishlist(cosmeticId);
    } else {
      addToWishlist(cosmeticId);
    }
  },

  isInWishlist: (cosmeticId: string) => {
    return get().wishlist.has(cosmeticId);
  },

  clearWishlist: () => {
    set({ wishlist: new Set() });
    localStorage.removeItem(LOCAL_STORAGE_KEYS.WISHLIST);
  },
}));
