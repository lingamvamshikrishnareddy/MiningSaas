export interface TelemetryData {
  equipmentId: string;
  timestamp?: Date | string;
  engineHours?: number;
  fuelLevel?: number;
  speed?: number;
  engineTemp?: number;
  oilPressure?: number;
  coolantTemp?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  vibration?: number;
  hydraulicPressure?: number;
  batteryVoltage?: number;
  warningCodes?: string[];
}

export interface TelemetryResponse {
  id: string;
  equipmentId: string;
  timestamp: Date;
  engineHours: number | null;
  fuelLevel: number | null;
  speed: number | null;
  engineTemp: number | null;
  oilPressure: number | null;
  coolantTemp: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  vibration: number | null;
  hydraulicPressure: number | null;
  batteryVoltage: number | null;
  warningCodes: string[];
  createdAt: Date;
  equipment?: {
    id: string;
    assetNumber: string;
    name: string;
  };
}

export interface TelemetryQueryParams {
  equipmentId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  metrics?: TelemetryMetric[];
}

export type TelemetryMetric =
  | 'engineHours'
  | 'fuelLevel'
  | 'speed'
  | 'engineTemp'
  | 'oilPressure'
  | 'coolantTemp'
  | 'vibration'
  | 'hydraulicPressure'
  | 'batteryVoltage';

export interface TelemetryAggregation {
  metric: TelemetryMetric;
  average: number;
  min: number;
  max: number;
  latest: number;
  count: number;
}

export interface TelemetryAlert {
  equipmentId: string;
  equipmentName: string;
  alertType: 'WARNING' | 'CRITICAL';
  metric: string;
  currentValue: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

export interface TelemetryTimeSeries {
  timestamp: Date;
  values: {
    [key in TelemetryMetric]?: number;
  };
}

export interface LiveTelemetryData extends TelemetryData {
  status: 'online' | 'offline';
  lastUpdate: Date;
  alerts: TelemetryAlert[];
}

export interface TelemetryThresholds {
  equipmentId: string;
  engineTempMax: number;
  oilPressureMin: number;
  oilPressureMax: number;
  coolantTempMax: number;
  vibrationMax: number;
  hydraulicPressureMin: number;
  hydraulicPressureMax: number;
  batteryVoltageMin: number;
  fuelLevelMin: number;
}

export interface TelemetryStats {
  equipmentId: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    [key in TelemetryMetric]?: {
      average: number;
      min: number;
      max: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  alertCount: number;
  uptimePercentage: number;
}