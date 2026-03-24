'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { LoginForm } from '@/components/forms/LoginForm';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect to dashboard if already authenticated and done loading
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <LoginForm />

      <div className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Create account
        </Link>
      </div>
    </>
  );
}
