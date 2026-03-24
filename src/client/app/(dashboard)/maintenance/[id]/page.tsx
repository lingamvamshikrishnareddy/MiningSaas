'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { maintenanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaintenanceResponse } from '@/types/maintenance.types';
import { MAINTENANCE_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants';

interface MaintenanceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MaintenanceDetailPage({ params }: MaintenanceDetailPageProps) {
  const { id } = use(params);
  
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    laborHours: '',
    laborCost: '',
    partsCost: '',
    notes: '',
  });

  const { data: maintenance, isLoading, error } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => maintenanceApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: (data: any) => maintenanceApi.complete(id, data),
    onSuccess: () => {
      setCompleteDialogOpen(false);
      window.location.reload();
    },
  });

  const getStatusColor = (status: string) => {
    return MAINTENANCE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800';
  };

  const handleComplete = () => {
    completeMutation.mutate({
      laborHours: completionData.laborHours ? parseFloat(completionData.laborHours) : undefined,
      laborCost: completionData.laborCost ? parseFloat(completionData.laborCost) : undefined,
      partsCost: completionData.partsCost ? parseFloat(completionData.partsCost) : undefined,
      notes: completionData.notes || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !maintenance) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <p className="text-gray-500">Maintenance record not found</p>
          <Link href="/maintenance">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Maintenance
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const record = maintenance.data || maintenance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/maintenance">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {record.equipment?.name || 'Maintenance Record'}
              </h1>
              <p className="text-sm text-gray-500">
                {record.maintenanceType} - Asset #{record.equipment?.assetNumber}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {record.status === 'SCHEDULED' && (
            <Button>
              Start Maintenance
            </Button>
          )}
          {record.status === 'IN_PROGRESS' && (
            <Button onClick={() => setCompleteDialogOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* Status & Priority */}
      <div className="flex items-center gap-4">
        <Badge className={getStatusColor(record.status)}>
          {record.status.replace('_', ' ')}
        </Badge>
        <Badge className={getPriorityColor(record.priority)}>
          {record.priority} Priority
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{record.description}</p>
              </div>
              {record.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium">{record.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Maintenance Type</p>
                  <p className="font-medium">{record.maintenanceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Equipment</p>
                  <p className="font-medium">{record.equipment?.name || 'Unknown'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Scheduled Date</p>
                  <p className="font-medium">{new Date(record.scheduledDate).toLocaleDateString()}</p>
                </div>
                {record.startedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Started At</p>
                    <p className="font-medium">{new Date(record.startedAt).toLocaleString()}</p>
                  </div>
                )}
                {record.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Completed At</p>
                    <p className="font-medium">{new Date(record.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Assignee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.performedBy ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {record.performedBy.firstName} {record.performedBy.lastName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Not assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Labor Cost</span>
                <span className="font-medium">${record.laborCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Parts Cost</span>
                <span className="font-medium">${record.partsCost?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-medium">Total Cost</span>
                <span className="font-bold text-lg">
                  ${record.totalCost?.toLocaleString() || '0'}
                </span>
              </div>
              {record.laborHours && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Labor Hours</span>
                  <span className="font-medium">{record.laborHours} hrs</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Info */}
          {record.equipment && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{record.equipment.equipmentType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Asset Number</p>
                  <p className="font-medium">{record.equipment.assetNumber}</p>
                </div>
                {record.meterReading && (
                  <div>
                    <p className="text-sm text-gray-500">Meter Reading</p>
                    <p className="font-medium">{record.meterReading} hrs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Complete Dialog */}
      {completeDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Complete Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Labor Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={completionData.laborHours}
                  onChange={(e) => setCompletionData((prev) => ({ ...prev, laborHours: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Labor Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={completionData.laborCost}
                  onChange={(e) => setCompletionData((prev) => ({ ...prev, laborCost: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Parts Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={completionData.partsCost}
                  onChange={(e) => setCompletionData((prev) => ({ ...prev, partsCost: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={completionData.notes}
                  onChange={(e) => setCompletionData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Completion notes..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setCompleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleComplete} disabled={completeMutation.isPending}>
                  {completeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Complete'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
