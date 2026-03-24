'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Search } from 'lucide-react';
import { sitesApi } from '@/lib/api';
import { formatEnumLabel } from '@/lib/formatters';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';

const SITE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  PLANNING: 'bg-blue-100 text-blue-800',
};

interface SiteFormData {
  name: string;
  siteCode: string;
  location: string;
  status: string;
  description: string;
}

export default function SitesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [siteStatus, setSiteStatus] = useState('ACTIVE');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteFormData>();

  const { data: sites = [], isLoading } = useQuery({
    queryKey: ['sites', 'list'],
    queryFn: () => sitesApi.getAll().then((r) => r.data?.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: SiteFormData) => sitesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setDialogOpen(false);
      reset();
      setSiteStatus('ACTIVE');
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.error?.message ?? 'Failed to create site'
      );
    },
  });

  const filtered = (sites as any[]).filter((site: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      site.name?.toLowerCase().includes(q) ||
      site.siteCode?.toLowerCase().includes(q) ||
      site.location?.toLowerCase().includes(q)
    );
  });

  const onSubmit = (data: SiteFormData) => {
    setFormError(null);
    createMutation.mutate({ ...data, status: siteStatus });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sites</h1>
          <p className="text-sm text-muted-foreground">
            Manage your mining sites and zones
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Site</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Site Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Northern Pit"
                  {...register('name', { required: 'Site name is required' })}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteCode">
                  Site Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="siteCode"
                  placeholder="e.g. NP-001"
                  {...register('siteCode', { required: 'Site code is required' })}
                />
                {errors.siteCode && (
                  <p className="text-xs text-red-500">{errors.siteCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. -25.1234, 131.5678"
                  {...register('location')}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={siteStatus} onValueChange={setSiteStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the site..."
                  {...register('description')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              {formError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    reset();
                    setFormError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Site'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading sites..." />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No sites found"
          description="Create a new site to get started."
          action={{
            label: 'Add Site',
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((site: any) => (
            <Card
              key={site.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/sites/${site.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="rounded-full bg-blue-50 p-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <StatusBadge
                    value={site.status ?? 'ACTIVE'}
                    customColors={SITE_STATUS_COLORS}
                  />
                </div>
                <CardTitle className="mt-2">{site.name}</CardTitle>
                <CardDescription className="font-mono text-xs">
                  {site.siteCode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {site.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {site.location}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {site._count?.zones ?? site.zoneCount ?? 0} zones
                  </span>
                  <span className="text-muted-foreground">
                    {site._count?.equipment ?? site.equipmentCount ?? 0} equipment
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
