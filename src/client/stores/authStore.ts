import { create } from 'zustand';
import { persist, StateStorage } from 'zustand/middleware';
import { User, AuthTokens } from '../types/user.types';
import { setTokens, clearTokens } from '../lib/auth';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, tokens) => {
        setTokens(tokens.accessToken, tokens.refreshToken);
        set({ user, tokens, isAuthenticated: true, isLoading: false });
      },
      clearAuth: () => {
        clearTokens();
        set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, tokens: state.tokens, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        // Use the action so Zustand triggers a re-render for all subscribers
        if (state) {
          state.setLoading(false);
        }
      },
    }
  )
);
