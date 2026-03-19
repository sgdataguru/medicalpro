import type {
  VarianceSeverity,
  VarianceDirection,
  CostTrend,
  RevenueComponent,
  CostComponent,
  VarianceRecord,
  WaterfallDataPoint,
  TreemapDataPoint,
  FinancialFilters,
} from './revenue-cost.types';

import { VARIANCE_THRESHOLDS } from './revenue-cost.constants';

// ─── Currency & Number Formatting ─────────────────────────────────────────────

/**
 * Format a number as USD currency with no decimal places.
 * Example: 142300000 -> "$142,300,000"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a compact USD string using K/M/B abbreviations.
 * Example: 142300000 -> "$142.3M", 8500 -> "$8.5K", 2100000000 -> "$2.1B"
 */
export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const formatted = (abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}$${formatted}B`;
  }
  if (abs >= 1_000_000) {
    const formatted = (abs / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}$${formatted}M`;
  }
  if (abs >= 1_000) {
    const formatted = (abs / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${sign}$${formatted}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

/**
 * Format a decimal value as a percentage string.
 * Example: 6.2 -> "6.2%", with includeSign: -3.5 -> "-3.5%", 6.2 -> "+6.2%"
 */
export function formatPercentage(value: number, includeSign?: boolean): string {
  const formatted = Math.abs(value).toFixed(1);
  if (includeSign) {
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
    return `${prefix}${formatted}%`;
  }
  const prefix = value < 0 ? '-' : '';
  return `${prefix}${formatted}%`;
}

/**
 * Format a variance amount with sign and compact notation.
 * Example: 2900000 -> "+$2.9M", -5800000 -> "-$5.8M"
 */
export function formatVarianceAmount(value: number): string {
  const abs = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${abs.toFixed(0)}`;
}

// ─── Variance Classification ──────────────────────────────────────────────────

/**
 * Determine the severity of a variance based on absolute percentage deviation.
 * Uses the VARIANCE_THRESHOLDS constant: CRITICAL >= 20%, SIGNIFICANT >= 10%,
 * MODERATE >= 5%, MINOR >= 0%.
 */
export function getVarianceSeverity(percentageDeviation: number): VarianceSeverity {
  const abs = Math.abs(percentageDeviation);

  if (abs >= VARIANCE_THRESHOLDS.CRITICAL.min) return 'CRITICAL';
  if (abs >= VARIANCE_THRESHOLDS.SIGNIFICANT.min) return 'SIGNIFICANT';
  if (abs >= VARIANCE_THRESHOLDS.MODERATE.min) return 'MODERATE';
  return 'MINOR';
}

/**
 * Return the Tailwind text color class for a variance direction.
 * FAVORABLE = green, UNFAVORABLE = red.
 */
export function getVarianceColorClass(direction: VarianceDirection): string {
  switch (direction) {
    case 'FAVORABLE':
      return 'text-emerald-600';
    case 'UNFAVORABLE':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Return the Tailwind background color class for a variance severity,
 * sourced from VARIANCE_THRESHOLDS.
 */
export function getVarianceBgClass(severity: VarianceSeverity): string {
  return VARIANCE_THRESHOLDS[severity].bgColor;
}

// ─── Computation Helpers ──────────────────────────────────────────────────────

/**
 * Calculate year-over-year change between two periods.
 * Returns both the absolute amount and percentage change.
 * Handles zero prior by returning 0% or 100% as appropriate.
 */
export function calculateYoYChange(
  current: number,
  prior: number
): { amount: number; percentage: number } {
  const amount = current - prior;

  if (prior === 0) {
    return {
      amount,
      percentage: current === 0 ? 0 : 100,
    };
  }

  const percentage = (amount / Math.abs(prior)) * 100;
  return { amount, percentage };
}

/**
 * Calculate budget variance with directional context.
 * For REVENUE: actual > budget = FAVORABLE (beating target).
 * For COST: actual > budget = UNFAVORABLE (over budget).
 */
export function calculateBudgetVariance(
  actual: number,
  budget: number,
  type: 'REVENUE' | 'COST'
): { amount: number; percentage: number; direction: VarianceDirection } {
  const amount = actual - budget;
  const percentage = budget === 0 ? (actual === 0 ? 0 : 100) : (amount / Math.abs(budget)) * 100;

  let direction: VarianceDirection;
  if (type === 'REVENUE') {
    direction = amount >= 0 ? 'FAVORABLE' : 'UNFAVORABLE';
  } else {
    direction = amount <= 0 ? 'FAVORABLE' : 'UNFAVORABLE';
  }

  return { amount, percentage, direction };
}

// ─── Chart Data Builders ──────────────────────────────────────────────────────

/**
 * Transform revenue components into waterfall chart data.
 *
 * Structure:
 * 1. Start bar — comparison total (isTotal = true)
 * 2. One bar per component — shows the delta (positive or negative)
 * 3. End bar — current total (isTotal = true)
 *
 * Each bar tracks a running cumulative start and end for stacked rendering.
 */
export function buildWaterfallData(
  components: RevenueComponent[],
  comparisonTotal: number,
  currentTotal: number
): WaterfallDataPoint[] {
  const data: WaterfallDataPoint[] = [];

  // Start bar: comparison total
  data.push({
    name: 'Prior Period',
    value: comparisonTotal,
    cumulativeStart: 0,
    cumulativeEnd: comparisonTotal,
    isTotal: true,
    isPositive: true,
    componentId: '__start',
  });

  // Component delta bars
  let cumulative = comparisonTotal;
  for (const component of components) {
    const delta = component.delta;
    const start = cumulative;
    const end = cumulative + delta;

    data.push({
      name: component.name,
      value: delta,
      cumulativeStart: Math.min(start, end),
      cumulativeEnd: Math.max(start, end),
      isTotal: false,
      isPositive: delta >= 0,
      componentId: component.componentId,
    });

    cumulative = end;
  }

  // End bar: current total
  data.push({
    name: 'Current Period',
    value: currentTotal,
    cumulativeStart: 0,
    cumulativeEnd: currentTotal,
    isTotal: true,
    isPositive: true,
    componentId: '__end',
  });

  return data;
}

/**
 * Map cost components into treemap-compatible data points.
 */
export function buildTreemapData(components: CostComponent[]): TreemapDataPoint[] {
  return components.map((c) => ({
    name: c.name,
    value: c.currentAmount,
    category: c.category,
    trend: c.trend,
    trendPercentage: c.trendPercentage,
    percentageOfTotal: c.percentageOfTotal,
    budgetVariance: c.budgetVariance,
  }));
}

// ─── Sorting & Filtering ──────────────────────────────────────────────────────

/**
 * Sort variance records by absolute variance-to-budget amount (descending),
 * so the largest dollar-impact variances appear first.
 */
export function sortVariancesByImpact(variances: VarianceRecord[]): VarianceRecord[] {
  return [...variances].sort(
    (a, b) => Math.abs(b.varianceToBudget) - Math.abs(a.varianceToBudget)
  );
}

/**
 * Build URL search parameters from FinancialFilters for API requests.
 */
export function buildFinancialQueryParams(filters: FinancialFilters): URLSearchParams {
  const params = new URLSearchParams();

  params.set('timePeriod', filters.timePeriod);
  params.set('comparisonBase', filters.comparisonBase);

  if (filters.dateRange.start) {
    params.set('startDate', filters.dateRange.start);
  }
  if (filters.dateRange.end) {
    params.set('endDate', filters.dateRange.end);
  }

  if (filters.comparisonDateRange?.start) {
    params.set('compStartDate', filters.comparisonDateRange.start);
  }
  if (filters.comparisonDateRange?.end) {
    params.set('compEndDate', filters.comparisonDateRange.end);
  }

  if (filters.departmentIds.length > 0) {
    params.set('departments', filters.departmentIds.join(','));
  }

  if (filters.costCategories.length > 0) {
    params.set('costCategories', filters.costCategories.join(','));
  }

  params.set('varianceThreshold', String(filters.varianceThreshold));

  return params;
}

// ─── Trend Indicators ─────────────────────────────────────────────────────────

/**
 * Return a unicode arrow icon representing a cost trend direction.
 */
export function getTrendIcon(trend: CostTrend): string {
  switch (trend) {
    case 'RISING':
      return '↑';
    case 'STABLE':
      return '→';
    case 'DECLINING':
      return '↓';
    default:
      return '→';
  }
}

/**
 * Return the Tailwind text color class for a cost trend direction.
 * RISING = red (costs going up is bad), DECLINING = green (costs going down is good).
 */
export function getTrendColorClass(trend: CostTrend): string {
  switch (trend) {
    case 'RISING':
      return 'text-red-600';
    case 'STABLE':
      return 'text-gray-500';
    case 'DECLINING':
      return 'text-emerald-600';
    default:
      return 'text-gray-500';
  }
}
