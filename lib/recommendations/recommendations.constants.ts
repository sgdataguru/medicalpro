import type {
  PriorityLevel,
  HospitalModule,
  RecommendationStatus,
  DismissReason,
  UrgencyLevel,
  RecommendationFilterState,
} from './recommendations.types';

// Priority visual config — mapped to MD3 design tokens
export const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bgClass: string; borderClass: string; textClass: string }
> = {
  urgent: {
    label: 'URGENT',
    color: '#ba1a1a',
    bgClass: 'bg-red-100',
    borderClass: 'border-l-4 border-l-error',
    textClass: 'text-red-700',
  },
  high: {
    label: 'HIGH',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    borderClass: 'border-l-4 border-l-warning',
    textClass: 'text-amber-700',
  },
  medium: {
    label: 'MEDIUM',
    color: '#0058be',
    bgClass: 'bg-blue-100',
    borderClass: 'border-l-4 border-l-secondary',
    textClass: 'text-secondary',
  },
  low: {
    label: 'LOW',
    color: '#c6c6cd',
    bgClass: 'bg-gray-100',
    borderClass: 'border-l-4 border-l-outline-variant',
    textClass: 'text-on-surface-variant',
  },
};

// Priority sort order (urgent first)
export const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// Module config — consistent with anomaly module config pattern
export const MODULE_CONFIG: Record<
  HospitalModule,
  { label: string; icon: string; color: string; bgClass: string }
> = {
  staffing: { label: 'Staffing', icon: 'groups', color: '#0058be', bgClass: 'bg-blue-100 text-secondary' },
  bed_allocation: { label: 'Bed Allocation', icon: 'bed', color: '#2170e4', bgClass: 'bg-blue-50 text-secondary-container' },
  supply_chain: { label: 'Supply Chain', icon: 'inventory_2', color: '#f59e0b', bgClass: 'bg-amber-50 text-amber-700' },
  finance: { label: 'Finance', icon: 'payments', color: '#009668', bgClass: 'bg-emerald-50 text-emerald-700' },
  anomaly_detection: { label: 'Anomaly Detection', icon: 'warning', color: '#8B5CF6', bgClass: 'bg-violet-50 text-violet-700' },
};

// Urgency config
export const URGENCY_CONFIG: Record<
  UrgencyLevel,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  immediate: { label: 'Act Now', color: '#ba1a1a', bgClass: 'bg-red-100 text-red-700', icon: 'priority_high' },
  this_week: { label: 'This Week', color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-700', icon: 'schedule' },
  this_month: { label: 'This Month', color: '#0058be', bgClass: 'bg-blue-100 text-secondary', icon: 'calendar_month' },
  next_quarter: { label: 'Next Quarter', color: '#c6c6cd', bgClass: 'bg-gray-100 text-on-surface-variant', icon: 'event_upcoming' },
};

// Status config
export const STATUS_CONFIG: Record<
  RecommendationStatus,
  { label: string; color: string; bgClass: string; icon: string }
> = {
  active: { label: 'Active', color: '#0058be', bgClass: 'bg-blue-100 text-secondary', icon: 'fiber_new' },
  accepted: { label: 'Accepted', color: '#009668', bgClass: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
  deferred: { label: 'Deferred', color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-700', icon: 'schedule' },
  dismissed: { label: 'Dismissed', color: '#6B7280', bgClass: 'bg-gray-100 text-gray-600', icon: 'cancel' },
  expired: { label: 'Expired', color: '#9CA3AF', bgClass: 'bg-gray-50 text-gray-500', icon: 'timer_off' },
};

// Dismiss reason labels
export const DISMISS_REASONS: { value: DismissReason; label: string }[] = [
  { value: 'not_applicable', label: 'Not Applicable' },
  { value: 'already_implemented', label: 'Already Implemented' },
  { value: 'disagree_with_analysis', label: 'Disagree with Analysis' },
  { value: 'insufficient_resources', label: 'Insufficient Resources' },
  { value: 'organizational_constraint', label: 'Organizational Constraint' },
  { value: 'other', label: 'Other' },
];

// Deferral period options
export const DEFER_PERIOD_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 0, label: 'Custom date' },
];

// Outcome colors
export const OUTCOME_COLORS = {
  positive: '#009668',
  neutral: '#c6c6cd',
  negative: '#ba1a1a',
};

// Chart colors
export const CHART_COLORS = {
  accepted: '#0058be',
  successRate: '#009668',
  impact: '#f59e0b',
  grid: '#c6c6cd',
  axis: '#45464d',
};

// Default filters
export const DEFAULT_FILTERS: RecommendationFilterState = {
  priority: [],
  modules: [],
  status: ['active'],
  dateRange: null,
  sortBy: 'priority',
  sortOrder: 'desc',
};

// Priority weight factors for scoring
export const PRIORITY_WEIGHTS = {
  revenue_impact: 0.30,
  patient_safety: 0.25,
  cost_savings: 0.20,
  operational_efficiency: 0.15,
  compliance: 0.10,
};

// Priority classification thresholds
export const PRIORITY_THRESHOLDS = {
  urgent: 85,
  high: 65,
  medium: 40,
};

// Page sizes
export const ITEMS_PER_PAGE = 10;
export const MAX_ACTIVE_PER_HOSPITAL = 50;
