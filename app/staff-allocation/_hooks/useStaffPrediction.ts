'use client';

import { useCallback, useRef } from 'react';
import type {
  StaffAllocationReducerAction,
  StaffingPrediction,
  PredictionJobStatus,
} from '@/lib/staff-allocation/staff-allocation.types';
import { runPrediction, fetchRecommendations } from '@/lib/staff-allocation/staff-allocation.service';

interface UseStaffPredictionOptions {
  dispatch: React.Dispatch<StaffAllocationReducerAction>;
}

export function useStaffPrediction({ dispatch }: UseStaffPredictionOptions) {
  const abortRef = useRef(false);

  const triggerPrediction = useCallback(async () => {
    abortRef.current = false;
    dispatch({ type: 'SET_PREDICTION_STATUS', payload: 'queued' });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate queued -> processing transition
      await new Promise((r) => setTimeout(r, 500));
      if (abortRef.current) return;
      dispatch({ type: 'SET_PREDICTION_STATUS', payload: 'processing' });

      const prediction = await runPrediction();
      if (abortRef.current) return;

      dispatch({ type: 'SET_PREDICTION', payload: prediction });
      dispatch({ type: 'SET_PREDICTION_STATUS', payload: 'completed' });

      // Auto-load recommendations after prediction completes
      const recsResult = await fetchRecommendations();
      if (!abortRef.current) {
        dispatch({ type: 'SET_RECOMMENDATIONS', payload: recsResult.recommendations });
      }
    } catch (err) {
      if (!abortRef.current) {
        dispatch({ type: 'SET_PREDICTION_STATUS', payload: 'failed' });
        dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Prediction failed' });
      }
    }
  }, [dispatch]);

  const cancelPrediction = useCallback(() => {
    abortRef.current = true;
    dispatch({ type: 'SET_PREDICTION_STATUS', payload: 'idle' });
  }, [dispatch]);

  return { triggerPrediction, cancelPrediction };
}
