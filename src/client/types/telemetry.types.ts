export interface TelemetryData {
  id: string;
  equipmentId: string;
  timestamp: string;
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
  warningCodes: string[];
}

export interface TelemetryAlert {
  equipmentId: string;
  equipmentName: string;
  warningCodes: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export interface TelemetryAverages {
  avgFuelLevel?: number;
  avgSpeed?: number;
  avgEngineTemp?: number;
  avgEngineHours?: number;
}
