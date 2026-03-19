'use client';

import { useState } from 'react';

interface AcceptConfirmationDialogProps {
  onConfirm: (notes: string, targetDate: string) => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export default function AcceptConfirmationDialog({
  onConfirm,
  onCancel,
  isProcessing,
}: AcceptConfirmationDialogProps) {
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const isConfirmDisabled = isProcessing || notes.trim().length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl">
        {/* Title */}
        <h2 className="font-headline text-xl font-semibold text-on-surface">
          Accept Recommendation
        </h2>

        {/* Implementation Notes */}
        <div className="mt-5">
          <label
            htmlFor="accept-notes"
            className="mb-1.5 block text-sm font-medium text-on-surface-variant"
          >
            Implementation Notes
          </label>
          <textarea
            id="accept-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe the implementation plan..."
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
          />
        </div>

        {/* Target Implementation Date */}
        <div className="mt-4">
          <label
            htmlFor="accept-target-date"
            className="mb-1.5 block text-sm font-medium text-on-surface-variant"
          >
            Target Implementation Date
          </label>
          <input
            id="accept-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30"
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
            onClick={() => onConfirm(notes.trim(), targetDate)}
            disabled={isConfirmDisabled}
            className="inline-flex items-center gap-2 rounded-lg bg-on-tertiary-container px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-on-tertiary-container/90 focus:outline-none focus:ring-2 focus:ring-on-tertiary-container/50 disabled:cursor-not-allowed disabled:opacity-50"
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
