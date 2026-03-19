'use client';

import { formatDistanceToNow } from 'date-fns';

interface RevenueCostHeaderProps {
  periodLabel: string;
  lastSyncedAt: string;
  onRefresh: () => void;
  onExport: () => void;
}

export default function RevenueCostHeader({
  periodLabel,
  lastSyncedAt,
  onRefresh,
  onExport,
}: RevenueCostHeaderProps) {
  const formattedSyncTime = lastSyncedAt
    ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center justify-between">
      {/* Left: title + fiscal period */}
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Revenue &amp; Cost Analysis
        </h1>
        <p className="mt-1 text-sm text-gray-500">{periodLabel}</p>
      </div>

      {/* Right: sync info & actions */}
      <div className="flex items-center gap-3">
        {formattedSyncTime && (
          <span className="text-sm text-gray-500">
            Last synced {formattedSyncTime}
          </span>
        )}

        <button
          onClick={onRefresh}
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Refresh
        </button>

        <button
          onClick={onExport}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Export PDF
        </button>

        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Share
        </button>
      </div>
    </div>
  );
}
