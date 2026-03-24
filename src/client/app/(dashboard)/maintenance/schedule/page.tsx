'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Calendar,
  Save
} from 'lucide-react';
import { maintenanceApi, equipmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MaintenanceType, Priority } from '@/types/maintenance.types';

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREDICTIVE', label: 'Predictive' },
  { value: 'BREAKDOWN', label: 'Breakdown' },
  { value: 'INSPECTION', label: 'Inspection' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function MaintenanceSchedulePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    equipmentId: '',
    maintenanceType: '' as MaintenanceType | '',
    priority: 'MEDIUM' as Priority,
    scheduledDate: '',
    description: '',
    notes: '',
  });

  const { data: equipment } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: () => equipmentApi.getAll({ isActive: true }).then((res) => res.data.data),
  });

  const equipmentList = equipment?.data || equipment || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => maintenanceApi.create(data),
    onSuccess: () => {
      router.push('/maintenance');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate({
      equipmentId: formData.equipmentId,
      maintenanceType: formData.maintenanceType,
      priority: formData.priority,
      scheduledDate: formData.scheduledDate,
      description: formData.description,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/maintenance">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Maintenance</h1>
          <p className="text-sm text-gray-500">
            Create a new maintenance work order
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Select
                  value={formData.equipmentId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, equipmentId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentList.map((eq: any) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name} ({eq.assetNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maintenanceType">Maintenance Type</Label>
                  <Select
                    value={formData.maintenanceType}
                    onValueChange={(value) => setFormData((prev) => ({ 
                      ...prev, 
                      maintenanceType: value as MaintenanceType 
                    }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData((prev) => ({ 
                      ...prev, 
                      priority: value as Priority 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    scheduledDate: e.target.value 
                  }))}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the maintenance work required..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href="/maintenance">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Maintenance
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
