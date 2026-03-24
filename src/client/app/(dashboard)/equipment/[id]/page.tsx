'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  HardHat,
  Wrench,
  Fuel,
  Activity,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react';
import { equipmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Equipment } from '@/types/equipment.types';
import { EQUIPMENT_STATUS_COLORS } from '@/lib/constants';

interface EquipmentPageProps {
  params: Promise<{ id: string }>;
}

export default function EquipmentDetailPage({ params }: EquipmentPageProps) {
  const { id } = use(params);
  
  const { data: equipment, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.getById(id).then((res) => res.data.data),
    enabled: !!id,
  });

  const { data: telemetry } = useQuery({
    queryKey: ['equipment-telemetry', id],
    queryFn: () => equipmentApi.getTelemetry(id, 24).then((res) => res.data.data),
    enabled: !!id,
  });

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

  const equipmentData = equipment.data || equipment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <h1 className="text-2xl font-bold text-gray-900">{equipmentData.name}</h1>
              <p className="text-sm text-gray-500">Asset #: {equipmentData.assetNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/equipment/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="icon">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-4">
        <Badge className={EQUIPMENT_STATUS_COLORS[equipmentData.status]}>
          {equipmentData.status.replace('_', ' ')}
        </Badge>
        {equipmentData.nextServiceDue && (
          <span className="text-sm text-gray-500">
            Next Service: {new Date(equipmentData.nextServiceDue).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Equipment Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Equipment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{equipmentData.equipmentType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{equipmentData.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{equipmentData.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium">{equipmentData.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{equipmentData.yearManufactured}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium">{equipmentData.fuelType?.replace('_', ' ') || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hours & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Usage & Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold">{equipmentData.totalHours.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Service</p>
                  <p className="text-2xl font-bold">{equipmentData.lastServiceHours.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuel Capacity</p>
                  <p className="text-2xl font-bold">{equipmentData.fuelCapacity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="text-2xl font-bold">
                    {equipmentData.capacity ? `${equipmentData.capacity} ${equipmentData.capacityUnit || ''}` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {equipmentData.site && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{equipmentData.site.name}</p>
                    <p className="text-sm text-gray-500">Site Code: {equipmentData.site.siteCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Purchase Cost</span>
                <span className="font-medium">${equipmentData.purchaseCost?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Purchase Date</span>
                <span className="font-medium">
                  {equipmentData.purchaseDate ? new Date(equipmentData.purchaseDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Warranty Expires</span>
                <span className="font-medium">
                  {equipmentData.warrantyExpiry ? new Date(equipmentData.warrantyExpiry).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Insurance Expires</span>
                <span className="font-medium">
                  {equipmentData.insuranceExpiry ? new Date(equipmentData.insuranceExpiry).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/maintenance/new?equipmentId=${id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </Link>
              <Link href={`/telemetry/${id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  View Telemetry
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Fuel className="w-4 h-4 mr-2" />
                Log Fuel
              </Button>
            </CardContent>
          </Card>

          {/* Recent Telemetry */}
          {telemetry && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {telemetry.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex gap-4">
                        {item.fuelLevel !== null && (
                          <span>Fuel: {item.fuelLevel}%</span>
                        )}
                        {item.engineHours !== null && (
                          <span>Hours: {item.engineHours}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
