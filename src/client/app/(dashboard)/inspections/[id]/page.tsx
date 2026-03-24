'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { inspectionsApi } from '@/lib/api';
import { formatDate, formatDateTime, formatEnumLabel } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const INSPECTION_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PASSED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const ChecklistItemIcon = ({ result }: { result: string }) => {
  if (result === 'PASS')
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (result === 'FAIL') return <XCircle className="h-4 w-4 text-red-600" />;
  return <AlertCircle className="h-4 w-4 text-yellow-600" />;
};

export default function InspectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: inspection,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['inspections', id],
    queryFn: () =>
      inspectionsApi.getById(id).then((r) => r.data?.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => inspectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      router.push(ROUTES.INSPECTIONS);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading inspection..." />
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium">Inspection not found</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.INSPECTIONS)}>
          Back to Inspections
        </Button>
      </div>
    );
  }

  const checklistItems: any[] = inspection.checklistItems ?? [];
  const passCount = checklistItems.filter((i) => i.result === 'PASS').length;
  const failCount = checklistItems.filter((i) => i.result === 'FAIL').length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES.INSPECTIONS)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Inspection Detail
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatEnumLabel(inspection.inspectionType)} —{' '}
              {inspection.equipment?.name ?? 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`${ROUTES.INSPECTIONS}/${id}/edit`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Inspection</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this inspection? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Inspection Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Equipment
                  </dt>
                  <dd className="mt-1 font-medium">
                    {inspection.equipment?.name ?? 'N/A'}
                  </dd>
                  {inspection.equipment?.serialNumber && (
                    <dd className="text-xs text-muted-foreground">
                      SN: {inspection.equipment.serialNumber}
                    </dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Type
                  </dt>
                  <dd className="mt-1">
                    {formatEnumLabel(inspection.inspectionType)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <StatusBadge
                      value={inspection.status}
                      customColors={INSPECTION_STATUS_COLORS}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Scheduled Date
                  </dt>
                  <dd className="mt-1">
                    {formatDate(inspection.scheduledDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Inspector
                  </dt>
                  <dd className="mt-1">
                    {inspection.inspector
                      ? `${inspection.inspector.firstName} ${inspection.inspector.lastName}`
                      : 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Completed At
                  </dt>
                  <dd className="mt-1">
                    {inspection.completedAt
                      ? formatDateTime(inspection.completedAt)
                      : '—'}
                  </dd>
                </div>
                {inspection.notes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Notes
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm">
                      {inspection.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Checklist Items */}
          {checklistItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist Items</CardTitle>
                <CardDescription>
                  {passCount} passed · {failCount} failed ·{' '}
                  {checklistItems.length - passCount - failCount} N/A
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {checklistItems.map((item: any, idx: number) => (
                    <li
                      key={item.id ?? idx}
                      className="flex items-start gap-3 py-3"
                    >
                      <ChecklistItemIcon result={item.result} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.description}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          item.result === 'PASS'
                            ? 'bg-green-100 text-green-700'
                            : item.result === 'FAIL'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.result ?? 'N/A'}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {checklistItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Items
                  </span>
                  <span className="font-semibold">{checklistItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Passed</span>
                  <span className="font-semibold text-green-600">
                    {passCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Failed</span>
                  <span className="font-semibold text-red-600">{failCount}</span>
                </div>
                {checklistItems.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Pass rate</span>
                      <span>
                        {Math.round((passCount / checklistItems.length) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${(passCount / checklistItems.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">
                  {inspection.createdAt
                    ? formatDateTime(inspection.createdAt)
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm">
                  {inspection.updatedAt
                    ? formatDateTime(inspection.updatedAt)
                    : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
