'use client';

import { useState, useCallback } from 'react';
import type { ProcurementRecommendation } from '@/lib/supply-chain/supply-chain.types';
import {
  fetchRecommendations,
  updateRecommendation,
} from '@/lib/supply-chain/supply-chain.service';

interface RecommendationSummary {
  total: number;
  byPriority: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  totalPotentialSavings: number;
  pendingCount: number;
}

export function useSupplyRecommendations() {
  const [recommendations, setRecommendations] = useState<
    ProcurementRecommendation[]
  >([]);
  const [summary, setSummary] = useState<RecommendationSummary | null>(null);

  const loadRecommendations = useCallback(async () => {
    const result = await fetchRecommendations();
    setRecommendations(result.recommendations);
    setSummary(result.summary);
    return result;
  }, []);

  const approveRecommendation = useCallback(
    async (id: string) => {
      const updated = await updateRecommendation(id, 'APPROVED');
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendationId === id ? updated : r)),
      );
      return updated;
    },
    [],
  );

  const adjustRecommendation = useCallback(
    async (id: string, quantity: number) => {
      const updated = await updateRecommendation(id, 'ADJUSTED' as Parameters<typeof updateRecommendation>[1], quantity);
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendationId === id ? updated : r)),
      );
      return updated;
    },
    [],
  );

  const dismissRecommendation = useCallback(
    async (id: string, reason: string) => {
      const updated = await updateRecommendation(
        id,
        'DISMISSED' as Parameters<typeof updateRecommendation>[1],
        undefined,
        reason,
      );
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendationId === id ? updated : r)),
      );
      return updated;
    },
    [],
  );

  return {
    recommendations,
    summary,
    loadRecommendations,
    approveRecommendation,
    adjustRecommendation,
    dismissRecommendation,
  };
}
