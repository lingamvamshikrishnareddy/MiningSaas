import { apiClient } from './api';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

export const getStoredUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const hasRole = (userRole: string, requiredRole: string): boolean => {
  const hierarchy: Record<string, number> = {
    ADMIN: 6,
    MANAGER: 5,
    SUPERVISOR: 4,
    MAINTENANCE_TECH: 3,
    OPERATOR: 2,
    VIEWER: 1,
  };
  return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
};
