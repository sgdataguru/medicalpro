'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type {
  SupplyChainFilters,
  SupplyCategory,
  RiskLevel,
  InventorySortField,
} from '@/lib/supply-chain/supply-chain.types';
import { DEFAULT_FILTERS } from '@/lib/supply-chain/supply-chain.constants';

const DEBOUNCE_MS = 300;
const SEARCH_DEBOUNCE_MS = 400;

function parseArrayParam(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter(Boolean);
}

function filtersToParams(filters: SupplyChainFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.categories.length > 0) {
    params.set('categories', filters.categories.join(','));
  }
  if (filters.departmentIds.length > 0) {
    params.set('departments', filters.departmentIds.join(','));
  }
  if (filters.supplierIds.length > 0) {
    params.set('suppliers', filters.supplierIds.join(','));
  }
  if (filters.riskLevels.length > 0) {
    params.set('risk', filters.riskLevels.join(','));
  }
  if (filters.searchQuery) {
    params.set('q', filters.searchQuery);
  }
  if (filters.sortBy !== DEFAULT_FILTERS.sortBy) {
    params.set('sort', filters.sortBy);
  }
  if (filters.sortDirection !== DEFAULT_FILTERS.sortDirection) {
    params.set('dir', filters.sortDirection);
  }

  return params;
}

function paramsToFilters(params: URLSearchParams): SupplyChainFilters {
  return {
    categories: parseArrayParam(params.get('categories')) as SupplyCategory[],
    departmentIds: parseArrayParam(params.get('departments')),
    supplierIds: parseArrayParam(params.get('suppliers')),
    riskLevels: parseArrayParam(params.get('risk')) as RiskLevel[],
    searchQuery: params.get('q') ?? '',
    sortBy: (params.get('sort') as InventorySortField) ?? DEFAULT_FILTERS.sortBy,
    sortDirection:
      (params.get('dir') as 'asc' | 'desc') ?? DEFAULT_FILTERS.sortDirection,
  };
}

export function useSupplyFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Derive initial filters from URL search params
  const initialFilters = useMemo(
    () => paramsToFilters(searchParams),
    // Only compute on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [filters, setFilters] = useState<SupplyChainFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState<string>(
    initialFilters.searchQuery,
  );

  // Refs for debounce timers
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync filter changes to URL (debounced)
  useEffect(() => {
    if (filterTimerRef.current) {
      clearTimeout(filterTimerRef.current);
    }

    filterTimerRef.current = setTimeout(() => {
      const params = filtersToParams(filters);
      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, DEBOUNCE_MS);

    return () => {
      if (filterTimerRef.current) {
        clearTimeout(filterTimerRef.current);
      }
    };
  }, [filters, pathname, router]);

  // Debounce search query into filters
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setFilters((prev) => {
        if (prev.searchQuery === searchQuery) return prev;
        return { ...prev, searchQuery };
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery]);

  const updateFilters = useCallback(
    (updates: Partial<SupplyChainFilters>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  return {
    filters,
    updateFilters,
    searchQuery,
    setSearchQuery,
    resetFilters,
  };
}
