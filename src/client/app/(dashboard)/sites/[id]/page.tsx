'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Grid3x3,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { sitesApi, equipmentApi } from '@/lib/api';
import { formatDate, formatEnumLabel } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

const SITE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  PLANNING: 'bg-blue-100 text-blue-800',
};

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: site,
    isLoading: siteLoading,
    error: siteError,
  } = useQuery({
    queryKey: ['sites', id],
    queryFn: () => sitesApi.getById(id).then((r) => r.data?.data),
    enabled: !!id,
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ['sites', id, 'zones'],
    queryFn: () => sitesApi.getZones(id).then((r) => r.data?.data ?? []),
    enabled: !!id,
  });

  const { data: siteEquipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment', 'bySite', id],
    queryFn: () =>
      equipmentApi.getAll({ siteId: id }).then((r) => r.data?.data ?? []),
    enabled: !!id,
  });

  if (siteLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading site..." />
      </div>
    );
  }

  if (siteError || !site) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Site not found</p>
        <Button variant="outline" onClick={() => router.push('/sites')}>
          Back to Sites
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/sites')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {site.siteCode}
            </p>
          </div>
        </div>
        <StatusBadge
          value={site.status ?? 'ACTIVE'}
          customColors={SITE_STATUS_COLORS}
        />
      </div>

      {/* Site Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Site Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium">{site.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Site Code</dt>
                  <dd className="mt-1 font-mono">{site.siteCode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge
                      value={site.status ?? 'ACTIVE'}
                      customColors={SITE_STATUS_COLORS}
                    />
                  </dd>
                </div>
                {site.location && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                    <dd className="mt-1">{site.location}</dd>
                  </div>
                )}
                {site.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="mt-1 text-sm whitespace-pre-wrap">{site.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="mt-1">{formatDate(site.createdAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Zones{' '}
                <span className="text-base font-normal text-muted-foreground">
                  ({(zones as any[]).length})
                </span>
              </CardTitle>
              <CardDescription>Areas and zones within this site</CardDescription>
            </CardHeader>
            <CardContent>
              {zonesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading zones..." />
                </div>
              ) : (zones as any[]).length === 0 ? (
                <EmptyState
                  icon={Grid3x3}
                  title="No zones"
                  description="No zones have been defined for this site."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(zones as any[]).map((zone: any) => (
                    <div
                      key={zone.id}
                      className="rounded-lg border p-3"
                    >
                      <p className="font-medium text-sm">{zone.name}</p>
                      {zone.zoneCode && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {zone.zoneCode}
                        </p>
                      )}
                      {zone.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {zone.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Site Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid3x3 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Zones</span>
                </div>
                <span className="font-semibold">
                  {(zones as any[]).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Equipment</span>
                </div>
                <span className="font-semibold">
                  {(siteEquipment as any[]).length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Equipment at Site */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Equipment at Site
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentLoading ? (
                <LoadingSpinner size="sm" />
              ) : (siteEquipment as any[]).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No equipment at this site.
                </p>
              ) : (
                <ul className="space-y-2">
                  {(siteEquipment as any[]).slice(0, 8).map((eq: any) => (
                    <li
                      key={eq.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5"
                      onClick={() => router.push(`/equipment/${eq.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium">{eq.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatEnumLabel(eq.equipmentType ?? eq.type)}
                        </p>
                      </div>
                      <StatusBadge value={eq.status} type="equipment" />
                    </li>
                  ))}
                  {(siteEquipment as any[]).length > 8 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{(siteEquipment as any[]).length - 8} more
                    </p>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
