export type EquipmentType = 'HAUL_TRUCK' | 'EXCAVATOR' | 'LOADER' | 'DOZER' | 'GRADER' | 'DRILL' | 'CRUSHER' | 'CONVEYOR' | 'GENERATOR' | 'PUMP' | 'OTHER';
export type EquipmentStatus = 'OPERATIONAL' | 'IN_USE' | 'MAINTENANCE' | 'REPAIR' | 'IDLE' | 'DECOMMISSIONED';
export type FuelType = 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'NATURAL_GAS';

export interface Equipment {
  id: string;
  assetNumber: string;
  name: string;
  equipmentType: EquipmentType;
  siteId: string;
  currentZoneId?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearManufactured: number;
  purchaseDate: string;
  purchaseCost: number;
  status: EquipmentStatus;
  capacity?: number;
  capacityUnit?: string;
  fuelType?: FuelType;
  fuelCapacity?: number;
  totalHours: number;
  lastServiceHours: number;
  nextServiceDue?: string;
  warrantyExpiry?: string;
  insuranceExpiry?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  site?: { id: string; name: string; siteCode: string };
  currentZone?: { id: string; name: string; zoneCode: string } | null;
}

export interface EquipmentFilters {
  equipmentType?: EquipmentType;
  status?: EquipmentStatus;
  siteId?: string;
  search?: string;
  isActive?: boolean;
}

export interface FleetOverview {
  total: number;
  operational: number;
  inUse: number;
  maintenance: number;
  idle: number;
  repair: number;
  utilizationRate: number;
  availabilityRate: number;
}
