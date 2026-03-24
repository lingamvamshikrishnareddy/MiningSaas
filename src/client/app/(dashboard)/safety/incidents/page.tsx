'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { incidentsApi, sitesApi } from '@/lib/api';
import { formatDate, formatEnumLabel } from '@/lib/formatters';
import { INCIDENT_SEVERITY_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface IncidentFormData {
  incidentType: string;
  severity: string;
  siteId: string;
  description: string;
  location: string;
}

const INCIDENT_TYPES = [
  'INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE',
  'ENVIRONMENTAL', 'FIRE', 'SPILL', 'EQUIPMENT_FAILURE', 'OTHER',
];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'FATAL'];
const STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'CLOSED'];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-green-100 text-green-800',
};

export default function IncidentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IncidentFormData>();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', 'list', severityFilter, typeFilter, statusFilter],
    queryFn: () =>
      incidentsApi
        .getAll({
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          incidentType: typeFilter !== 'ALL' ? typeFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        })
        .then((r) => r.data?.data ?? []),
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites', 'all'],
    queryFn: () => sitesApi.getAll().then((r) => r.data?.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: IncidentFormData) => incidentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      setDialogOpen(false);
      reset();
      setFormError(null);
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.error?.message ?? 'Failed to create incident'
      );
    },
  });

  const filtered = (incidents as any[]).filter((i: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.incidentNumber?.toLowerCase().includes(q) ||
      i.incidentType?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) ||
      i.site?.name?.toLowerCase().includes(q) ||
      i.reportedBy?.firstName?.toLowerCase().includes(q)
    );
  });

  const onSubmit = (data: IncidentFormData) => {
    setFormError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage safety incidents
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Report New Incident</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Incident Type */}
              <div className="space-y-2">
                <Label>Incident Type <span className="text-red-500">*</span></Label>
                <Controller
                  name="incidentType"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INCIDENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatEnumLabel(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.incidentType && (
                  <p className="text-xs text-red-500">{errors.incidentType.message}</p>
                )}
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label>Severity <span className="text-red-500">*</span></Label>
                <Controller
                  name="severity"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {formatEnumLabel(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.severity && (
                  <p className="text-xs text-red-500">{errors.severity.message}</p>
                )}
              </div>

              {/* Site */}
              <div className="space-y-2">
                <Label>Site</Label>
                <Controller
                  name="siteId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {(sites as any[]).map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location / Area</Label>
                <Input
                  id="location"
                  placeholder="e.g. Pit 3, Level 2"
                  {...register('location')}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe what happened..."
                  {...register('description', { required: 'Description is required' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description.message}</p>
                )}
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
                  {createMutation.isPending ? 'Reporting...' : 'Report Incident'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Severities</SelectItem>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatEnumLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {INCIDENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatEnumLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatEnumLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Incidents{' '}
            <span className="text-base font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading incidents..." />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="No incidents found"
              description="No incidents match your current filters."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Site / Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((incident: any) => (
                    <TableRow
                      key={incident.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/safety/incidents/${incident.id}`)
                      }
                    >
                      <TableCell className="font-mono text-sm">
                        {incident.incidentNumber ?? `INC-${incident.id?.slice(-4)}`}
                      </TableCell>
                      <TableCell>
                        {formatEnumLabel(incident.incidentType)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={incident.severity} type="severity" />
                      </TableCell>
                      <TableCell>
                        <div>{incident.site?.name ?? '—'}</div>
                        {incident.location && (
                          <div className="text-xs text-muted-foreground">
                            {incident.location}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={incident.status}
                          customColors={STATUS_COLORS}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(incident.incidentDate ?? incident.createdAt)}
                      </TableCell>
                      <TableCell>
                        {incident.reportedBy
                          ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}`
                          : '—'}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(`/safety/incidents/${incident.id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
