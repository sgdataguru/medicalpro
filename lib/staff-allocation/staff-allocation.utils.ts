import type { StaffingRecommendation, DepartmentStaffingSummary, StaffAllocationFilters } from './staff-allocation.types';
import { PRIORITY_ORDER } from './staff-allocation.constants';

export function formatStaffingRatio(ratio: number): string {
  if (ratio <= 0 || !isFinite(ratio)) return 'N/A';
  return `1:${Math.round(ratio)}`;
}

export function calculateCoveragePercentage(assigned: number, required: number): number {
  if (required === 0) return 100;
  return Math.round((assigned / required) * 100 * 10) / 10;
}

export function getHeatMapColor(assigned: number, required: number): string {
  const ratio = required === 0 ? 1 : assigned / required;
  if (ratio >= 0.95) return 'bg-emerald-100 text-emerald-800';
  if (ratio >= 0.85) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

export function getHeatMapCellClass(assigned: number, required: number): string {
  const ratio = required === 0 ? 1 : assigned / required;
  if (ratio >= 0.95) return 'border-emerald-300 bg-emerald-50';
  if (ratio >= 0.85) return 'border-yellow-300 bg-yellow-50';
  return 'border-red-300 bg-red-50';
}

export function formatOvertimeCost(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function sortRecommendations(recommendations: StaffingRecommendation[]): StaffingRecommendation[] {
  return [...recommendations].sort((a, b) => {
    const priorityDiff = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
    if (priorityDiff !== 0) return priorityDiff;
    const savingsDiff = b.projectedOvertimeSavings - a.projectedOvertimeSavings;
    if (savingsDiff !== 0) return savingsDiff;
    return a.departmentName.localeCompare(b.departmentName);
  });
}

export function buildStaffingQueryParams(filters: StaffAllocationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.departmentIds.length > 0) params.set('departments', filters.departmentIds.join(','));
  if (filters.roles.length > 0) params.set('roles', filters.roles.join(','));
  if (filters.shifts.length > 0) params.set('shifts', filters.shifts.join(','));
  if (filters.dateRange.start) params.set('startDate', filters.dateRange.start);
  if (filters.dateRange.end) params.set('endDate', filters.dateRange.end);
  return params;
}

export function calculateTotals(departments: DepartmentStaffingSummary[]) {
  const totalOnDuty = departments.reduce((sum, d) => sum + d.totalOnDuty, 0);
  const totalRequired = departments.reduce((sum, d) => sum + d.totalRequired, 0);
  return {
    totalOnDuty,
    totalRequired,
    overallCoverage: calculateCoveragePercentage(totalOnDuty, totalRequired),
    departmentCount: departments.length,
  };
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatHoursUntil(hours: number): string {
  if (hours < 1) return 'Less than 1h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
}
