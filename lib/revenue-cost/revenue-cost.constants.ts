import type {
  TimePeriodType,
  ComparisonBase,
  CostCategory,
  RevenueCategory,
  VarianceSeverity,
  FinancialFilters,
} from './revenue-cost.types';

export const COST_CATEGORY_CONFIG: Record<CostCategory, { label: string; color: string; sortOrder: number }> = {
  STAFFING: { label: 'Staffing', color: '#0058be', sortOrder: 1 },
  SUPPLIES: { label: 'Supplies', color: '#2170e4', sortOrder: 2 },
  EQUIPMENT: { label: 'Equipment', color: '#f59e0b', sortOrder: 3 },
  OVERHEAD: { label: 'Overhead', color: '#6B7280', sortOrder: 4 },
  FACILITIES: { label: 'Facilities', color: '#8B5CF6', sortOrder: 5 },
  PHARMACEUTICALS: { label: 'Pharmaceuticals', color: '#EC4899', sortOrder: 6 },
  INSURANCE: { label: 'Insurance', color: '#009668', sortOrder: 7 },
  DEPRECIATION: { label: 'Depreciation', color: '#9CA3AF', sortOrder: 8 },
  OTHER: { label: 'Other', color: '#D1D5DB', sortOrder: 9 },
};

export const REVENUE_CATEGORY_CONFIG: Record<RevenueCategory, { label: string; color: string; sortOrder: number }> = {
  INPATIENT: { label: 'Inpatient', color: '#0058be', sortOrder: 1 },
  OUTPATIENT: { label: 'Outpatient', color: '#2170e4', sortOrder: 2 },
  SURGICAL: { label: 'Surgical', color: '#059669', sortOrder: 3 },
  EMERGENCY: { label: 'Emergency', color: '#ba1a1a', sortOrder: 4 },
  PHARMACY: { label: 'Pharmacy', color: '#f59e0b', sortOrder: 5 },
  IMAGING: { label: 'Imaging', color: '#8B5CF6', sortOrder: 6 },
  LABORATORY: { label: 'Laboratory', color: '#EC4899', sortOrder: 7 },
  REHABILITATION: { label: 'Rehabilitation', color: '#009668', sortOrder: 8 },
  OTHER: { label: 'Other', color: '#9CA3AF', sortOrder: 9 },
};

export const VARIANCE_THRESHOLDS: Record<VarianceSeverity, { min: number; label: string; color: string; bgColor: string }> = {
  CRITICAL: { min: 20, label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100' },
  SIGNIFICANT: { min: 10, label: 'Significant', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  MODERATE: { min: 5, label: 'Moderate', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  MINOR: { min: 0, label: 'Minor', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export const TIME_PERIOD_OPTIONS: { value: TimePeriodType; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const COMPARISON_BASE_OPTIONS: { value: ComparisonBase; label: string }[] = [
  { value: 'PRIOR_YEAR', label: 'Prior Year' },
  { value: 'BUDGET', label: 'Budget' },
  { value: 'PRIOR_QUARTER', label: 'Prior Quarter' },
  { value: 'CUSTOM', label: 'Custom Baseline' },
];

export const FISCAL_YEAR_CONFIG = {
  startMonth: 4, // April (0-indexed would be 3, but 1-indexed)
  quarterMonths: [[4, 5, 6], [7, 8, 9], [10, 11, 12], [1, 2, 3]] as const,
  quarterLabels: ['Q1', 'Q2', 'Q3', 'Q4'] as const,
};

export const CHART_COLORS = {
  revenue: '#2170e4',
  cost: '#ba1a1a',
  positive: '#009668',
  negative: '#ba1a1a',
  budget: '#6B7280',
  priorYear: '#9CA3AF',
  grid: '#c6c6cd',
  margin: '#0058be',
  waterfallBase: '#131b2e',
  waterfallPositive: '#009668',
  waterfallNegative: '#ba1a1a',
  waterfallTotal: '#0058be',
};

export const ITEMS_PER_PAGE = 15;

export const DEFAULT_FILTERS: FinancialFilters = {
  timePeriod: 'QUARTERLY',
  dateRange: { start: '', end: '' },
  comparisonBase: 'PRIOR_YEAR',
  departmentIds: [],
  costCategories: [],
  varianceThreshold: 5,
};
