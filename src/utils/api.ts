export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export const buildApiUrl = (path: string): string => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

export const authTokenStorageKey = 'blog-auth-token-v1';

export const getAuthToken = (): string => localStorage.getItem(authTokenStorageKey) || '';

export const setAuthToken = (token: string): void => {
  localStorage.setItem(authTokenStorageKey, token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem(authTokenStorageKey);
};

export const authHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
