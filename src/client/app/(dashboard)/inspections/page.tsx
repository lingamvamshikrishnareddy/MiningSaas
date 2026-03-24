'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { inspectionsApi, equipmentApi } from '@/lib/api';
import { formatDate, formatEnumLabel } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const INSPECTION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PASSED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function InspectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['inspections', 'stats'],
    queryFn: () => inspectionsApi.getStats().then((r) => r.data?.data ?? {}),
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery({
    queryKey: ['inspections', 'list', statusFilter, typeFilter],
    queryFn: () =>
      inspectionsApi
        .getAll({
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          inspectionType: typeFilter !== 'ALL' ? typeFilter : undefined,
        })
        .then((r) => r.data?.data ?? []),
  });

  const filtered = (inspections as any[]).filter((i: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.equipment?.name?.toLowerCase().includes(q) ||
      i.equipment?.serialNumber?.toLowerCase().includes(q) ||
      i.inspectionType?.toLowerCase().includes(q) ||
      i.inspector?.firstName?.toLowerCase().includes(q) ||
      i.inspector?.lastName?.toLowerCase().includes(q)
    );
  });

  const statCards = [
    {
      title: 'Total Inspections',
      value: (stats as any)?.total ?? 0,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Passed',
      value: (stats as any)?.passed ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Failed',
      value: (stats as any)?.failed ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Pending / Scheduled',
      value: (stats as any)?.pending ?? (stats as any)?.scheduled ?? 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inspections</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track equipment inspections
          </p>
        </div>
        <Button onClick={() => router.push(`${ROUTES.INSPECTIONS}/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Inspection
        </Button>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" text="Loading stats..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{card.value}</p>
                  </div>
                  <div className={`rounded-full p-3 ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by equipment, inspector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                  <SelectItem value="SPECIAL">Special</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
            Inspections{' '}
            <span className="text-base font-normal text-muted-foreground">
              ({filtered.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {inspectionsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="md" text="Loading inspections..." />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No inspections found"
              description="Create a new inspection to get started."
              action={{
                label: 'New Inspection',
                onClick: () => router.push(`${ROUTES.INSPECTIONS}/new`),
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Inspector</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inspection: any) => (
                    <TableRow
                      key={inspection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`${ROUTES.INSPECTIONS}/${inspection.id}`)
                      }
                    >
                      <TableCell>
                        <div className="font-medium">
                          {inspection.equipment?.name ?? 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {inspection.equipment?.serialNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatEnumLabel(inspection.inspectionType)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          value={inspection.status}
                          customColors={INSPECTION_STATUS_COLORS}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(inspection.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        {inspection.inspector
                          ? `${inspection.inspector.firstName} ${inspection.inspector.lastName}`
                          : 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        {inspection.completedAt
                          ? formatDate(inspection.completedAt)
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
                            router.push(
                              `${ROUTES.INSPECTIONS}/${inspection.id}`
                            )
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
