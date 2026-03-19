'use client';

import { useState, useMemo } from 'react';
import { DEFER_PERIOD_OPTIONS } from '@/lib/recommendations/recommendations.constants';

interface DeferDialogProps {
  onConfirm: (deferUntilDate: string, reason?: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export default function DeferDialog({
  onConfirm,
  onCancel,
  isProcessing,
}: DeferDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');

  const isCustom = selectedPeriod === 0;

  const resolvedDate = useMemo(() => {
    if (isCustom) return customDate;
    return addDaysToToday(selectedPeriod);
  }, [selectedPeriod, customDate, isCustom]);

  const isConfirmDisabled = isProcessing || !resolvedDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        {/* Title */}
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          Defer Recommendation
        </h2>

        {/* Period Selection */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Defer Period
          </label>
          <div className="flex flex-col gap-2">
            {DEFER_PERIOD_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant px-3 py-2.5 transition-colors hover:bg-surface-container has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
              >
                <input
                  type="radio"
                  name="defer-period"
                  value={option.value}
                  checked={selectedPeriod === option.value}
                  onChange={() => setSelectedPeriod(option.value)}
                  className="h-4 w-4 accent-secondary"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Date Input */}
        {isCustom && (
          <div className="mt-4">
            <label
              htmlFor="defer-custom-date"
              className="mb-1.5 block text-sm font-medium text-on-surface-variant"
            >
              Custom Date
            </label>
            <input
              id="defer-custom-date"
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
            />
          </div>
        )}

        {/* Optional Reason */}
        <div className="mt-4">
          <label
            htmlFor="defer-reason"
            className="mb-1.5 block text-sm font-medium text-on-surface-variant"
          >
            Reason (optional)
          </label>
          <textarea
            id="defer-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being deferred?"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-outline-variant/50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm(resolvedDate, reason.trim() || undefined)
            }
            disabled={isConfirmDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing && (
              <span className="material-symbols-outlined animate-spin text-[18px]">
                progress_activity
              </span>
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
