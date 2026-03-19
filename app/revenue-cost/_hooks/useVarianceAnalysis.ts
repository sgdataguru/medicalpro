'use client';

import { useState, useCallback } from 'react';

import type {
  VarianceRecord,
  FinancialFilters,
} from '@/lib/revenue-cost/revenue-cost.types';
import { fetchVariances } from '@/lib/revenue-cost/revenue-cost.service';

// ─── Types ──────────────────────────────────────────────────────────────────

interface VarianceSummary {
  totalCount: number;
  criticalCount: number;
  significantCount: number;
  moderateCount: number;
  minorCount: number;
  favorableCount: number;
  unfavorableCount: number;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useVarianceAnalysis() {
  const [variances, setVariances] = useState<VarianceRecord[]>([]);
  const [summary, setSummary] = useState<VarianceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 15,
    totalPages: 0,
    totalItems: 0,
  });

  const loadVariances = useCallback(
    async (
      filters?: Partial<FinancialFilters>,
      page?: number,
      pageSize?: number,
    ) => {
      setLoading(true);

      try {
        const result = await fetchVariances(
          filters,
          page ?? pagination.page,
          pageSize ?? pagination.pageSize,
        );

        setVariances(result.variances);
        setSummary(result.summary);
        setPagination(result.pagination);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.pageSize],
  );

  return { variances, summary, loading, pagination, loadVariances } as const;
}
