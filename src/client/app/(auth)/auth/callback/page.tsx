'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const tokensParam = urlParams.get('tokens');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(errorParam);
        return;
      }

      if (!tokensParam) {
        setError('Missing OAuth parameters');
        return;
      }

      try {
        const tokens = JSON.parse(decodeURIComponent(tokensParam));
        
        // If we have the id_token, send it to the server to verify and get user data
        if (tokens.id_token) {
          const response = await authApi.googleLogin(tokens.id_token);
          
          if (response.data.success) {
            const { user, tokens: authTokens } = response.data.data!;

            // Update auth store (also persists tokens via setTokens internally)
            setAuth(user, authTokens);

            // Redirect to dashboard
            router.push('/dashboard');
          } else {
            setError(response.data.error?.message || 'Authentication failed');
          }
        } else {
          setError('No ID token received');
        }
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setError(err.response?.data?.error?.message || 'Failed to process authentication');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
