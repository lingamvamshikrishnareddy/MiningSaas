export type MineType =
  | 'OPEN_PIT'
  | 'UNDERGROUND'
  | 'QUARRY'
  | 'STRIP_MINE'
  | 'PLACER';

export type ZoneType =
  | 'EXTRACTION'
  | 'PROCESSING'
  | 'STORAGE'
  | 'MAINTENANCE'
  | 'ADMIN'
  | 'RESTRICTED';

export type SafetyLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type ShiftType =
  | 'DAY'
  | 'NIGHT'
  | 'SWING';

export type InspectionType =
  | 'PRE_SHIFT'
  | 'POST_SHIFT'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'ANNUAL'
  | 'SAFETY'
  | 'REGULATORY';

export type InspectionStatus =
  | 'PASS'
  | 'PASS_WITH_NOTES'
  | 'FAIL'
  | 'NEEDS_MAINTENANCE';

export type CheckStatus =
  | 'OK'
  | 'ATTENTION_NEEDED'
  | 'FAILED'
  | 'NOT_APPLICABLE';

export type IncidentType =
  | 'INJURY'
  | 'NEAR_MISS'
  | 'PROPERTY_DAMAGE'
  | 'ENVIRONMENTAL'
  | 'SECURITY'
  | 'EQUIPMENT_FAILURE'
  | 'OPERATIONAL';

export type IncidentSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'FATAL';

export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'UNDER_REVIEW'
  | 'CLOSED';

export type SubscriptionTier =
  | 'BASIC'
  | 'PROFESSIONAL'
  | 'ENTERPRISE';

export type SnapshotType =
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

export interface NameValue {
  name: string;
  value: number;
}

export interface LabelValue {
  label: string;
  value: string | number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface TrendData {
  date: Date | string;
  value: number;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}