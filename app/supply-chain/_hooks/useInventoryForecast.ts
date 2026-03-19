'use client';

import { useState, useCallback } from 'react';
import type {
  ForecastJobStatus,
  SupplyCategory,
} from '@/lib/supply-chain/supply-chain.types';
import { runDemandForecast } from '@/lib/supply-chain/supply-chain.service';

interface UseInventoryForecastOptions {
  onComplete?: (forecast: Awaited<ReturnType<typeof runDemandForecast>>) => void;
}

export function useInventoryForecast(options?: UseInventoryForecastOptions) {
  const [status, setStatus] = useState<ForecastJobStatus>('idle');
  const [forecast, setForecast] = useState<Awaited<
    ReturnType<typeof runDemandForecast>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runForecast = useCallback(
    async (categories: SupplyCategory[], horizonDays: number) => {
      try {
        setError(null);
        setStatus('queued');

        // Brief queued state before processing begins
        await new Promise((resolve) => setTimeout(resolve, 100));
        setStatus('processing');

        const result = await runDemandForecast(categories, horizonDays);

        setForecast(result);
        setStatus('completed');
        options?.onComplete?.(result);

        return result;
      } catch (err) {
        setStatus('failed');
        setError(
          err instanceof Error ? err.message : 'Forecast generation failed',
        );
        return null;
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setForecast(null);
    setError(null);
  }, []);

  return { status, forecast, error, runForecast, reset };
}
