'use client';

import { useState, useCallback } from 'react';
import type { ExpirationAlert } from '@/lib/supply-chain/supply-chain.types';
import {
  fetchExpirationAlerts,
  takeExpirationAction,
} from '@/lib/supply-chain/supply-chain.service';

interface ExpirationSummary {
  total: number;
  bySeverity: {
    CRITICAL: number;
    WARNING: number;
    INFO: number;
  };
  totalValueAtRisk: number;
  totalUnitsAtRisk: number;
}

export function useExpirationTracking() {
  const [alerts, setAlerts] = useState<ExpirationAlert[]>([]);
  const [summary, setSummary] = useState<ExpirationSummary | null>(null);
  const [activeWindow, setActiveWindow] = useState<number>(90);

  const loadAlerts = useCallback(async (windowDays?: number) => {
    const window = windowDays ?? activeWindow;
    const result = await fetchExpirationAlerts(window);
    setAlerts(result.alerts);
    setSummary(result.summary);
    if (windowDays !== undefined) {
      setActiveWindow(windowDays);
    }
    return result;
  }, [activeWindow]);

  const takeAction = useCallback(
    async (
      alertId: string,
      action: Parameters<typeof takeExpirationAction>[1],
      targetDepartmentId?: string,
    ) => {
      const updated = await takeExpirationAction(
        alertId,
        action,
        targetDepartmentId,
      );
      setAlerts((prev) =>
        prev.map((a) => (a.alertId === alertId ? updated : a)),
      );
      return updated;
    },
    [],
  );

  return {
    alerts,
    summary,
    activeWindow,
    setActiveWindow,
    loadAlerts,
    takeAction,
  };
}
