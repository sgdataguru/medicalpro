'use client';

import { useCallback, useState } from 'react';
import type {
  StaffAllocationReducerAction,
  StaffingRecommendation,
} from '@/lib/staff-allocation/staff-allocation.types';
import { updateRecommendation } from '@/lib/staff-allocation/staff-allocation.service';
import { sortRecommendations } from '@/lib/staff-allocation/staff-allocation.utils';

interface UseRecommendationsOptions {
  dispatch: React.Dispatch<StaffAllocationReducerAction>;
}

export function useRecommendations({ dispatch }: UseRecommendationsOptions) {
  const [isPending, setIsPending] = useState(false);

  const acceptRecommendation = useCallback(async (id: string) => {
    setIsPending(true);
    try {
      const updated = await updateRecommendation(id, 'ACCEPTED');
      dispatch({ type: 'UPDATE_RECOMMENDATION', payload: updated });
    } finally {
      setIsPending(false);
    }
  }, [dispatch]);

  const rejectRecommendation = useCallback(async (id: string, reason: string) => {
    setIsPending(true);
    try {
      const updated = await updateRecommendation(id, 'REJECTED', reason);
      dispatch({ type: 'UPDATE_RECOMMENDATION', payload: updated });
    } finally {
      setIsPending(false);
    }
  }, [dispatch]);

  const getSortedRecommendations = useCallback((recs: StaffingRecommendation[]) => {
    return sortRecommendations(recs);
  }, []);

  return { acceptRecommendation, rejectRecommendation, getSortedRecommendations, isPending };
}
