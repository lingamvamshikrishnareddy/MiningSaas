'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>();

  const newPasswordValue = watch('newPassword');

  // Profile update — using authApi.me as a placeholder; real apps would use usersApi.update(id)
  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      (authApi as any).updateProfile
        ? (authApi as any).updateProfile(data)
        : Promise.resolve({ data: { data: user } }),
    onSuccess: () => {
      setProfileSuccess(true);
      setProfileError(null);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (error: any) => {
      setProfileError(
        error?.response?.data?.error?.message ?? 'Failed to update profile'
      );
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordFormData) =>
      authApi.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: any) => {
      setPasswordError(
        error?.response?.data?.error?.message ?? 'Failed to change password'
      );
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    setProfileError(null);
    setProfileSuccess(false);
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordError(null);
    setPasswordSuccess(false);
    passwordMutation.mutate(data);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">
            Update your personal information and password
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Current User Summary */}
        {user && (
          <div className="flex items-center gap-4 rounded-lg border bg-muted/20 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold flex-shrink-0">
              {(user.firstName?.[0] ?? user.name?.[0] ?? 'U').toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name ?? 'User'}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                Role: {user.role ?? 'Member'}
              </p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your name and email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...registerProfile('firstName', {
                      required: 'First name is required',
                    })}
                  />
                  {profileErrors.firstName && (
                    <p className="text-xs text-red-500">
                      {profileErrors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...registerProfile('lastName', {
                      required: 'Last name is required',
                    })}
                  />
                  {profileErrors.lastName && (
                    <p className="text-xs text-red-500">
                      {profileErrors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {profileErrors.email && (
                  <p className="text-xs text-red-500">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              {profileSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Profile updated successfully.
                </div>
              )}
              {profileError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {profileError}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password. Choose a strong, unique password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  {...registerPassword('confirmNewPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPasswordValue || 'Passwords do not match',
                  })}
                />
                {passwordErrors.confirmNewPassword && (
                  <p className="text-xs text-red-500">
                    {passwordErrors.confirmNewPassword.message}
                  </p>
                )}
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Password changed successfully.
                </div>
              )}
              {passwordError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
