'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { incidentsApi } from '@/lib/api';
import { formatDate, formatDateTime, formatEnumLabel } from '@/lib/formatters';
import { INCIDENT_SEVERITY_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-green-100 text-green-800',
};

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [closeError, setCloseError] = useState<string | null>(null);

  const {
    data: incident,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsApi.getById(id).then((r) => r.data?.data),
    enabled: !!id,
  });

  const closeMutation = useMutation({
    mutationFn: () =>
      incidentsApi.close(id, { resolutionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setCloseDialogOpen(false);
      setResolutionNotes('');
      setCloseError(null);
    },
    onError: (error: any) => {
      setCloseError(
        error?.response?.data?.error?.message ?? 'Failed to close incident'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading incident..." />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Incident not found</p>
        <Button variant="outline" onClick={() => router.push('/safety/incidents')}>
          Back to Incidents
        </Button>
      </div>
    );
  }

  const isClosed = incident.status === 'CLOSED';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/safety/incidents')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {incident.incidentNumber ??
                `INC-${incident.id?.slice(-6).toUpperCase()}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatEnumLabel(incident.incidentType)} ·{' '}
              {formatDate(incident.incidentDate ?? incident.createdAt)}
            </p>
          </div>
        </div>
        {!isClosed && (
          <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Close Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Close Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please provide resolution notes before closing this incident.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resolutionNotes">Resolution Notes</Label>
                  <textarea
                    id="resolutionNotes"
                    rows={4}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how this incident was resolved..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                {closeError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {closeError}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCloseDialogOpen(false);
                      setResolutionNotes('');
                      setCloseError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => closeMutation.mutate()}
                    disabled={closeMutation.isPending || !resolutionNotes.trim()}
                  >
                    {closeMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Closing...
                      </>
                    ) : (
                      'Close Incident'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Incident Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                  <dd className="mt-1">{formatEnumLabel(incident.incidentType)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Severity</dt>
                  <dd className="mt-1">
                    <StatusBadge value={incident.severity} type="severity" />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge value={incident.status} customColors={STATUS_COLORS} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Incident Date</dt>
                  <dd className="mt-1">
                    {formatDate(incident.incidentDate ?? incident.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Site</dt>
                  <dd className="mt-1">{incident.site?.name ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="mt-1">{incident.location ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Reported By</dt>
                  <dd className="mt-1">
                    {incident.reportedBy
                      ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Reported At</dt>
                  <dd className="mt-1">
                    {incident.createdAt ? formatDateTime(incident.createdAt) : '—'}
                  </dd>
                </div>
                {incident.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm">
                      {incident.description}
                    </dd>
                  </div>
                )}
                {incident.immediateActions && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">Immediate Actions</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm">
                      {incident.immediateActions}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Resolution */}
          {isClosed && incident.resolutionNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Resolution
                </CardTitle>
                <CardDescription>
                  Closed on{' '}
                  {incident.closedAt ? formatDateTime(incident.closedAt) : '—'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {incident.resolutionNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  <StatusBadge value={incident.status} customColors={STATUS_COLORS} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Severity</span>
                  <StatusBadge value={incident.severity} type="severity" />
                </div>
                {incident.closedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Closed At</span>
                    <span className="text-sm font-medium">
                      {formatDate(incident.closedAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-red-100 p-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Incident Reported</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(incident.createdAt)}
                    </p>
                  </div>
                </div>
                {isClosed && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-green-100 p-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Incident Closed</p>
                      <p className="text-xs text-muted-foreground">
                        {incident.closedAt ? formatDateTime(incident.closedAt) : '—'}
                      </p>
                    </div>
                  </div>
                )}
                {!isClosed && (
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-yellow-100 p-1">
                      <Clock className="h-3 w-3 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Awaiting Resolution</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
