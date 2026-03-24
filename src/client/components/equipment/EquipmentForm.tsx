'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateEquipment, useUpdateEquipment } from '../../hooks/useEquipment';
import { useSites } from '../../hooks/useSites';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
import { Equipment, EquipmentType, EquipmentStatus, FuelType } from '../../types/equipment.types';

const equipmentSchema = z.object({
  assetNumber: z.string().min(1, 'Asset number is required'),
  name: z.string().min(1, 'Name is required'),
  equipmentType: z.string().min(1, 'Equipment type is required'),
  siteId: z.string().min(1, 'Site is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  yearManufactured: z.coerce.number().min(1900).max(new Date().getFullYear()),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  purchaseCost: z.coerce.number().min(0),
  status: z.string().min(1, 'Status is required'),
  fuelType: z.string().optional(),
  fuelCapacity: z.coerce.number().optional(),
  capacity: z.coerce.number().optional(),
  capacityUnit: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  initialData?: Equipment;
  onSuccess?: () => void;
}

export function EquipmentForm({ initialData, onSuccess }: EquipmentFormProps) {
  const isEditing = !!initialData;
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment(initialData?.id || '');
  const { data: sites, isLoading: isLoadingSites } = useSites();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData ? {
      ...initialData,
      purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
    } as any : {
      status: 'OPERATIONAL',
      equipmentType: 'HAUL_TRUCK',
    },
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      if (isEditing) {
        await updateEquipment.mutateAsync(data);
      } else {
        await createEquipment.mutateAsync(data);
      }
      onSuccess?.();
    } catch (error) {
        console.error('Failed to save equipment:', error);
    }
  };

  const isLoading = createEquipment.isPending || updateEquipment.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assetNumber">Asset Number</Label>
          <Input id="assetNumber" {...register('assetNumber')} disabled={isLoading} />
          {errors.assetNumber && <p className="text-sm text-red-500">{errors.assetNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Equipment Name</Label>
          <Input id="name" {...register('name')} disabled={isLoading} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Equipment Type</Label>
          <Select 
            disabled={isLoading} 
            defaultValue={watch('equipmentType')}
            onValueChange={(value) => setValue('equipmentType', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HAUL_TRUCK">Haul Truck</SelectItem>
              <SelectItem value="EXCAVATOR">Excavator</SelectItem>
              <SelectItem value="LOADER">Loader</SelectItem>
              <SelectItem value="DOZER">Dozer</SelectItem>
              <SelectItem value="GRADER">Grader</SelectItem>
              <SelectItem value="DRILL">Drill</SelectItem>
              <SelectItem value="CRUSHER">Crusher</SelectItem>
              <SelectItem value="CONVEYOR">Conveyor</SelectItem>
              <SelectItem value="GENERATOR">Generator</SelectItem>
              <SelectItem value="PUMP">Pump</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.equipmentType && <p className="text-sm text-red-500">{errors.equipmentType.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Site</Label>
          <Select 
            disabled={isLoading || isLoadingSites} 
            defaultValue={watch('siteId')}
            onValueChange={(value) => setValue('siteId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites?.map((site: any) => (
                <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.siteId && <p className="text-sm text-red-500">{errors.siteId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" {...register('manufacturer')} disabled={isLoading} />
          {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input id="model" {...register('model')} disabled={isLoading} />
          {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input id="serialNumber" {...register('serialNumber')} disabled={isLoading} />
          {errors.serialNumber && <p className="text-sm text-red-500">{errors.serialNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearManufactured">Year Manufactured</Label>
          <Input id="yearManufactured" type="number" {...register('yearManufactured')} disabled={isLoading} />
          {errors.yearManufactured && <p className="text-sm text-red-500">{errors.yearManufactured.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input id="purchaseDate" type="date" {...register('purchaseDate')} disabled={isLoading} />
          {errors.purchaseDate && <p className="text-sm text-red-500">{errors.purchaseDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseCost">Purchase Cost</Label>
          <Input id="purchaseCost" type="number" {...register('purchaseCost')} disabled={isLoading} />
          {errors.purchaseCost && <p className="text-sm text-red-500">{errors.purchaseCost.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            disabled={isLoading} 
            defaultValue={watch('status')}
            onValueChange={(value) => setValue('status', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPERATIONAL">Operational</SelectItem>
              <SelectItem value="IN_USE">In Use</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="REPAIR">Repair</SelectItem>
              <SelectItem value="IDLE">Idle</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Equipment' : 'Add Equipment'}
        </Button>
      </div>
    </form>
  );
}
