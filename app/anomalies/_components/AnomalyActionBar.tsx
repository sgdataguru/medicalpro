'use client';

import { useState } from 'react';
import type { AnomalyAlert } from '@/lib/anomaly/anomaly.types';

interface AnomalyActionBarProps {
  anomaly: AnomalyAlert;
  onAcknowledge: () => void;
  onInvestigate: () => void;
  onDismiss: () => void;
  isPending: boolean;
}

export default function AnomalyActionBar({
  anomaly,
  onAcknowledge,
  onInvestigate,
  onDismiss,
  isPending,
}: AnomalyActionBarProps) {
  const canAcknowledge = anomaly.status === 'active';
  const canInvestigate = anomaly.status === 'active' || anomaly.status === 'acknowledged';
  const canDismiss = anomaly.status !== 'dismissed' && anomaly.status !== 'resolved';

  return (
    <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/15">
      {canAcknowledge && (
        <button
          onClick={onAcknowledge}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Acknowledge
        </button>
      )}
      {canInvestigate && (
        <button
          onClick={onInvestigate}
          disabled={isPending}
          className="flex-1 px-4 py-2.5 bg-secondary-container text-white text-sm font-medium rounded-lg hover:bg-secondary-container/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Investigate
        </button>
      )}
      {canDismiss && (
        <button
          onClick={onDismiss}
          disabled={isPending}
          className="px-4 py-2.5 border border-outline-variant/15 text-on-surface-variant text-sm font-medium rounded-lg hover:text-red-400 hover:border-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
