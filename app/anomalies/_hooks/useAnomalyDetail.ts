'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnomalyAlert, InvestigationNote } from '@/lib/anomaly/anomaly.types';
import { fetchAnomalyDetail } from '@/lib/anomaly/anomaly.service';

export function useAnomalyDetail(anomalyId: string | null) {
  const [anomaly, setAnomaly] = useState<AnomalyAlert | null>(null);
  const [relatedAnomalies, setRelatedAnomalies] = useState<AnomalyAlert[]>([]);
  const [notes, setNotes] = useState<InvestigationNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!anomalyId) {
      setAnomaly(null);
      setRelatedAnomalies([]);
      setNotes([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAnomalyDetail(anomalyId)
      .then((result) => {
        if (cancelled) return;
        setAnomaly(result.anomaly);
        setRelatedAnomalies(result.relatedAnomalies);
        setNotes(result.notes);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load anomaly');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [anomalyId]);

  const addNote = useCallback((note: InvestigationNote) => {
    setNotes((prev) => [...prev, note]);
  }, []);

  return { anomaly, relatedAnomalies, notes, isLoading, error, addNote };
}
