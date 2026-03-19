'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import type { FinancialFilters } from '@/lib/revenue-cost/revenue-cost.types';
import { DEFAULT_FILTERS } from '@/lib/revenue-cost/revenue-cost.constants';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseFiltersFromParams(
  params: URLSearchParams,
): FinancialFilters {
  const timePeriod =
    (params.get('timePeriod') as FinancialFilters['timePeriod']) ||
    DEFAULT_FILTERS.timePeriod;

  const comparisonBase =
    (params.get('comparisonBase') as FinancialFilters['comparisonBase']) ||
    DEFAULT_FILTERS.comparisonBase;

  const startDate = params.get('startDate') || DEFAULT_FILTERS.dateRange.start;
  const endDate = params.get('endDate') || DEFAULT_FILTERS.dateRange.end;

  const departmentIds = params.get('departmentIds')
    ? params.get('departmentIds')!.split(',').filter(Boolean)
    : DEFAULT_FILTERS.departmentIds;

  const costCategories = params.get('costCategories')
    ? (params
        .get('costCategories')!
        .split(',')
        .filter(Boolean) as FinancialFilters['costCategories'])
    : DEFAULT_FILTERS.costCategories;

  const varianceThreshold = params.get('varianceThreshold')
    ? Number(params.get('varianceThreshold'))
    : DEFAULT_FILTERS.varianceThreshold;

  return {
    timePeriod,
    dateRange: { start: startDate, end: endDate },
    comparisonBase,
    departmentIds,
    costCategories,
    varianceThreshold,
  };
}

function filtersToParams(filters: FinancialFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.timePeriod !== DEFAULT_FILTERS.timePeriod) {
    params.set('timePeriod', filters.timePeriod);
  }

  if (filters.comparisonBase !== DEFAULT_FILTERS.comparisonBase) {
    params.set('comparisonBase', filters.comparisonBase);
  }

  if (filters.dateRange.start) {
    params.set('startDate', filters.dateRange.start);
  }

  if (filters.dateRange.end) {
    params.set('endDate', filters.dateRange.end);
  }

  if (filters.departmentIds.length > 0) {
    params.set('departmentIds', filters.departmentIds.join(','));
  }

  if (filters.costCategories.length > 0) {
    params.set('costCategories', filters.costCategories.join(','));
  }

  if (filters.varianceThreshold !== DEFAULT_FILTERS.varianceThreshold) {
    params.set('varianceThreshold', String(filters.varianceThreshold));
  }

  return params;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useFinancialFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams],
  );

  const updateFilters = useCallback(
    (partial: Partial<FinancialFilters>) => {
      const merged: FinancialFilters = { ...filters, ...partial };
      const params = filtersToParams(merged);
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [filters, router, pathname],
  );

  const resetFilters = useCallback(() => {
    const params = filtersToParams(DEFAULT_FILTERS);
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }, [router, pathname]);

  return { filters, updateFilters, resetFilters } as const;
}
