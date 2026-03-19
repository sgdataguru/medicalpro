import type { WardType, BedStatus, TimePeriod } from './bed-allocation.types';

export const OCCUPANCY_THRESHOLDS = {
  OVER_CAPACITY: 0.95,
  WARNING: 0.85,
  TARGET_HIGH: 0.85,
  TARGET_LOW: 0.70,
  LOW: 0.60,
} as const;

export const WARD_TYPE_LABELS: Record<WardType, string> = {
  ICU: 'Intensive Care Unit',
  EMERGENCY: 'Emergency Department',
  SURGICAL: 'Surgical Ward',
  MEDICAL: 'Medical Ward',
  PEDIATRIC: 'Pediatrics',
  MATERNITY: 'Maternity',
  PSYCHIATRIC: 'Psychiatry',
  STEPDOWN: 'Step-Down Unit',
  REHAB: 'Rehabilitation',
};

export const BED_STATUS_COLORS: Record<BedStatus, { bg: string; text: string }> = {
  OCCUPIED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  AVAILABLE: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  RESERVED: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  MAINTENANCE: { bg: 'bg-gray-100', text: 'text-gray-800' },
  BLOCKED: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const ALERT_SEVERITY_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  WARNING: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' },
  INFO: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
};

export const PRIORITY_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const REALLOCATION_TYPE_LABELS: Record<string, string> = {
  TRANSFER_BEDS: 'Transfer Beds',
  ADD_OVERFLOW: 'Add Overflow',
  CONVERT_WARD: 'Convert Ward',
  TEMPORARY_EXPANSION: 'Temporary Expansion',
};

export const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '14 Days' },
  { value: '30d', label: '30 Days' },
];

export const CHART_COLORS = {
  actual: '#0058be',
  forecast: '#2170e4',
  confidenceBand: 'rgba(33, 112, 228, 0.15)',
  overCapacity: '#ba1a1a',
  targetZone: 'rgba(0, 150, 104, 0.1)',
  threshold: '#f59e0b',
} as const;

export const DEFAULT_FILTERS = {
  departmentIds: [] as string[],
  wardIds: [] as string[],
  timePeriod: '7d' as TimePeriod,
};
