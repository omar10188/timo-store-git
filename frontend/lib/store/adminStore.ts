import { create } from 'zustand';
import { adminAPI, productsAPI, couponsAPI, analyticsAPI } from '../api';

interface StatusHistoryEntry {
  status: string;
  changedAt: string;
  note: string;
}

interface Order {
  _id: string;
  user?: { name: string; email: string; phone?: string };
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: { name: string; price: number; quantity: number; image?: string }[];
  totalPrice: number;
  subtotal: number;
  discount: number;
  coupon?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  isPaid: boolean;
  paidAt?: string;
  cancelledAt?: string;
  shippingAddress?: { street: string; city: string; country: string; postalCode?: string };
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

interface AdminState {
  stats: any;
  orders: Order[];
  selectedOrder: Order | null;
  products: any[];
  coupons: any[];
  users: any[];
  isLoading: boolean;
  isOrderLoading: boolean;
  error: string | null;
  // Filters
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  // Actions
  fetchStats: (range?: string) => Promise<void>;
  fetchOrders: (params?: { search?: string; status?: string; page?: number }) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateOrderStatus: (id: string, status: string, note?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  // Socket actions
  addOrder: (order: any) => void;
  syncOrderStatus: (id: string, status: string) => void;
  // Filter setters
  setSearch: (q: string) => void;
  setStatusFilter: (s: string) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  orders: [],
  selectedOrder: null,
  products: [],
  coupons: [],
  users: [],
  isLoading: false,
  isOrderLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  currentPage: 1,
  totalPages: 1,
  totalOrders: 0,

  fetchStats: async (range: string = '30d') => {
    set({ isLoading: true, error: null });
    try {
      // Also fetch the old admin stats just to keep recentOrders, lowStockProducts, totalUsers etc.
      // But we will override the charts and summary with the new analytics
      const [oldStatsRes, summaryRes, salesRes, topProductsRes] = await Promise.all([
        adminAPI.getStats(),
        analyticsAPI.getSummary(range),
        analyticsAPI.getSales(range),
        analyticsAPI.getTopProducts(range)
      ]);

      const mergedStats = {
        ...oldStatsRes.data,
        ...summaryRes.data,
        salesData: salesRes.data,
        topProducts: topProductsRes.data,
      };

      set({ stats: mergedStats, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { searchQuery, statusFilter, currentPage } = get();
      const queryParams = {
        search: params?.search ?? searchQuery,
        status: params?.status ?? statusFilter,
        page: params?.page ?? currentPage,
        limit: 20,
      };
      const { data } = await adminAPI.getOrders(queryParams);
      set({
        orders: data.orders || data,
        totalPages: data.totalPages || 1,
        totalOrders: data.total || 0,
        currentPage: data.page || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isOrderLoading: true });
    try {
      const { data } = await adminAPI.getOrderById(id);
      set({ selectedOrder: data, isOrderLoading: false });
    } catch (err: any) {
      set({ error: err.message, isOrderLoading: false });
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
      set({ users: data.users || data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateOrderStatus: async (id, status, note) => {
    try {
      await adminAPI.updateOrderStatus(id, status, note);
      set((state) => ({
        orders: state.orders.map((o) =>
          o._id === id ? { ...o, status } : o
        ),
        selectedOrder:
          state.selectedOrder?._id === id
            ? {
                ...state.selectedOrder,
                status,
                statusHistory: [
                  ...state.selectedOrder.statusHistory,
                  { status, changedAt: new Date().toISOString(), note: note || '' },
                ],
              }
            : state.selectedOrder,
      }));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message);
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
  },

  // Socket.io real-time actions
  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
      totalOrders: state.totalOrders + 1,
    }));
  },

  syncOrderStatus: (id, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o._id === id ? { ...o, status } : o)),
      selectedOrder:
        state.selectedOrder?._id === id
          ? { ...state.selectedOrder, status }
          : state.selectedOrder,
    }));
  },

  setSearch: (q) => set({ searchQuery: q, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
}));
