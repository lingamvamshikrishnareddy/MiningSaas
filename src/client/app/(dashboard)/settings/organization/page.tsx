'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { organizationsApi } from '@/lib/api';
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

interface OrgFormData {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  website?: string;
}

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: org, isLoading } = useQuery({
    queryKey: ['organizations', 'me'],
    queryFn: () => organizationsApi.getMyOrg().then((r) => r.data?.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<OrgFormData>();

  // Populate form when org data loads
  useEffect(() => {
    if (org) {
      reset({
        name: org.name ?? '',
        contactEmail: org.contactEmail ?? '',
        contactPhone: org.contactPhone ?? '',
        address: org.address ?? '',
        website: org.website ?? '',
      });
    }
  }, [org, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: OrgFormData) => organizationsApi.update(data),
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error: any) => {
      setSaveError(
        error?.response?.data?.error?.message ?? 'Failed to update organization'
      );
    },
  });

  const onSubmit = (data: OrgFormData) => {
    setSaveError(null);
    setSaveSuccess(false);
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading organization..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your organization details and contact information
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Update your organization's name, contact, and address information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Organization Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Apex Mining Co."
                  {...register('name', {
                    required: 'Organization name is required',
                  })}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@company.com"
                  {...register('contactEmail', {
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-500">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  {...register('contactPhone')}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.company.com"
                  {...register('website')}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <textarea
                  id="address"
                  rows={3}
                  placeholder="123 Mine Road, Mining City, State 12345"
                  {...register('address')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  Organization details updated successfully.
                </div>
              )}
              {saveError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => org && reset({
                    name: org.name ?? '',
                    contactEmail: org.contactEmail ?? '',
                    contactPhone: org.contactPhone ?? '',
                    address: org.address ?? '',
                    website: org.website ?? '',
                  })}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
                  {updateMutation.isPending ? (
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

        {/* Read-only stats */}
        {org && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Organization Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Plan</dt>
                  <dd className="font-medium capitalize">{org.plan ?? 'Standard'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{org.status ?? 'Active'}</dd>
                </div>
                {org.createdAt && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Member Since</dt>
                    <dd className="font-medium">
                      {new Date(org.createdAt).getFullYear()}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
