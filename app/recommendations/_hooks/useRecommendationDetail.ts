import { useState, useEffect } from 'react';
import type {
  Recommendation,
  SimulationPreviewData,
} from '@/lib/recommendations/recommendations.types';
import { fetchRecommendationDetail } from '@/lib/recommendations/recommendations.service';

export function useRecommendationDetail(recommendationId: string | null) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [relatedRecommendations, setRelatedRecommendations] = useState<Recommendation[]>([]);
  const [simulationPreview, setSimulationPreview] = useState<SimulationPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recommendationId) {
      setRecommendation(null);
      setRelatedRecommendations([]);
      setSimulationPreview(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchRecommendationDetail(recommendationId)
      .then((result) => {
        if (cancelled) return;
        setRecommendation(result.recommendation);
        setRelatedRecommendations(result.relatedRecommendations);
        setSimulationPreview(result.simulationPreview);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load recommendation detail');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [recommendationId]);

  return { recommendation, relatedRecommendations, simulationPreview, isLoading, error };
}
