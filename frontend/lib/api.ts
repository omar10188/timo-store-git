/**
 * API Client
 * Centralized Axios instance with auth token injection and error handling
 */
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 (token refresh) ────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// ─── Products API ─────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params?: Record<string, string | number>) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: FormData) =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// ─── Categories API ───────────────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: FormData) =>
    api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Cart API ─────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity: number = 1) =>
    api.post('/cart', { productId, quantity }),
  update: (productId: string, quantity: number) =>
    api.put(`/cart/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// ─── Orders API ───────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data: {
    shippingAddress: { street: string; city: string; country: string; postalCode: string };
    paymentMethod: string;
    couponCode?: string;
  }) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId: string) => api.get(`/reviews/${productId}`),
  create: (data: { productId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ─── Wishlist API ─────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  toggle: (productId: string) => api.post(`/wishlist/${productId}`),
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
};

// ─── Coupons API ──────────────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (code: string, orderTotal: number) =>
    api.post('/coupons/validate', { code, orderTotal }),
  getAll: () => api.get('/coupons'),
  create: (data: object) => api.post('/coupons', data),
  update: (id: string, data: object) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, string | number>) =>
    api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getOrders: (params?: Record<string, string | number>) =>
    api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
};

export default api;
