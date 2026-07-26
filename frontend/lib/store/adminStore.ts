import { create } from 'zustand';
import { adminAPI, productsAPI, couponsAPI } from '../api';

interface AdminState {
  stats: any;
  orders: any[];
  products: any[];
  coupons: any[];
  users: any[];
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  orders: [],
  products: [],
  coupons: [],
  users: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await adminAPI.getStats();
      set({ stats: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await adminAPI.getOrders();
      set({ orders: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await productsAPI.getAll();
      set({ products: data.products || data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await couponsAPI.getAll();
      set({ coupons: data.coupons || data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await adminAPI.getUsers();
      set({ users: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) =>
          o._id === id ? { ...o, status } : o
        ),
      }));
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  deleteProduct: async (id) => {
    try {
      await productsAPI.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p._id !== id),
      }));
    } catch (err: any) {
      throw new Error(err.message);
    }
  },

  deleteCoupon: async (id) => {
    try {
      await couponsAPI.delete(id);
      set((state) => ({
        coupons: state.coupons.filter((c) => c._id !== id),
      }));
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}));
