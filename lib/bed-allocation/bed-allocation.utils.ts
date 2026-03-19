import type { DepartmentOccupancy, ReallocationRecommendation, BedAllocationFilters, OccupancyTrend } from './bed-allocation.types';
import { OCCUPANCY_THRESHOLDS } from './bed-allocation.constants';

export function formatOccupancyRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function getOccupancyColor(rate: number): string {
  if (rate >= OCCUPANCY_THRESHOLDS.OVER_CAPACITY) return 'text-red-600';
  if (rate >= OCCUPANCY_THRESHOLDS.WARNING) return 'text-yellow-600';
  if (rate >= OCCUPANCY_THRESHOLDS.TARGET_LOW) return 'text-emerald-600';
  return 'text-blue-600';
}

export function getOccupancyBgColor(rate: number): string {
  if (rate >= OCCUPANCY_THRESHOLDS.OVER_CAPACITY) return 'bg-red-500';
  if (rate >= OCCUPANCY_THRESHOLDS.WARNING) return 'bg-yellow-500';
  if (rate >= OCCUPANCY_THRESHOLDS.TARGET_LOW) return 'bg-emerald-500';
  return 'bg-blue-500';
}

export function getOccupancyBarColor(rate: number): string {
  if (rate >= OCCUPANCY_THRESHOLDS.OVER_CAPACITY) return 'bg-red-400';
  if (rate >= OCCUPANCY_THRESHOLDS.WARNING) return 'bg-yellow-400';
  if (rate >= OCCUPANCY_THRESHOLDS.TARGET_LOW) return 'bg-emerald-400';
  return 'bg-blue-400';
}

export function getTrendIcon(trend: OccupancyTrend): string {
  switch (trend) {
    case 'RISING': return '↑';
    case 'DECLINING': return '↓';
    case 'STABLE': return '→';
  }
}

export function getTrendColor(trend: OccupancyTrend): string {
  switch (trend) {
    case 'RISING': return 'text-red-500';
    case 'DECLINING': return 'text-emerald-500';
    case 'STABLE': return 'text-gray-500';
  }
}

export function formatRevenue(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

export function formatRevenueWithSign(amount: number): string {
  const formatted = formatRevenue(Math.abs(amount));
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function calculateRevenuePerBedDay(monthlyRevenue: number, occupiedBeds: number, daysInMonth: number = 30): number {
  if (occupiedBeds === 0 || daysInMonth === 0) return 0;
  return monthlyRevenue / (occupiedBeds * daysInMonth);
}

export function sortRecommendationsByImpact(recs: ReallocationRecommendation[]): ReallocationRecommendation[] {
  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  return [...recs].sort((a, b) => {
    const pDiff = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
    if (pDiff !== 0) return pDiff;
    const revDiff = b.revenueImpact.monthly - a.revenueImpact.monthly;
    if (revDiff !== 0) return revDiff;
    return b.waitTimeImpact.reductionPercentage - a.waitTimeImpact.reductionPercentage;
  });
}

export function buildOccupancyQueryParams(filters: BedAllocationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.departmentIds.length > 0) params.set('departments', filters.departmentIds.join(','));
  if (filters.wardIds.length > 0) params.set('wards', filters.wardIds.join(','));
  params.set('period', filters.timePeriod);
  return params;
}

export function calculateOccupancyTotals(departments: DepartmentOccupancy[]) {
  const totalBeds = departments.reduce((s, d) => s + d.totalBeds, 0);
  const occupiedBeds = departments.reduce((s, d) => s + d.occupiedBeds, 0);
  const availableBeds = departments.reduce((s, d) => s + d.availableBeds, 0);
  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    overallOccupancyRate: totalBeds === 0 ? 0 : occupiedBeds / totalBeds,
  };
}

export function formatHoursUntil(hours: number): string {
  if (hours < 1) return '< 1h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const h = Math.round(hours % 24);
  return h > 0 ? `${days}d ${h}h` : `${days}d`;
}

export function formatPercentageChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
