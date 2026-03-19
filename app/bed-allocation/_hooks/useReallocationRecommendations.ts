'use client';

import { useState, useCallback } from 'react';
import type { ReallocationRecommendation } from '@/lib/bed-allocation/bed-allocation.types';
import {
  fetchRecommendations,
  updateRecommendation,
} from '@/lib/bed-allocation/bed-allocation.service';

export function useReallocationRecommendations() {
  const [recommendations, setRecommendations] = useState<ReallocationRecommendation[]>([]);

  const loadRecommendations = useCallback(async () => {
    const result = await fetchRecommendations();
    setRecommendations(result.recommendations);
  }, []);

  const approveRecommendation = useCallback(async (id: string, note?: string) => {
    const updated = await updateRecommendation(id, 'APPROVED', note);
    setRecommendations((prev) =>
      prev.map((rec) => (rec.recommendationId === id ? { ...rec, status: updated.status, approvalNote: note } : rec)),
    );
  }, []);

  const rejectRecommendation = useCallback(async (id: string, reason?: string) => {
    const updated = await updateRecommendation(id, 'REJECTED', reason);
    setRecommendations((prev) =>
      prev.map((rec) => (rec.recommendationId === id ? { ...rec, status: updated.status, rejectionReason: reason } : rec)),
    );
  }, []);

  return { recommendations, loadRecommendations, approveRecommendation, rejectRecommendation };
}
