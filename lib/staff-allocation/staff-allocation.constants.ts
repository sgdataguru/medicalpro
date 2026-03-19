import type { StaffRole, ShiftType } from './staff-allocation.types';

export const SHIFT_DEFINITIONS: Record<ShiftType, { label: string; start: string; end: string; order: number }> = {
  DAY: { label: 'Day Shift', start: '07:00', end: '15:00', order: 0 },
  EVENING: { label: 'Evening Shift', start: '15:00', end: '23:00', order: 1 },
  NIGHT: { label: 'Night Shift', start: '23:00', end: '07:00', order: 2 },
};

export const ROLE_DISPLAY_MAP: Record<StaffRole, string> = {
  RN: 'Registered Nurse',
  CNA: 'Certified Nursing Assistant',
  MD: 'Physician',
  PA: 'Physician Assistant',
  NP: 'Nurse Practitioner',
  TECH: 'Technician',
  ADMIN: 'Administrative',
};

export const ROLE_ABBREVIATIONS: StaffRole[] = ['RN', 'CNA', 'MD', 'PA', 'NP', 'TECH', 'ADMIN'];

export const REGULATORY_RATIOS: Record<string, number> = {
  'Emergency': 4,
  'ICU': 2,
  'Surgery': 3,
  'Oncology': 5,
  'Pediatrics': 4,
  'Cardiology': 4,
  'Orthopedics': 5,
  'Neurology': 4,
  'Radiology': 6,
  'General Ward': 6,
  'Maternity': 4,
  'Rehabilitation': 6,
};

export const PRIORITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const RECOMMENDATION_TYPE_LABELS: Record<string, string> = {
  ADD_STAFF: 'Add Staff',
  REASSIGN: 'Reassign',
  REDUCE: 'Reduce',
  SHIFT_SWAP: 'Shift Swap',
};

export const GAP_SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
  WARNING: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  INFO: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
};

export const DEFAULT_FILTERS = {
  departmentIds: [] as string[],
  roles: [] as StaffRole[],
  shifts: [] as ShiftType[],
  dateRange: { start: '', end: '' },
};
