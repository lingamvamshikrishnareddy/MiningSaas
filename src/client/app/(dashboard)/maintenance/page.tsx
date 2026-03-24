'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Loader2, 
  AlertTriangle,
  Wrench,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { maintenanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MaintenanceResponse, MaintenanceType, MaintenanceStatus, Priority } from '@/types/maintenance.types';
import { MAINTENANCE_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants';

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: 'PREVENTIVE', label: 'Preventive' },
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREDICTIVE', label: 'Predictive' },
  { value: 'BREAKDOWN', label: 'Breakdown' },
  { value: 'INSPECTION', label: 'Inspection' },
];

const STATUS_OPTIONS: { value: MaintenanceStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'OVERDUE', label: 'Overdue' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function MaintenanceListPage() {
  const [filters, setFilters] = useState({
    search: '',
    maintenanceType: '' as MaintenanceType | '',
    status: '' as MaintenanceStatus | '',
    priority: '' as Priority | '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: () => maintenanceApi.getAll(filters).then((res) => res.data.data),
  });

  const maintenanceRecords = data?.data || data || [];

  const getStatusColor = (status: string) => {
    return MAINTENANCE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage equipment maintenance schedules
          </p>
        </div>
        <Link href="/maintenance/schedule">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-2xl font-bold">
                  {maintenanceRecords.filter((m: MaintenanceResponse) => m.status === 'SCHEDULED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">
                  {maintenanceRecords.filter((m: MaintenanceResponse) => m.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-2xl font-bold">
                  {maintenanceRecords.filter((m: MaintenanceResponse) => m.status === 'OVERDUE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {maintenanceRecords.filter((m: MaintenanceResponse) => m.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search maintenance records..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.maintenanceType || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ 
                ...prev, 
                maintenanceType: value === 'all' ? '' : value as MaintenanceType 
              }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {MAINTENANCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ 
                ...prev, 
                status: value === 'all' ? '' : value as MaintenanceStatus 
              }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) => setFilters((prev) => ({ 
                ...prev, 
                priority: value === 'all' ? '' : value as Priority 
              }))}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {PRIORITY_OPTIONS.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-gray-500">Failed to load maintenance records</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : maintenanceRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
            <Wrench className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">No maintenance records found</p>
            <Link href="/maintenance/schedule">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Maintenance
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {maintenanceRecords.map((record: MaintenanceResponse) => (
            <Link key={record.id} href={`/maintenance/${record.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {record.equipment?.name || 'Unknown Equipment'}
                          </h3>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(record.priority)}>
                            {record.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {record.maintenanceType} - {record.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Scheduled: {new Date(record.scheduledDate).toLocaleDateString()}</span>
                          {record.equipment && (
                            <span>Asset: {record.equipment.assetNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
