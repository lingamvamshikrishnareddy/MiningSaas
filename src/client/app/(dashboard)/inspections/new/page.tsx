'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { inspectionsApi, equipmentApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface InspectionFormData {
  equipmentId: string;
  inspectionType: string;
  scheduledDate: string;
  notes: string;
}

const INSPECTION_TYPES = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'ANNUAL', label: 'Annual' },
  { value: 'SPECIAL', label: 'Special' },
];

export default function NewInspectionPage() {
  const router = useRouter();
  const [equipmentId, setEquipmentId] = useState('');
  const [inspectionType, setInspectionType] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InspectionFormData>();

  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment', 'all'],
    queryFn: () => equipmentApi.getAll().then((r) => r.data?.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => inspectionsApi.create(data),
    onSuccess: () => {
      router.push(ROUTES.INSPECTIONS);
    },
    onError: (error: any) => {
      setFormError(
        error?.response?.data?.error?.message ?? 'Failed to create inspection'
      );
    },
  });

  const onSubmit = (data: InspectionFormData) => {
    setFormError(null);
    if (!equipmentId) {
      setFormError('Please select equipment');
      return;
    }
    if (!inspectionType) {
      setFormError('Please select inspection type');
      return;
    }
    createMutation.mutate({ ...data, equipmentId, inspectionType });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold tracking-tight">New Inspection</h1>
          <p className="text-sm text-muted-foreground">
            Schedule a new equipment inspection
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Inspection Details</CardTitle>
                <CardDescription>
                  Fill in the details to schedule a new inspection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Equipment */}
              <div className="space-y-2">
                <Label htmlFor="equipmentId">
                  Equipment <span className="text-red-500">*</span>
                </Label>
                {equipmentLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">
                      Loading equipment...
                    </span>
                  </div>
                ) : (
                  <Select value={equipmentId} onValueChange={setEquipmentId}>
                    <SelectTrigger id="equipmentId">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {(equipment as any[]).map((eq: any) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name}{' '}
                          {eq.serialNumber ? `(${eq.serialNumber})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Inspection Type */}
              <div className="space-y-2">
                <Label htmlFor="inspectionType">
                  Inspection Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={inspectionType}
                  onValueChange={setInspectionType}
                >
                  <SelectTrigger id="inspectionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSPECTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Scheduled Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  {...register('scheduledDate', {
                    required: 'Scheduled date is required',
                  })}
                />
                {errors.scheduledDate && (
                  <p className="text-xs text-red-500">
                    {errors.scheduledDate.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Inspector Notes</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={4}
                  placeholder="Add any notes or special instructions for the inspector..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {/* Error */}
              {formError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(ROUTES.INSPECTIONS)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Inspection'
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
