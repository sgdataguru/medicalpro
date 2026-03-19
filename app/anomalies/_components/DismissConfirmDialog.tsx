'use client';

import { useState } from 'react';
import { DISMISS_REASON_MIN_LENGTH } from '@/lib/anomaly/anomaly.constants';

interface DismissConfirmDialogProps {
  anomalyId: string;
  onConfirm: (reason: string, suppressSimilar: boolean) => void;
  onCancel: () => void;
}

export default function DismissConfirmDialog({
  anomalyId,
  onConfirm,
  onCancel,
}: DismissConfirmDialogProps) {
  const [reason, setReason] = useState('');
  const [suppressSimilar, setSuppressSimilar] = useState(false);
  const isValid = reason.length >= DISMISS_REASON_MIN_LENGTH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/15 rounded-xl p-6 shadow-2xl">
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">
          Dismiss Anomaly
        </h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Dismissing {anomalyId}. Please provide a reason (min {DISMISS_REASON_MIN_LENGTH} characters).
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this anomaly is being dismissed..."
          rows={4}
          className="w-full bg-surface-container border border-outline-variant/15 text-on-surface-variant text-sm rounded-lg px-3 py-2 placeholder-on-primary-container focus:ring-2 focus:ring-secondary focus:border-secondary outline-none resize-none mb-3"
        />
        {reason.length > 0 && !isValid && (
          <p className="text-xs text-red-400 mb-3">
            {DISMISS_REASON_MIN_LENGTH - reason.length} more characters required
          </p>
        )}

        <label className="flex items-center gap-2 text-sm text-on-surface-variant mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={suppressSimilar}
            onChange={(e) => setSuppressSimilar(e.target.checked)}
            className="rounded border-outline-variant bg-surface-container text-secondary focus:ring-secondary"
          />
          Suppress similar anomalies for 24 hours
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason, suppressSimilar)}
            disabled={!isValid}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Dismiss Anomaly
          </button>
        </div>
      </div>
    </div>
  );
}
