import { useState, useCallback } from 'react';
import type { Recommendation, DismissReason } from '@/lib/recommendations/recommendations.types';
import {
  acceptRecommendation,
  deferRecommendation,
  dismissRecommendation,
} from '@/lib/recommendations/recommendations.service';

interface UseRecommendationActionsOptions {
  onUpdate: (update: Partial<Recommendation> & { id: string }) => void;
}

export function useRecommendationActions({ onUpdate }: UseRecommendationActionsOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = useCallback(
    async (id: string, notes: string, targetDate: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await acceptRecommendation(id, notes, targetDate);
        onUpdate({
          id,
          status: result.recommendation.status,
          action: result.action,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to accept recommendation');
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdate],
  );

  const defer = useCallback(
    async (id: string, deferUntilDate: string, reason?: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await deferRecommendation(id, deferUntilDate, reason);
        onUpdate({
          id,
          status: result.recommendation.status,
          action: result.action,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to defer recommendation');
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdate],
  );

  const dismiss = useCallback(
    async (id: string, reason: DismissReason, comment?: string) => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await dismissRecommendation(id, reason, comment);
        onUpdate({
          id,
          status: result.recommendation.status,
          action: result.action,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
      } finally {
        setIsProcessing(false);
      }
    },
    [onUpdate],
  );

  return { accept, defer, dismiss, isProcessing, error };
}
