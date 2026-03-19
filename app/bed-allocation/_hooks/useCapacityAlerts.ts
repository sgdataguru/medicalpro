'use client';

import { useState, useCallback } from 'react';
import type { CapacityAlert } from '@/lib/bed-allocation/bed-allocation.types';
import {
  fetchCapacityAlerts,
  acknowledgeAlert as acknowledgeAlertService,
} from '@/lib/bed-allocation/bed-allocation.service';

export function useCapacityAlerts() {
  const [alerts, setAlerts] = useState<CapacityAlert[]>([]);

  const loadAlerts = useCallback(async () => {
    const result = await fetchCapacityAlerts();
    setAlerts(result.alerts);
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    const updated = await acknowledgeAlertService(id);
    setAlerts((prev) =>
      prev.map((alert) => (alert.alertId === id ? { ...alert, acknowledged: updated.acknowledged } : alert)),
    );
  }, []);

  return { alerts, loadAlerts, acknowledgeAlert };
}
