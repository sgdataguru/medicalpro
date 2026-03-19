'use client';

import { useMemo, useCallback } from 'react';
import type { AnomalyFilterState } from '@/lib/anomaly/anomaly.types';
import { DEFAULT_FILTERS } from '@/lib/anomaly/anomaly.constants';

export function useAnomalyFilters(
  filters: AnomalyFilterState,
  onChange: (partial: Partial<AnomalyFilterState>) => void,
) {
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.modules.length > 0) count++;
    if (filters.severities.length > 0) count++;
    if (filters.statuses.length > 0 && JSON.stringify(filters.statuses) !== JSON.stringify(DEFAULT_FILTERS.statuses)) count++;
    if (filters.searchQuery) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  const resetFilters = useCallback(() => {
    onChange({
      modules: [],
      severities: [],
      statuses: DEFAULT_FILTERS.statuses,
      searchQuery: '',
      dateRange: { start: '', end: '' },
      page: 1,
    });
  }, [onChange]);

  return {
    activeFilterCount,
    resetFilters,
  };
}
