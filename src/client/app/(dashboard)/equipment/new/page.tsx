'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, HardHat } from 'lucide-react';
import { equipmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentType, EquipmentStatus, FuelType } from '@/types/equipment.types';

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

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'NATURAL_GAS', label: 'Natural Gas' },
];

const STATUS_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: 'OPERATIONAL', label: 'Operational' },
  { value: 'IDLE', label: 'Idle' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export default function NewEquipmentPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    assetNumber: '',
    name: '',
    equipmentType: '' as EquipmentType | '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    yearManufactured: new Date().getFullYear(),
    purchaseDate: '',
    purchaseCost: 0,
    status: 'IDLE' as EquipmentStatus,
    fuelType: '' as FuelType | '',
    fuelCapacity: 0,
    capacity: 0,
    capacityUnit: '',
    totalHours: 0,
    siteId: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => equipmentApi.create(data),
    onSuccess: () => {
      router.push('/equipment');
    },
    onError: (error: any) => {
      setErrors({ submit: error.response?.data?.message || 'Failed to create equipment' });
    },
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.assetNumber.trim()) {
      newErrors.assetNumber = 'Asset number is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.equipmentType) {
      newErrors.equipmentType = 'Equipment type is required';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/equipment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <HardHat className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Equipment</h1>
            <p className="text-sm text-gray-500">Register new equipment to your fleet</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetNumber">Asset Number *</Label>
                  <Input
                    id="assetNumber"
                    value={formData.assetNumber}
                    onChange={(e) => handleChange('assetNumber', e.target.value)}
                    placeholder="e.g., EQ-001"
                  />
                  {errors.assetNumber && (
                    <p className="text-xs text-red-500">{errors.assetNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., CAT 797F Haul Truck"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Equipment Type *</Label>
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
                  {errors.equipmentType && (
                    <p className="text-xs text-red-500">{errors.equipmentType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                    placeholder="e.g., Caterpillar"
                  />
                  {errors.manufacturer && (
                    <p className="text-xs text-red-500">{errors.manufacturer}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="e.g., 797F"
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500">{errors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleChange('serialNumber', e.target.value)}
                    placeholder="e.g., CAT0797FT4B02456"
                  />
                  {errors.serialNumber && (
                    <p className="text-xs text-red-500">{errors.serialNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearManufactured">Year Manufactured</Label>
                  <Input
                    id="yearManufactured"
                    type="number"
                    value={formData.yearManufactured}
                    onChange={(e) => handleChange('yearManufactured', parseInt(e.target.value))}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase & Finance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    value={formData.purchaseCost}
                    onChange={(e) => handleChange('purchaseCost', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity & Fuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacityUnit">Capacity Unit</Label>
                  <Input
                    id="capacityUnit"
                    value={formData.capacityUnit}
                    onChange={(e) => handleChange('capacityUnit', e.target.value)}
                    placeholder="e.g., tonnes, liters"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fuel Type</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="fuelCapacity">Fuel Capacity (L)</Label>
                  <Input
                    id="fuelCapacity"
                    type="number"
                    value={formData.fuelCapacity}
                    onChange={(e) => handleChange('fuelCapacity', parseFloat(e.target.value))}
                    min={0}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-3 flex justify-end gap-4">
            <Link href="/equipment">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Equipment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
