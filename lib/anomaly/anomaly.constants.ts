import type {
  AnomalySeverity,
  AnomalyStatus,
  HospitalModule,
  AnomalyFilterState,
} from './anomaly.types';

export const SEVERITY_CONFIG: Record<
  AnomalySeverity,
  { label: string; color: string; bgColor: string; textColor: string; borderColor: string; dotColor: string }
> = {
  critical: {
    label: 'Critical',
    color: '#ba1a1a',
    bgColor: 'bg-red-600',
    textColor: 'text-red-700',
    borderColor: 'border-red-600',
    dotColor: 'bg-red-500',
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  informational: {
    label: 'Info',
    color: '#2170e4',
    bgColor: 'bg-blue-100',
    textColor: 'text-secondary',
    borderColor: 'border-blue-300',
    dotColor: 'bg-secondary',
  },
};

export const STATUS_CONFIG: Record<
  AnomalyStatus,
  { label: string; color: string; bgClass: string }
> = {
  active: { label: 'Active', color: '#ba1a1a', bgClass: 'bg-red-100 text-red-700' },
  acknowledged: { label: 'Acknowledged', color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-700' },
  investigating: { label: 'Investigating', color: '#2170e4', bgClass: 'bg-blue-100 text-secondary' },
  dismissed: { label: 'Dismissed', color: '#6B7280', bgClass: 'bg-gray-100 text-gray-600' },
  resolved: { label: 'Resolved', color: '#009668', bgClass: 'bg-emerald-100 text-emerald-700' },
};

export const MODULE_CONFIG: Record<
  HospitalModule,
  { label: string; color: string; bgClass: string }
> = {
  staffing: { label: 'Staffing', color: '#0058be', bgClass: 'bg-blue-100 text-secondary' },
  'bed-allocation': { label: 'Bed Allocation', color: '#2170e4', bgClass: 'bg-blue-50 text-secondary-container' },
  'supply-chain': { label: 'Supply Chain', color: '#f59e0b', bgClass: 'bg-amber-50 text-amber-700' },
  finance: { label: 'Finance', color: '#009668', bgClass: 'bg-emerald-50 text-emerald-700' },
  'cross-module': { label: 'Cross-Module', color: '#8B5CF6', bgClass: 'bg-violet-50 text-violet-700' },
};

export const SEVERITY_ORDER: Record<AnomalySeverity, number> = {
  critical: 0,
  warning: 1,
  informational: 2,
};

export const TREND_PERIOD_OPTIONS = [
  { value: '7d' as const, label: 'Last 7 days' },
  { value: '30d' as const, label: 'Last 30 days' },
  { value: '90d' as const, label: 'Last 90 days' },
  { value: '1y' as const, label: 'Last year' },
];

export const TREND_GRANULARITY_OPTIONS = [
  { value: 'hourly' as const, label: 'Hourly' },
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
];

export const ITEMS_PER_PAGE = 25;

export const DEFAULT_FILTERS: AnomalyFilterState = {
  modules: [],
  severities: [],
  statuses: ['active', 'acknowledged', 'investigating'],
  dateRange: { start: '', end: '' },
  searchQuery: '',
  sortBy: 'detectedAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: ITEMS_PER_PAGE,
};

export const CHART_COLORS = {
  critical: '#ba1a1a',
  warning: '#f59e0b',
  informational: '#2170e4',
  resolved: '#009668',
  grid: '#c6c6cd',
  axis: '#45464d',
  tooltip: '#ffffff',
};

export const DISMISS_REASON_MIN_LENGTH = 10;

export const SSE_RECONNECT_INTERVAL = 5000;
export const SSE_HEARTBEAT_INTERVAL = 30000;

export const INVESTIGATION_AUTOSAVE_INTERVAL = 30000;
