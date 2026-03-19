'use client';

import { useState, useCallback } from 'react';
import type { FeedbackRating } from '@/lib/analytics-query/analytics-query.types';
import { submitFeedback } from '@/lib/analytics-query/analytics-query.service';

interface FeedbackState {
  submittedRatings: Record<string, FeedbackRating>;
  isSubmitting: boolean;
  error: string | null;
}

export function useQueryFeedback() {
  const [state, setState] = useState<FeedbackState>({
    submittedRatings: {},
    isSubmitting: false,
    error: null,
  });

  const submitRating = useCallback(async (queryId: string, rating: FeedbackRating, comment?: string) => {
    setState((s) => ({ ...s, isSubmitting: true, error: null }));
    try {
      await submitFeedback(queryId, rating, comment);
      setState((s) => ({
        ...s,
        isSubmitting: false,
        submittedRatings: { ...s.submittedRatings, [queryId]: rating },
      }));
    } catch {
      setState((s) => ({ ...s, isSubmitting: false, error: 'Failed to submit feedback' }));
    }
  }, []);

  const hasRated = useCallback(
    (queryId: string) => queryId in state.submittedRatings,
    [state.submittedRatings],
  );

  const getRating = useCallback(
    (queryId: string) => state.submittedRatings[queryId] ?? null,
    [state.submittedRatings],
  );

  return {
    submittedRatings: state.submittedRatings,
    isSubmitting: state.isSubmitting,
    error: state.error,
    submitRating,
    hasRated,
    getRating,
  };
}
