'use client';

import { useMemo } from 'react';
import type {
  ExpirationAlert,
  ExpirationAction,
} from '@/lib/supply-chain/supply-chain.types';
import { EXPIRATION_WINDOWS } from '@/lib/supply-chain/supply-chain.constants';
import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';
import ExpiringItemRow from './ExpiringItemRow';

interface ExpirationTrackerProps {
  alerts: ExpirationAlert[];
  onAction: (alertId: string, action: ExpirationAction) => void;
  activeWindow: number;
  onWindowChange: (days: number) => void;
}

export default function ExpirationTracker({
  alerts,
  onAction,
  activeWindow,
  onWindowChange,
}: ExpirationTrackerProps) {
  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => a.daysToExpiration <= activeWindow)
        .sort((a, b) => a.daysToExpiration - b.daysToExpiration),
    [alerts, activeWindow],
  );

  const totalValueAtRisk = useMemo(
    () => filtered.reduce((sum, a) => sum + a.valueAtRisk, 0),
    [filtered],
  );

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      {/* Header */}
      <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">
        Expiration Tracker
      </h2>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-4">
        {EXPIRATION_WINDOWS.map((win) => (
          <button
            key={win.value}
            type="button"
            onClick={() => onWindowChange(win.value)}
            className={`pb-2 text-sm transition-colors ${
              activeWindow === win.value
                ? 'border-b-2 border-secondary text-secondary font-medium'
                : 'text-gray-500 hover:text-on-surface'
            }`}
          >
            {win.label}
          </button>
        ))}
      </div>

      {/* Summary line */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''} /{' '}
        {formatInventoryValue(totalValueAtRisk)} at risk
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No items expiring within this window
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((alert) => (
            <ExpiringItemRow
              key={alert.alertId}
              alert={alert}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
