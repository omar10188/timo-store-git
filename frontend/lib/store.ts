/**
 * Global Zustand Store
 * Manages: auth state, cart state, wishlist state
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, setTokens, clearTokens, saveUser } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  isOpen: boolean;
  setCart: (items: CartItem[], totalPrice: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

interface WishlistState {
  productIds: string[];
  setWishlist: (ids: string[]) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);
        saveUser(user);
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => {
        saveUser(user);
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'timo-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  totalPrice: 0,
  isOpen: false,

  setCart: (items, totalPrice) => set({ items, totalPrice }),

  addItem: (newItem) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.product === newItem.product);
    if (idx >= 0) {
      items[idx].quantity += newItem.quantity;
    } else {
      items.push(newItem);
    }
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    set({ items, totalPrice });
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => i.product !== productId);
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    set({ items, totalPrice });
  },

  updateQuantity: (productId, quantity) => {
    const items = get().items.map((i) =>
      i.product === productId ? { ...i, quantity } : i
    );
    const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    set({ items, totalPrice });
  },

  clearCart: () => set({ items: [], totalPrice: 0 }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
}));

// ─── Wishlist Store ───────────────────────────────────────────────────────────
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      setWishlist: (ids) => set({ productIds: ids }),

      toggleItem: (productId) => {
        const ids = get().productIds;
        const exists = ids.includes(productId);
        set({ productIds: exists ? ids.filter((id) => id !== productId) : [...ids, productId] });
      },

      isInWishlist: (productId) => get().productIds.includes(productId),
    }),
    {
      name: 'timo-wishlist',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);

// ─── Computed Helpers ─────────────────────────────────────────────────────────
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
