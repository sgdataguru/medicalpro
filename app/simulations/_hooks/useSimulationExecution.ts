/**
 * @file useSimulationExecution.ts
 * @description Hook for managing simulation execution lifecycle, progress tracking, and cancellation.
 * @module app/simulations/_hooks
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  SimulationVariable,
  SimulationResults,
  SimulationProgress,
} from '@/lib/simulation/simulation.types';
import * as service from '@/lib/simulation/simulation.service';

interface UseSimulationExecutionOptions {
  onProgress?: (progress: SimulationProgress) => void;
  onComplete?: (results: SimulationResults) => void;
  onError?: (error: string) => void;
}

export function useSimulationExecution(options: UseSimulationExecutionOptions = {}) {
  const [isRunning, setIsRunning] = useState(false);
  const cancelledRef = useRef(false);

  const run = useCallback(
    async (scenarioId: string, variables: SimulationVariable[]) => {
      setIsRunning(true);
      cancelledRef.current = false;

      try {
        // Run progress simulation in parallel with actual computation
        const progressPromise = service.simulateProgress(scenarioId, (progress) => {
          if (!cancelledRef.current) {
            options.onProgress?.(progress);
          }
        });

        const [results] = await Promise.all([
          service.runSimulation(scenarioId, variables),
          progressPromise,
        ]);

        if (!cancelledRef.current) {
          options.onComplete?.(results);
        }
      } catch (err) {
        if (!cancelledRef.current) {
          options.onError?.(err instanceof Error ? err.message : 'Simulation failed');
        }
      } finally {
        setIsRunning(false);
      }
    },
    [options],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setIsRunning(false);
  }, []);

  return { run, cancel, isRunning };
}
