/**
 * @file useScenarioComparison.ts
 * @description Hook for managing side-by-side scenario comparison state.
 * @module app/simulations/_hooks
 */

'use client';

import { useState, useCallback } from 'react';
import type { Scenario } from '@/lib/simulation/simulation.types';
import { fetchScenarioDetail } from '@/lib/simulation/simulation.service';

export function useScenarioComparison() {
  const [comparisonScenarios, setComparisonScenarios] = useState<Scenario[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const addScenario = useCallback(async (id: string) => {
    try {
      const scenario = await fetchScenarioDetail(id);
      setComparisonScenarios((prev) => {
        if (prev.some((s) => s.id === id)) return prev;
        return [...prev, scenario];
      });
    } catch {
      // silently skip if scenario cannot be loaded
    }
  }, []);

  const removeScenario = useCallback((id: string) => {
    setComparisonScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonScenarios([]);
    setIsComparing(false);
  }, []);

  return { comparisonScenarios, addScenario, removeScenario, clearComparison, isComparing, setIsComparing };
}
