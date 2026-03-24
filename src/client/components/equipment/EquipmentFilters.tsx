'use client';

import React from 'react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EquipmentFilters } from '../../types/equipment.types';
import { useSites } from '../../hooks/useSites';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';

interface EquipmentFiltersProps {
  filters: EquipmentFilters;
  onFilterChange: (filters: EquipmentFilters) => void;
}

export function EquipmentFiltersComponent({ filters, onFilterChange }: EquipmentFiltersProps) {
  const { data: sites } = useSites();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({ ...filters, equipmentType: value === 'all' ? undefined : value as any });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === 'all' ? undefined : value as any });
  };

  const handleSiteChange = (value: string) => {
    onFilterChange({ ...filters, siteId: value === 'all' ? undefined : value });
  };

  const resetFilters = () => {
    onFilterChange({
      search: '',
      equipmentType: undefined,
      status: undefined,
      siteId: undefined,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
      <div className="flex-1 w-full space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search equipment..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="w-full md:w-48 space-y-2">
        <Select value={filters.equipmentType || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HAUL_TRUCK">Haul Truck</SelectItem>
            <SelectItem value="EXCAVATOR">Excavator</SelectItem>
            <SelectItem value="LOADER">Loader</SelectItem>
            <SelectItem value="DOZER">Dozer</SelectItem>
            <SelectItem value="GRADER">Grader</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-48 space-y-2">
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="OPERATIONAL">Operational</SelectItem>
            <SelectItem value="IN_USE">In Use</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="REPAIR">Repair</SelectItem>
            <SelectItem value="IDLE">Idle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full md:w-48 space-y-2">
        <Select value={filters.siteId || 'all'} onValueChange={handleSiteChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sites</SelectItem>
            {sites?.map((site: any) => (
              <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset Filters">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
