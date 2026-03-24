import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../lib/api';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => authApi.register(data),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      router.push('/dashboard');
    },
  });

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  const { data: currentUser } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const googleLoginMutation = useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: (response) => {
      const { user, tokens } = response.data.data!;
      setAuth(user, tokens);
      router.push('/dashboard');
    },
  });

  return {
    user: currentUser || user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending || googleLoginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error || googleLoginMutation.error,
    registerError: registerMutation.error,
  };
};
