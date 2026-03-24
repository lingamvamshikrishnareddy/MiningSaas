'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Save
} from 'lucide-react';
import { equipmentApi } from '@/lib/api';
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
import { Equipment, EquipmentStatus, EquipmentType, FuelType } from '@/types/equipment.types';

interface EquipmentEditPageProps {
  params: Promise<{ id: string }>;
}

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'HAUL_TRUCK', label: 'Haul Truck' },
  { value: 'EXCAVATOR', label: 'Excavator' },
  { value: 'LOADER', label: 'Loader' },
  { value: 'DOZER', label: 'Dozer' },
  { value: 'GRADER', label: 'Grader' },
  { value: 'DRILL', label: 'Drill' },
  { value: 'CRUSHER', label: 'Crusher' },
  { value: 'CONVEYOR', label: 'Conveyor' },
  { value: 'GENERATOR', label: 'Generator' },
  { value: 'PUMP', label: 'Pump' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'IN_USE', label: 'In Use' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'REPAIR', label: 'Repair' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
];

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'NATURAL_GAS', label: 'Natural Gas' },
];

export default function EquipmentEditPage({ params }: EquipmentEditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    assetNumber: '',
    equipmentType: '' as EquipmentType | '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    yearManufactured: '',
    purchaseDate: '',
    purchaseCost: '',
    status: '' as EquipmentStatus | '',
    fuelType: '' as FuelType | '',
    fuelCapacity: '',
    capacity: '',
    capacityUnit: '',
    totalHours: '',
    lastServiceHours: '',
    nextServiceDue: '',
    warrantyExpiry: '',
    insuranceExpiry: '',
  });

  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Equipment>) => equipmentApi.update(id, data),
    onSuccess: () => {
      router.push(`/equipment/${id}`);
    },
  });

  useEffect(() => {
    if (equipment) {
      const data = equipment.data || equipment;
      setFormData({
        name: data.name || '',
        assetNumber: data.assetNumber || '',
        equipmentType: data.equipmentType || '',
        manufacturer: data.manufacturer || '',
        model: data.model || '',
        serialNumber: data.serialNumber || '',
        yearManufactured: data.yearManufactured?.toString() || '',
        purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
        purchaseCost: data.purchaseCost?.toString() || '',
        status: data.status || '',
        fuelType: data.fuelType || '',
        fuelCapacity: data.fuelCapacity?.toString() || '',
        capacity: data.capacity?.toString() || '',
        capacityUnit: data.capacityUnit || '',
        totalHours: data.totalHours?.toString() || '',
        lastServiceHours: data.lastServiceHours?.toString() || '',
        nextServiceDue: data.nextServiceDue ? data.nextServiceDue.split('T')[0] : '',
        warrantyExpiry: data.warrantyExpiry ? data.warrantyExpiry.split('T')[0] : '',
        insuranceExpiry: data.insuranceExpiry ? data.insuranceExpiry.split('T')[0] : '',
      });
    }
  }, [equipment]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      assetNumber: formData.assetNumber,
      equipmentType: formData.equipmentType,
      manufacturer: formData.manufacturer,
      model: formData.model,
      serialNumber: formData.serialNumber,
      yearManufactured: formData.yearManufactured ? parseInt(formData.yearManufactured) : undefined,
      purchaseDate: formData.purchaseDate || undefined,
      purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : undefined,
      status: formData.status,
      fuelType: formData.fuelType || undefined,
      fuelCapacity: formData.fuelCapacity ? parseFloat(formData.fuelCapacity) : undefined,
      capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
      capacityUnit: formData.capacityUnit || undefined,
      totalHours: formData.totalHours ? parseFloat(formData.totalHours) : undefined,
      lastServiceHours: formData.lastServiceHours ? parseFloat(formData.lastServiceHours) : undefined,
      nextServiceDue: formData.nextServiceDue || undefined,
      warrantyExpiry: formData.warrantyExpiry || undefined,
      insuranceExpiry: formData.insuranceExpiry || undefined,
    };

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <p className="text-gray-500">Equipment not found</p>
          <Link href="/equipment">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Equipment
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/equipment/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Equipment</h1>
            <p className="text-sm text-gray-500">
              Update equipment information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetNumber">Asset Number</Label>
                  <Input
                    id="assetNumber"
                    value={formData.assetNumber}
                    onChange={(e) => handleChange('assetNumber', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipmentType">Equipment Type</Label>
                  <Select
                    value={formData.equipmentType}
                    onValueChange={(value) => handleChange('equipmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleChange('serialNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearManufactured">Year Manufactured</Label>
                  <Input
                    id="yearManufactured"
                    type="number"
                    value={formData.yearManufactured}
                    onChange={(e) => handleChange('yearManufactured', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Operational */}
          <Card>
            <CardHeader>
              <CardTitle>Financial & Operational</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">Purchase Cost ($)</Label>
                  <Input
                    id="purchaseCost"
                    type="number"
                    step="0.01"
                    value={formData.purchaseCost}
                    onChange={(e) => handleChange('purchaseCost', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalHours">Total Hours</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    step="0.1"
                    value={formData.totalHours}
                    onChange={(e) => handleChange('totalHours', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastServiceHours">Last Service Hours</Label>
                  <Input
                    id="lastServiceHours"
                    type="number"
                    step="0.1"
                    value={formData.lastServiceHours}
                    onChange={(e) => handleChange('lastServiceHours', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    step="0.1"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacityUnit">Unit</Label>
                  <Input
                    id="capacityUnit"
                    value={formData.capacityUnit}
                    onChange={(e) => handleChange('capacityUnit', e.target.value)}
                    placeholder="e.g., tons"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelCapacity">Fuel Capacity (L)</Label>
                  <Input
                    id="fuelCapacity"
                    type="number"
                    step="0.1"
                    value={formData.fuelCapacity}
                    onChange={(e) => handleChange('fuelCapacity', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value) => handleChange('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nextServiceDue">Next Service Due</Label>
                <Input
                  id="nextServiceDue"
                  type="date"
                  value={formData.nextServiceDue}
                  onChange={(e) => handleChange('nextServiceDue', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                  <Input
                    id="warrantyExpiry"
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => handleChange('warrantyExpiry', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={formData.insuranceExpiry}
                    onChange={(e) => handleChange('insuranceExpiry', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end gap-4">
          <Link href={`/equipment/${id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
