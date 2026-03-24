export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'BREAKDOWN' | 'INSPECTION';
export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  priority: Priority;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  description: string;
  notes?: string;
  performedById?: string;
  laborHours?: number;
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  meterReading?: number;
  createdAt: string;
  updatedAt: string;
  equipment?: { id: string; assetNumber: string; name: string; equipmentType: string };
  performedBy?: { id: string; firstName: string; lastName: string } | null;
}

export interface MaintenanceFilters {
  equipmentId?: string;
  maintenanceType?: MaintenanceType;
  status?: MaintenanceStatus;
  priority?: Priority;
  siteId?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaintenanceStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
}
