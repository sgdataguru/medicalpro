'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { BedAllocationFilters, TimePeriod } from '@/lib/bed-allocation/bed-allocation.types';
import { DEFAULT_FILTERS } from '@/lib/bed-allocation/bed-allocation.constants';

interface UseBedFiltersProps {
  onFilterChange: (filters: BedAllocationFilters) => void;
}

export function useBedFilters({ onFilterChange }: UseBedFiltersProps) {
  let searchParams: ReturnType<typeof useSearchParams> | null = null;
  try {
    searchParams = useSearchParams();
  } catch {
    // Server rendering — searchParams unavailable
  }

  const [filters, setFilters] = useState<BedAllocationFilters>(() => {
    if (!searchParams) return DEFAULT_FILTERS;

    const departments = searchParams.get('departments');
    const period = searchParams.get('period') as TimePeriod | null;

    return {
      departmentIds: departments ? departments.split(',') : DEFAULT_FILTERS.departmentIds,
      wardIds: DEFAULT_FILTERS.wardIds,
      timePeriod: period ?? DEFAULT_FILTERS.timePeriod,
    };
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFilterChange = useCallback(
    (nextFilters: BedAllocationFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        onFilterChange(nextFilters);

        // Sync URL params
        try {
          const params = new URLSearchParams(window.location.search);
          if (nextFilters.departmentIds.length > 0) {
            params.set('departments', nextFilters.departmentIds.join(','));
          } else {
            params.delete('departments');
          }
          params.set('period', nextFilters.timePeriod);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState(null, '', newUrl);
        } catch {
          // URL update failed (e.g. non-browser environment)
        }
      }, 300);
    },
    [onFilterChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setDepartmentIds = useCallback(
    (departmentIds: string[]) => {
      setFilters((prev) => {
        const next = { ...prev, departmentIds };
        scheduleFilterChange(next);
        return next;
      });
    },
    [scheduleFilterChange],
  );

  const setTimePeriod = useCallback(
    (timePeriod: TimePeriod) => {
      setFilters((prev) => {
        const next = { ...prev, timePeriod };
        scheduleFilterChange(next);
        return next;
      });
    },
    [scheduleFilterChange],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    scheduleFilterChange(DEFAULT_FILTERS);
  }, [scheduleFilterChange]);

  return { filters, setDepartmentIds, setTimePeriod, resetFilters };
}
