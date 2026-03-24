'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  AlertTriangle,
  Truck,
  HardHat
} from 'lucide-react';
import { equipmentApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Equipment, 
  EquipmentStatus, 
  EquipmentType,
  EquipmentFilters 
} from '@/types/equipment.types';
import { EQUIPMENT_STATUS_COLORS } from '@/lib/constants';
import { EquipmentFiltersComponent } from '@/components/equipment/EquipmentFilters';

export default function EquipmentListPage() {
  const [filters, setFilters] = useState<EquipmentFilters>({
    search: '',
    equipmentType: undefined,
    status: undefined,
    isActive: true,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentApi.getAll(filters).then((res) => res.data.data),
  });

  const equipment = data?.data || data || [];

  const getStatusColor = (status: string) => {
    return EQUIPMENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and monitor your fleet of mining equipment
          </p>
        </div>
        <Link href="/equipment/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </Button>
        </Link>
      </div>

      <EquipmentFiltersComponent 
        filters={filters} 
        onFilterChange={setFilters} 
      />

      {/* Equipment List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-500">Failed to load equipment</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <Truck className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">No equipment found</p>
            <Link href="/equipment/new">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Equipment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item: Equipment) => (
            <Link key={item.id} href={`/equipment/${item.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <HardHat className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <p className="text-sm text-gray-500">{item.assetNumber}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">{item.equipmentType.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hours</p>
                      <p className="font-medium">{item.totalHours.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Manufacturer</p>
                      <p className="font-medium truncate">{item.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Model</p>
                      <p className="font-medium truncate">{item.model}</p>
                    </div>
                  </div>
                  {item.nextServiceDue && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      Next Service: {new Date(item.nextServiceDue).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
