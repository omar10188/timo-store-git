/**
 * Auth helpers
 * Token management, login/logout, and user persistence
 */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
}

// ─── Token Storage ────────────────────────────────────────────────────────────
export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

// ─── User Persistence ─────────────────────────────────────────────────────────
export const saveUser = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const loadUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const isAdmin = (user: User | null): boolean => user?.role === 'admin';
export const isLoggedIn = (): boolean => !!getAccessToken();
