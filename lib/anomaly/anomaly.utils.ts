import { formatDistanceToNow, format, parseISO, subDays } from 'date-fns';
import type {
  AnomalyAlert,
  AnomalySeverity,
  AnomalyFilterState,
  AnomalyTrendDataPoint,
  HospitalModule,
} from './anomaly.types';
import { SEVERITY_ORDER } from './anomaly.constants';

/** Format ISO date to relative time string (e.g., "2 min ago") */
export function formatAnomalyTimestamp(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/** Format ISO date to readable date string */
export function formatAnomalyDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy HH:mm');
  } catch {
    return 'Unknown';
  }
}

/** Classify severity from a numeric score */
export function classifyAnomalySeverity(
  score: number,
  thresholds: { critical: number; warning: number },
): AnomalySeverity {
  if (score >= thresholds.critical) return 'critical';
  if (score >= thresholds.warning) return 'warning';
  return 'informational';
}

/** Serialize filter state to URL search params */
export function buildAnomalySearchParams(filters: AnomalyFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.modules.length > 0) params.set('modules', filters.modules.join(','));
  if (filters.severities.length > 0) params.set('severities', filters.severities.join(','));
  if (filters.statuses.length > 0) params.set('statuses', filters.statuses.join(','));
  if (filters.dateRange.start) params.set('dateFrom', filters.dateRange.start);
  if (filters.dateRange.end) params.set('dateTo', filters.dateRange.end);
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.sortBy !== 'detectedAt') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

/** Deserialize URL search params to partial filter state */
export function parseAnomalySearchParams(params: URLSearchParams): Partial<AnomalyFilterState> {
  const filters: Partial<AnomalyFilterState> = {};
  const modules = params.get('modules');
  if (modules) filters.modules = modules.split(',') as HospitalModule[];
  const severities = params.get('severities');
  if (severities) filters.severities = severities.split(',') as AnomalySeverity[];
  const statuses = params.get('statuses');
  if (statuses) filters.statuses = statuses.split(',') as AnomalyFilterState['statuses'];
  const dateFrom = params.get('dateFrom');
  const dateTo = params.get('dateTo');
  if (dateFrom || dateTo) {
    filters.dateRange = {
      start: dateFrom ?? '',
      end: dateTo ?? '',
    };
  }
  const search = params.get('search');
  if (search) filters.searchQuery = search;
  const sortBy = params.get('sortBy');
  if (sortBy) filters.sortBy = sortBy as AnomalyFilterState['sortBy'];
  const sortOrder = params.get('sortOrder');
  if (sortOrder) filters.sortOrder = sortOrder as AnomalyFilterState['sortOrder'];
  const page = params.get('page');
  if (page) filters.page = parseInt(page, 10);
  return filters;
}

/** Calculate trend direction and percentage */
export function calculateAnomalyTrend(
  current: number,
  previous: number,
): { direction: 'up' | 'down' | 'flat'; percentage: number } {
  if (previous === 0) {
    return current > 0 ? { direction: 'up', percentage: 100 } : { direction: 'flat', percentage: 0 };
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 1) return { direction: 'flat', percentage: 0 };
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: Math.abs(Math.round(change)),
  };
}

/** Group anomalies by module */
export function groupAnomaliesByModule(
  alerts: AnomalyAlert[],
): Record<HospitalModule, AnomalyAlert[]> {
  const groups: Record<HospitalModule, AnomalyAlert[]> = {
    staffing: [],
    'bed-allocation': [],
    'supply-chain': [],
    finance: [],
    'cross-module': [],
  };
  for (const alert of alerts) {
    groups[alert.module].push(alert);
  }
  return groups;
}

/** Sort anomalies by severity (critical first) */
export function sortAnomaliesBySeverity(alerts: AnomalyAlert[]): AnomalyAlert[] {
  return [...alerts].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** Filter anomalies based on filter state */
export function filterAnomalies(
  alerts: AnomalyAlert[],
  filters: AnomalyFilterState,
): AnomalyAlert[] {
  let result = [...alerts];

  if (filters.modules.length > 0) {
    result = result.filter((a) => filters.modules.includes(a.module));
  }
  if (filters.severities.length > 0) {
    result = result.filter((a) => filters.severities.includes(a.severity));
  }
  if (filters.statuses.length > 0) {
    result = result.filter((a) => filters.statuses.includes(a.status));
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.context.summary.toLowerCase().includes(q),
    );
  }
  if (filters.dateRange.start) {
    result = result.filter((a) => a.detectedAt >= filters.dateRange.start);
  }
  if (filters.dateRange.end) {
    result = result.filter((a) => a.detectedAt <= filters.dateRange.end);
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0;
    switch (filters.sortBy) {
      case 'detectedAt':
        cmp = a.detectedAt.localeCompare(b.detectedAt);
        break;
      case 'severity':
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        break;
      case 'module':
        cmp = a.module.localeCompare(b.module);
        break;
    }
    return filters.sortOrder === 'asc' ? cmp : -cmp;
  });

  return result;
}

/** Get date range string for a trend period */
export function getTrendPeriodDates(period: '7d' | '30d' | '90d' | '1y'): { start: string; end: string } {
  const end = new Date();
  const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const start = subDays(end, daysMap[period]);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

/** Format financial impact for display */
export function formatFinancialImpact(amount: number | null): string {
  if (amount === null) return 'N/A';
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

/** Get total count of active anomalies from trend data */
export function sumTrendTotals(data: AnomalyTrendDataPoint[]): number {
  return data.reduce((sum, d) => sum + d.total, 0);
}
