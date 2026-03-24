export const APP_NAME = 'Mining OPS';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EQUIPMENT: '/equipment',
  EQUIPMENT_NEW: '/equipment/new',
  MAINTENANCE: '/maintenance',
  TELEMETRY: '/telemetry',
  FUEL: '/fuel',
  PRODUCTION: '/production',
  INSPECTIONS: '/inspections',
  SAFETY: '/safety',
  ANALYTICS: '/analytics',
  SITES: '/sites',
  SETTINGS: '/settings',
  BILLING: '/settings/billing',
  BILLING_PLANS: '/settings/billing/plans',
  BILLING_INVOICES: '/settings/billing/invoices',
} as const;

export const EQUIPMENT_STATUS_COLORS: Record<string, string> = {
  OPERATIONAL: 'bg-green-100 text-green-800',
  IN_USE: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  REPAIR: 'bg-orange-100 text-orange-800',
  IDLE: 'bg-gray-100 text-gray-800',
  DECOMMISSIONED: 'bg-red-100 text-red-800',
};

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

export const INCIDENT_SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
  FATAL: 'bg-purple-100 text-purple-800',
};

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
};
