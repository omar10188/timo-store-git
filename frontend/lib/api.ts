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
  withCredentials: true, // ← Always send cookies (refreshToken is HTTP-only cookie)
});

// Helper to check if token expires within buffer seconds (default: 60s)
const isTokenExpiringSoon = (token: string, bufferSeconds = 60): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const decoded = JSON.parse(atob(payloadBase64));
    if (!decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < bufferSeconds;
  } catch {
    return true;
  }
};

let refreshPromise: Promise<string> | null = null;

// ─── Request Interceptor: Attach JWT & Pre-Refresh Check ─────────────────────
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('accessToken');

      // Check if token is present and request is NOT a refresh call
      if (token && !config.url?.includes('/auth/refresh')) {
        // PROACTIVE PRE-REFRESH: If token expires within 60s, refresh silently BEFORE API call
        if (isTokenExpiringSoon(token, 60)) {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true })
              .then(({ data }) => {
                const newToken = data.data?.accessToken || data.accessToken;
                localStorage.setItem('accessToken', newToken);
                return newToken;
              })
              .catch((err) => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                throw err;
              })
              .finally(() => {
                refreshPromise = null;
              });
          }
          try {
            token = await refreshPromise;
          } catch {
            // Silently fall through to request with current token; 401 interceptor will catch if needed
          }
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 (token refresh fallback) & Logging ───────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error(
        `❌ API Request Failed [${error.config?.method?.toUpperCase()}] ${error.config?.baseURL}${error.config?.url} -> Status ${error.response.status}`,
        error.response.data
      );
    }

    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data?.accessToken || data.accessToken;
        localStorage.setItem('accessToken', newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('timo-auth');
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
  getCsrfToken: () => api.get('/auth/csrf-token'),
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
  getTrending: () => api.get('/products/trending'),
  getRecommendations: (id: string) => api.get(`/products/${id}/recommendations`),
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
    customer?: { name: string; phone: string; address?: string };
    name?: string;
    phone?: string;
    address?: string;
    items?: Array<{ product: string; name: string; price: number; image?: string; quantity: number }>;
    shippingAddress?: { street: string; city: string; country: string; postalCode?: string };
    paymentMethod?: string;
    couponCode?: string;
  }) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
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
  // Orders
  getOrders: (params?: Record<string, string | number>) =>
    api.get('/admin/orders', { params }),
  getOrderById: (id: string) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    api.patch(`/admin/orders/${id}`, { status, note }),
};

// ─── Upload & Images API ──────────────────────────────────────────────────────
export const uploadAPI = {
  uploadProductImage: (data: FormData) => 
    api.post('/upload/product', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const imagesAPI = {
  getProductImages: () => api.get('/images/products'),
  deleteProductImage: (filename: string) => api.delete(`/images/${filename}`),
};

export default api;
