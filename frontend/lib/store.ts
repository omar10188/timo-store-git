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
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

import { cartAPI } from './api';

interface CartState {
  items: CartItem[];
  totalPrice: number;
  isOpen: boolean;
  setCart: (items: CartItem[], totalPrice: number) => void;
  addItem: (item: CartItem) => void;
  addToCartAsync: (productId: string, quantity?: number, itemData?: Partial<CartItem>) => Promise<void>;
  fetchCart: () => Promise<void>;
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
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      isOpen: false,

      setCart: (items, totalPrice) => set({ items, totalPrice }),

      addItem: (newItem) => {
        console.log('🛒 Adding item to Zustand cart:', newItem);
        const items = [...get().items];
        const idx = items.findIndex((i) => i.product === newItem.product);
        if (idx >= 0) {
          items[idx] = { ...items[idx], quantity: items[idx].quantity + newItem.quantity };
        } else {
          items.push(newItem);
        }
        const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
        set({ items, totalPrice });
      },

      addToCartAsync: async (productId, quantity = 1, itemData) => {
        console.log('🛒 ADD TO CART CLICKED:', productId, 'qty:', quantity);
        if (!productId) {
          console.error('❌ Cannot add to cart: productId is undefined');
          return;
        }

        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        // Guest users: use localStorage cart only (no backend call needed)
        if (!isAuthenticated) {
          get().addItem({
            product: productId,
            name: itemData?.name || 'Product',
            price: itemData?.price || 0,
            image: itemData?.image || '',
            quantity,
          });
          set({ isOpen: true });
          console.log('ℹ️ Guest mode: item added to local cart only');
          return;
        }

        try {
          const res = await cartAPI.add(productId, quantity);
          const rawCart = res.data?.data || res.data;
          
          if (rawCart && Array.isArray(rawCart.items)) {
            const mappedItems: CartItem[] = rawCart.items.map((i: any) => ({
              product: typeof i.product === 'object' ? i.product._id : i.product,
              name: i.name || i.product?.name || itemData?.name || 'Product',
              price: i.price || i.product?.price || itemData?.price || 0,
              image: i.image || i.product?.image || itemData?.image || '',
              quantity: i.quantity,
            }));
            const totalPrice = rawCart.totalPrice || mappedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            set({ items: mappedItems, totalPrice, isOpen: true });
            console.log('✅ Cart State Updated from Backend Response:', mappedItems);
          } else {
            // Fallback local update if backend returned empty array structure
            get().addItem({
              product: productId,
              name: itemData?.name || 'Product',
              price: itemData?.price || 0,
              image: itemData?.image || '',
              quantity,
            });
            set({ isOpen: true });
          }
        } catch (err: any) {
          console.error('❌ Failed to sync cart with backend:', err?.message || err);
          // Fallback optimistic local update
          get().addItem({
            product: productId,
            name: itemData?.name || 'Product',
            price: itemData?.price || 0,
            image: itemData?.image || '',
            quantity,
          });
          set({ isOpen: true });
        }
      },

      fetchCart: async () => {
        try {
          const res = await cartAPI.get();
          const rawCart = res.data?.data || res.data;
          if (rawCart && Array.isArray(rawCart.items)) {
            const mappedItems: CartItem[] = rawCart.items.map((i: any) => ({
              product: typeof i.product === 'object' ? i.product._id : i.product,
              name: i.name || i.product?.name || 'Product',
              price: i.price || i.product?.price || 0,
              image: i.image || i.product?.image || '',
              quantity: i.quantity,
            }));
            const totalPrice = rawCart.totalPrice || mappedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            set({ items: mappedItems, totalPrice });
          }
        } catch (err) {
          console.warn('Could not fetch cart from server:', err);
        }
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
    }),
    {
      name: 'timo-cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({ items: state.items, totalPrice: state.totalPrice }),
    }
  )
);

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
