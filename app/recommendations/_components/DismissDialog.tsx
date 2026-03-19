'use client';

import { useState } from 'react';
import type { DismissReason } from '@/lib/recommendations/recommendations.types';
import { DISMISS_REASONS } from '@/lib/recommendations/recommendations.constants';

interface DismissDialogProps {
  onConfirm: (reason: DismissReason, comment?: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function DismissDialog({
  onConfirm,
  onCancel,
  isProcessing,
}: DismissDialogProps) {
  const [selectedReason, setSelectedReason] = useState<DismissReason | null>(null);
  const [comment, setComment] = useState('');

  const isConfirmDisabled = isProcessing || selectedReason === null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        {/* Title */}
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          Dismiss Recommendation
        </h2>

        {/* Reason Selection */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-on-surface-variant">
            Reason for Dismissal <span className="text-error">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {DISMISS_REASONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant px-3 py-2.5 transition-colors hover:bg-surface-container has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
              >
                <input
                  type="radio"
                  name="dismiss-reason"
                  value={option.value}
                  checked={selectedReason === option.value}
                  onChange={() => setSelectedReason(option.value)}
                  className="h-4 w-4 accent-secondary"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Comment */}
        <div className="mt-4">
          <label
            htmlFor="dismiss-comment"
            className="mb-1.5 block text-sm font-medium text-on-surface-variant"
          >
            Additional Comments (optional)
          </label>
          <textarea
            id="dismiss-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional context..."
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
              selectedReason &&
              onConfirm(selectedReason, comment.trim() || undefined)
            }
            disabled={isConfirmDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90 focus:outline-none focus:ring-2 focus:ring-error/50 disabled:cursor-not-allowed disabled:opacity-50"
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
