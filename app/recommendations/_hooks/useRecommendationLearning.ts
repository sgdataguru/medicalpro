import { useState, useEffect } from 'react';
import { fetchLearningMetrics } from '@/lib/recommendations/recommendations.service';

export function useRecommendationLearning() {
  const [data, setData] = useState<{
    trends: { month: string; acceptanceRate: number; outcomeAccuracy: number }[];
    isImproving: boolean;
    improvementRate: number;
  }>({ trends: [], isImproving: false, improvementRate: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLearningMetrics()
      .then((result) => {
        if (mounted) setData(result);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { ...data, isLoading };
}
