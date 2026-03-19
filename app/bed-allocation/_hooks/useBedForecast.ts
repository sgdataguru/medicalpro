'use client';

import { useState, useCallback } from 'react';
import type { BedDemandForecast, ForecastJobStatus } from '@/lib/bed-allocation/bed-allocation.types';
import { runForecast as runForecastService } from '@/lib/bed-allocation/bed-allocation.service';

interface UseBedForecastProps {
  onComplete: (forecast: BedDemandForecast) => void;
}

export function useBedForecast({ onComplete }: UseBedForecastProps) {
  const [status, setStatus] = useState<ForecastJobStatus>('idle');

  const runForecast = useCallback(
    async (departmentIds: string[], horizonDays: number) => {
      setStatus('processing');
      try {
        const result = await runForecastService(departmentIds, horizonDays);
        onComplete(result);
        setStatus('completed');
      } catch {
        setStatus('failed');
      }
    },
    [onComplete],
  );

  return { runForecast, status };
}
