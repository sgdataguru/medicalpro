import { useState, useEffect } from 'react';
import type { OutcomeSummary, OutcomeTrend } from '@/lib/recommendations/recommendations.types';
import { fetchOutcomeSummary } from '@/lib/recommendations/recommendations.service';

export function useRecommendationOutcomes() {
  const [summary, setSummary] = useState<OutcomeSummary | null>(null);
  const [trends, setTrends] = useState<OutcomeTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchOutcomeSummary()
      .then((result) => {
        if (cancelled) return;
        setSummary(result.summary);
        setTrends(result.trends);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load outcome data');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { summary, trends, isLoading, error };
}
