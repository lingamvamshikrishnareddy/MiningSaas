'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { apiClient } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login({ email: data.email, password: data.password });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      // Get the Google OAuth authorization URL from the server
      const response = await apiClient.get('/auth/google/url');
      const { url } = response.data.data;

      // Redirect to Google OAuth
      window.location.href = url;
    } catch (error: any) {
      console.error('Error getting Google OAuth URL:', error);
      setGoogleError('Failed to initiate Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5">
          {/* Email Field */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-slate-700 font-medium">
              Email
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                {...register('email')}
                disabled={isLoggingIn}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password
              </Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="password"
                type="password"
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                {...register('password')}
                disabled={isLoggingIn}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Error Alert */}
          {(loginError || googleError) && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {(loginError as any)?.response?.data?.message || 
                 googleError || 
                 'Invalid email or password'}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoggingIn || googleLoading}
            className="w-full h-11 text-base font-semibold"
          >
            {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-slate-400 font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google Sign-In Button */}
      <Button 
        variant="outline" 
        type="button" 
        disabled={isLoggingIn || googleLoading} 
        onClick={handleGoogleLogin}
        className="h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      >
        {googleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 153 52.6 153 170.8c0 102.2 81.3 124.7 124.7 124.7 66.8 0 102.2-37.5 106.3-70.8h-106.3v-87.5h210.4c2.1 11.3 3.3 22.9 3.3 36.3z"></path>
          </svg>
        )}
        Continue with Google
      </Button>
    </div>
  );
}
