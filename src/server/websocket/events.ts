export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  // Telemetry
  TELEMETRY_UPDATE: 'telemetry:update',
  TELEMETRY_ALERT: 'telemetry:alert',
  EQUIPMENT_STATUS_CHANGE: 'equipment:status_change',

  // Maintenance
  MAINTENANCE_CREATED: 'maintenance:created',
  MAINTENANCE_UPDATED: 'maintenance:updated',
  MAINTENANCE_COMPLETED: 'maintenance:completed',
  MAINTENANCE_OVERDUE: 'maintenance:overdue',

  // Incidents
  INCIDENT_CREATED: 'incident:created',
  INCIDENT_UPDATED: 'incident:updated',

  // General
  NOTIFICATION: 'notification',
  ERROR: 'error',
} as const;

export type SocketEventType = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];

export interface TelemetryUpdatePayload {
  equipmentId: string;
  timestamp: Date;
  fuelLevel?: number;
  speed?: number;
  engineTemp?: number;
  oilPressure?: number;
  latitude?: number;
  longitude?: number;
  warningCodes?: string[];
}

export interface EquipmentStatusPayload {
  equipmentId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: Date;
}

export interface NotificationPayload {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  data?: any;
}
