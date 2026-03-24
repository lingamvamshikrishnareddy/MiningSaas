export type EquipmentType =
  | 'HAUL_TRUCK'
  | 'EXCAVATOR'
  | 'LOADER'
  | 'DOZER'
  | 'GRADER'
  | 'DRILL'
  | 'CRUSHER'
  | 'CONVEYOR'
  | 'GENERATOR'
  | 'PUMP'
  | 'OTHER';

export type EquipmentStatus =
  | 'OPERATIONAL'
  | 'IN_USE'
  | 'MAINTENANCE'
  | 'REPAIR'
  | 'IDLE'
  | 'DECOMMISSIONED';

export type FuelType =
  | 'DIESEL'
  | 'GASOLINE'
  | 'ELECTRIC'
  | 'HYBRID'
  | 'NATURAL_GAS';

export interface CreateEquipmentData {
  assetNumber: string;
  name: string;
  equipmentType: EquipmentType;
  siteId: string;
  currentZoneId?: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearManufactured: number;
  purchaseDate: Date | string;
  purchaseCost: number;
  status?: EquipmentStatus;
  capacity?: number;
  capacityUnit?: string;
  fuelType?: FuelType;
  fuelCapacity?: number;
  warrantyExpiry?: Date | string;
  insuranceExpiry?: Date | string;
}

export interface UpdateEquipmentData {
  name?: string;
  equipmentType?: EquipmentType;
  currentZoneId?: string;
  status?: EquipmentStatus;
  capacity?: number;
  capacityUnit?: string;
  fuelType?: FuelType;
  fuelCapacity?: number;
  totalHours?: number;
  lastServiceHours?: number;
  nextServiceDue?: Date | string;
  warrantyExpiry?: Date | string;
  insuranceExpiry?: Date | string;
  isActive?: boolean;
}

export interface EquipmentResponse {
  id: string;
  assetNumber: string;
  name: string;
  equipmentType: EquipmentType;
  siteId: string;
  currentZoneId: string | null;
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearManufactured: number;
  purchaseDate: Date;
  purchaseCost: number;
  status: EquipmentStatus;
  capacity: number | null;
  capacityUnit: string | null;
  fuelType: FuelType | null;
  fuelCapacity: number | null;
  totalHours: number;
  lastServiceHours: number;
  nextServiceDue: Date | null;
  warrantyExpiry: Date | null;
  insuranceExpiry: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  site?: {
    id: string;
    name: string;
    siteCode: string;
  };
  currentZone?: {
    id: string;
    name: string;
    zoneCode: string;
  } | null;
}

export interface EquipmentListFilters {
  equipmentType?: EquipmentType;
  status?: EquipmentStatus;
  siteId?: string;
  zoneId?: string;
  manufacturer?: string;
  search?: string;
  isActive?: boolean;
}

export interface EquipmentStats {
  total: number;
  operational: number;
  inUse: number;
  maintenance: number;
  idle: number;
  byType: {
    type: EquipmentType;
    count: number;
  }[];
  byStatus: {
    status: EquipmentStatus;
    count: number;
  }[];
  utilizationRate: number;
  availabilityRate: number;
}

export interface EquipmentHealthScore {
  equipmentId: string;
  overallScore: number; // 0-100
  factors: {
    operatingHours: number;
    maintenanceCompliance: number;
    breakdownFrequency: number;
    age: number;
  };
  recommendation: 'GOOD' | 'MONITOR' | 'SERVICE_SOON' | 'URGENT';
}

export interface EquipmentUtilization {
  equipmentId: string;
  period: 'daily' | 'weekly' | 'monthly';
  hoursOperated: number;
  hoursAvailable: number;
  utilizationPercentage: number;
  idleTime: number;
  maintenanceTime: number;
}