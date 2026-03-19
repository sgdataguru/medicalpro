'use client';

import { useState, useCallback } from 'react';
import {
  acknowledgeAnomaly,
  investigateAnomaly,
  dismissAnomaly,
  addInvestigationNote,
} from '@/lib/anomaly/anomaly.service';
import type { AnomalyAlert, InvestigationNote } from '@/lib/anomaly/anomaly.types';

interface UseAnomalyActionsOptions {
  onUpdate: (update: Partial<AnomalyAlert> & { id: string }) => void;
  onNoteAdded?: (note: InvestigationNote) => void;
}

export function useAnomalyActions({ onUpdate, onNoteAdded }: UseAnomalyActionsOptions) {
  const [isPending, setIsPending] = useState(false);

  const acknowledge = useCallback(
    async (anomalyId: string) => {
      setIsPending(true);
      try {
        const updated = await acknowledgeAnomaly(anomalyId);
        onUpdate({ id: anomalyId, status: updated.status, acknowledgedAt: updated.acknowledgedAt });
      } finally {
        setIsPending(false);
      }
    },
    [onUpdate],
  );

  const investigate = useCallback(
    async (anomalyId: string) => {
      setIsPending(true);
      try {
        const updated = await investigateAnomaly(anomalyId);
        onUpdate({ id: anomalyId, status: updated.status, acknowledgedAt: updated.acknowledgedAt });
      } finally {
        setIsPending(false);
      }
    },
    [onUpdate],
  );

  const dismiss = useCallback(
    async (anomalyId: string, reason: string, suppressSimilar: boolean) => {
      setIsPending(true);
      try {
        const updated = await dismissAnomaly(anomalyId, reason, suppressSimilar);
        onUpdate({ id: anomalyId, status: updated.status });
      } finally {
        setIsPending(false);
      }
    },
    [onUpdate],
  );

  const addNote = useCallback(
    async (anomalyId: string, content: string) => {
      const note = await addInvestigationNote(anomalyId, content);
      onNoteAdded?.(note);
    },
    [onNoteAdded],
  );

  return { acknowledge, investigate, dismiss, addNote, isPending };
}
