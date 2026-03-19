'use client';

import { formatDistanceToNow } from 'date-fns';

interface SupplyChainHeaderProps {
  lastSyncedAt: string | null;
  onSync: () => void;
  onExport: () => void;
}

export default function SupplyChainHeader({
  lastSyncedAt,
  onSync,
  onExport,
}: SupplyChainHeaderProps) {
  const formattedSyncTime = lastSyncedAt
    ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })
    : null;

  return (
    <div className="flex items-center justify-between">
      {/* Left: title */}
      <h1 className="font-headline text-2xl font-bold text-on-surface">
        Supply Chain Optimizer
      </h1>

      {/* Right: sync info & actions */}
      <div className="flex items-center gap-3">
        {formattedSyncTime && (
          <span className="text-sm text-gray-500">
            Last synced {formattedSyncTime}
          </span>
        )}

        <button
          onClick={onSync}
          className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Sync Now
        </button>

        <button
          onClick={onExport}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Export
        </button>
      </div>
    </div>
  );
}
