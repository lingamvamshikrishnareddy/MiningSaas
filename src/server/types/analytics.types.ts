export interface DashboardStats {
  equipment: EquipmentDashboardStats;
  maintenance: MaintenanceDashboardStats;
  production: ProductionDashboardStats;
  safety: SafetyDashboardStats;
  fuel: FuelDashboardStats;
}

export interface EquipmentDashboardStats {
  totalEquipment: number;
  operational: number;
  inMaintenance: number;
  idle: number;
  utilizationRate: number;
  availabilityRate: number;
  alerts: number;
}

export interface MaintenanceDashboardStats {
  scheduledToday: number;
  overdue: number;
  inProgress: number;
  completedThisMonth: number;
  complianceRate: number;
  averageCost: number;
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
}

export interface ProductionDashboardStats {
  dailyProduction: number;
  weeklyProduction: number;
  monthlyProduction: number;
  targetCompletion: number;
  averageGrade: number;
  blastCount: number;
}

export interface SafetyDashboardStats {
  openIncidents: number;
  closedThisMonth: number;
  nearMisses: number;
  daysWithoutIncident: number;
  incidentRate: number;
  complianceScore: number;
}

export interface FuelDashboardStats {
  dailyConsumption: number;
  monthlyConsumption: number;
  totalCost: number;
  averageEfficiency: number;
  topConsumers: {
    equipmentId: string;
    equipmentName: string;
    consumption: number;
  }[];
}

export interface KPITrend {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  data: {
    date: Date | string;
    value: number;
  }[];
}

export interface FleetAnalytics {
  totalEquipment: number;
  byType: {
    type: string;
    count: number;
    utilizationRate: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
  bySite: {
    siteId: string;
    siteName: string;
    equipmentCount: number;
  }[];
  utilization: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  availability: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface MaintenanceAnalytics {
  totalRecords: number;
  byType: {
    type: string;
    count: number;
    cost: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
  }[];
  compliance: {
    onTime: number;
    late: number;
    complianceRate: number;
  };
  costs: {
    total: number;
    labor: number;
    parts: number;
    average: number;
    trend: TrendData[];
  };
  performance: {
    mtbf: number;
    mttr: number;
    repeatFailures: number;
  };
}

export interface ProductionAnalytics {
  total: number;
  byOreType: {
    oreType: string;
    tonnes: number;
    averageGrade: number;
  }[];
  trend: TrendData[];
  efficiency: {
    targetVsActual: number;
    recoveryRate: number;
  };
  byShift: {
    shift: string;
    production: number;
  }[];
}

export interface SafetyAnalytics {
  totalIncidents: number;
  byType: {
    type: string;
    count: number;
  }[];
  bySeverity: {
    severity: string;
    count: number;
  }[];
  trend: TrendData[];
  metrics: {
    incidentRate: number;
    lostTimeIncidents: number;
    nearMisses: number;
    daysWithoutIncident: number;
  };
  bySite: {
    siteId: string;
    siteName: string;
    incidentCount: number;
  }[];
}

export interface CostAnalytics {
  totalCost: number;
  breakdown: {
    fuel: number;
    maintenance: number;
    labor: number;
    parts: number;
    other: number;
  };
  byEquipment: {
    equipmentId: string;
    equipmentName: string;
    totalCost: number;
  }[];
  trend: TrendData[];
  costPerHour: number;
  costPerTonne: number;
}

export interface PerformanceMetrics {
  oee: number; // Overall Equipment Effectiveness
  availability: number;
  performance: number;
  quality: number;
  utilization: number;
  efficiency: number;
}

export interface TrendData {
  date: Date | string;
  value: number;
}

export interface ReportParams {
  reportType: 'equipment' | 'maintenance' | 'production' | 'safety' | 'fuel' | 'cost';
  startDate: Date | string;
  endDate: Date | string;
  siteId?: string;
  equipmentId?: string;
  format?: 'pdf' | 'xlsx' | 'csv';
  groupBy?: 'day' | 'week' | 'month';
}