'use client';

import { useState, useCallback, useRef } from 'react';

import type {
  AnalysisJobStatus,
  FinancialDriverAnalysis,
  FinancialFilters,
  FinancialNarrative,
} from '@/lib/revenue-cost/revenue-cost.types';
import {
  runFinancialAnalysis,
  fetchAnalysisResult,
} from '@/lib/revenue-cost/revenue-cost.service';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UseFinancialAnalysisOptions {
  onComplete?: (
    drivers: FinancialDriverAnalysis,
    narrative: FinancialNarrative,
  ) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 2_000;

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useFinancialAnalysis(options?: UseFinancialAnalysisOptions) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<AnalysisJobStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current !== null) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const runAnalysis = useCallback(
    async (filters?: Partial<FinancialFilters>) => {
      // Clean up any previous polling
      stopPolling();
      setError(null);

      try {
        const result = await runFinancialAnalysis(filters);
        setJobId(result.jobId);
        setStatus('queued');

        // Start polling for results
        pollingRef.current = setInterval(async () => {
          try {
            const pollResult = await fetchAnalysisResult(result.jobId);
            setStatus(pollResult.status);

            if (pollResult.status === 'completed') {
              stopPolling();

              if (pollResult.drivers && pollResult.narrative) {
                options?.onComplete?.(pollResult.drivers, pollResult.narrative);
              }
            }

            if (pollResult.status === 'failed') {
              stopPolling();
              setError('Analysis job failed. Please try again.');
            }
          } catch {
            stopPolling();
            setStatus('failed');
            setError('Failed to fetch analysis result.');
          }
        }, POLL_INTERVAL_MS);
      } catch {
        setStatus('failed');
        setError('Failed to start analysis job.');
      }
    },
    [options, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setJobId(null);
    setStatus('idle');
    setError(null);
  }, [stopPolling]);

  return { status, jobId, error, runAnalysis, reset } as const;
}
