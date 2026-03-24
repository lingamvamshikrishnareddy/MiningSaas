export type MaintenanceType =
  | 'PREVENTIVE'
  | 'CORRECTIVE'
  | 'PREDICTIVE'
  | 'BREAKDOWN'
  | 'INSPECTION';

export type MaintenanceStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type Priority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface CreateMaintenanceData {
  equipmentId: string;
  maintenanceType: MaintenanceType;
  priority?: Priority;
  scheduledDate: Date | string;
  description: string;
  notes?: string;
  performedById?: string;
}

export interface UpdateMaintenanceData {
  maintenanceType?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: Priority;
  scheduledDate?: Date | string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  description?: string;
  notes?: string;
  performedById?: string;
  laborHours?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  meterReading?: number;
}

export interface MaintenanceResponse {
  id: string;
  equipmentId: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  priority: Priority;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  description: string;
  notes: string | null;
  performedById: string | null;
  laborHours: number | null;
  laborCost: number | null;
  partsCost: number | null;
  totalCost: number | null;
  meterReading: number | null;
  createdAt: Date;
  updatedAt: Date;
  equipment?: {
    id: string;
    assetNumber: string;
    name: string;
    equipmentType: string;
  };
  performedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  partsUsed?: MaintenancePartUsage[];
}

export interface MaintenancePartUsage {
  id: string;
  partId: string;
  quantityUsed: number;
  unitCost: number;
  totalCost: number;
  part?: {
    partNumber: string;
    partName: string;
  };
}

export interface MaintenanceListFilters {
  equipmentId?: string;
  maintenanceType?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: Priority;
  siteId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  performedById?: string;
}

export interface MaintenanceStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  byType: {
    type: MaintenanceType;
    count: number;
  }[];
  byPriority: {
    priority: Priority;
    count: number;
  }[];
  averageCompletionTime: number; // hours
  totalCost: number;
  complianceRate: number; // percentage
}

export interface MaintenanceSchedule {
  equipmentId: string;
  equipmentName: string;
  nextMaintenanceDue: Date | null;
  daysUntilDue: number | null;
  maintenanceType: MaintenanceType;
  isOverdue: boolean;
}

export interface MaintenanceCostAnalysis {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalCost: number;
  laborCost: number;
  partsCost: number;
  byEquipment: {
    equipmentId: string;
    equipmentName: string;
    totalCost: number;
  }[];
  byType: {
    type: MaintenanceType;
    totalCost: number;
  }[];
}