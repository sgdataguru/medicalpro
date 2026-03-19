import { useCallback, useMemo } from 'react';
import type {
  RecommendationFilterState,
} from '@/lib/recommendations/recommendations.types';

export function useRecommendationFilters(
  filters: RecommendationFilterState,
  onChange: (partial: Partial<RecommendationFilterState>) => void,
) {
  const setFilter = useCallback(
    <K extends keyof RecommendationFilterState>(key: K, value: RecommendationFilterState[K]) => {
      onChange({ [key]: value });
    },
    [onChange],
  );

  const clearFilters = useCallback(() => {
    onChange({
      priority: [],
      modules: [],
      status: ['active'],
      dateRange: null,
      sortBy: 'priority',
      sortOrder: 'desc',
    });
  }, [onChange]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priority.length > 0) count++;
    if (filters.modules.length > 0) count++;
    if (filters.status.length > 0 && !(filters.status.length === 1 && filters.status[0] === 'active')) count++;
    if (filters.dateRange) count++;
    if (filters.sortBy !== 'priority') count++;
    return count;
  }, [filters]);

  return { setFilter, clearFilters, activeFilterCount };
}
