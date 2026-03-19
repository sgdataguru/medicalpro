'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnomalyTrendDataPoint, TrendPeriod } from '@/lib/anomaly/anomaly.types';
import { fetchAnomalyTrends } from '@/lib/anomaly/anomaly.service';

export function useAnomalyTrends() {
  const [trendData, setTrendData] = useState<AnomalyTrendDataPoint[]>([]);
  const [period, setPeriod] = useState<TrendPeriod>('30d');
  const [isLoading, setIsLoading] = useState(false);

  const loadTrends = useCallback(async (p: TrendPeriod) => {
    setIsLoading(true);
    try {
      const data = await fetchAnomalyTrends(p);
      setTrendData(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrends(period);
  }, [period, loadTrends]);

  const changePeriod = useCallback((p: TrendPeriod) => {
    setPeriod(p);
  }, []);

  return { trendData, period, changePeriod, isLoading };
}
