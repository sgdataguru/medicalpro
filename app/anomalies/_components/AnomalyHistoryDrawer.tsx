'use client';

import type { AnomalyAuditEntry } from '@/lib/anomaly/anomaly.types';
import { formatAnomalyDate } from '@/lib/anomaly/anomaly.utils';

interface AnomalyHistoryDrawerProps {
  entries: AnomalyAuditEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const ACTION_ICONS: Record<string, string> = {
  created: '●',
  acknowledged: '✓',
  investigation_started: '🔍',
  note_added: '📝',
  dismissed: '✕',
  resolved: '✓✓',
  escalated: '⬆',
};

export default function AnomalyHistoryDrawer({
  entries,
  isOpen,
  onClose,
}: AnomalyHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest border-l border-outline-variant/15 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline text-lg font-semibold text-secondary-container">
            History Timeline
          </h3>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-[#1A3A4C]" />
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 pl-1">
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface-container border border-outline-variant/15 flex items-center justify-center text-xs">
                  {ACTION_ICONS[entry.action] ?? '·'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-on-surface-variant">
                    <span className="font-medium">{entry.actorName}</span>
                    <span className="text-on-primary-container"> · </span>
                    <span className="capitalize text-on-surface-variant">{entry.action.replace(/_/g, ' ')}</span>
                  </p>
                  {entry.reason && (
                    <p className="text-xs text-on-primary-container mt-1 italic">
                      &ldquo;{entry.reason}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-on-primary-container font-mono mt-1">
                    {formatAnomalyDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
