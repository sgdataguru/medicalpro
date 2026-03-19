'use client';

import type {
  ExpirationAlert,
  ExpirationAction,
} from '@/lib/supply-chain/supply-chain.types';
import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';

interface ExpiringItemRowProps {
  alert: ExpirationAlert;
  onAction: (alertId: string, action: ExpirationAction) => void;
}

const SEVERITY_STYLES: Record<
  ExpirationAlert['severity'],
  { bg: string; text: string }
> = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700' },
  WARNING: { bg: 'bg-amber-100', text: 'text-amber-700' },
  INFO: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const ACTION_TAKEN_LABELS: Record<string, string> = {
  PRIORITIZED: 'Prioritized',
  TRANSFERRED: 'Transferred',
  RETURNED: 'Returned',
  DISPOSED: 'Disposed',
};

export default function ExpiringItemRow({
  alert,
  onAction,
}: ExpiringItemRowProps) {
  const severity = SEVERITY_STYLES[alert.severity];
  const hasAction = alert.actionTaken !== 'NONE';

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      {/* Left: item info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-on-surface text-sm truncate">
          {alert.itemName}
        </p>
        <p className="text-xs text-gray-400">{alert.itemCode}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {alert.departmentName} &middot; Lot {alert.lotNumber}
        </p>
      </div>

      {/* Center: expiration countdown + value */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${severity.bg} ${severity.text}`}
        >
          {alert.daysToExpiration <= 0
            ? 'Expired'
            : `${alert.daysToExpiration}d remaining`}
        </span>
        <span className="text-sm text-gray-500 mt-1">
          {formatInventoryValue(alert.valueAtRisk)} at risk
        </span>
      </div>

      {/* Right: actions or completed badge */}
      <div className="flex items-center gap-2 shrink-0">
        {hasAction ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {ACTION_TAKEN_LABELS[alert.actionTaken] ?? alert.actionTaken}
          </span>
        ) : (
          <>
            {(alert.suggestedAction === 'USE_FIRST' ||
              alert.suggestedAction === 'TRANSFER' ||
              alert.suggestedAction === 'RETURN_TO_SUPPLIER') && (
              <button
                type="button"
                onClick={() => onAction(alert.alertId, 'USE_FIRST')}
                className="text-secondary text-sm font-medium hover:text-secondary/80 transition-colors"
              >
                Use First
              </button>
            )}
            {(alert.suggestedAction === 'TRANSFER' ||
              alert.suggestedAction === 'RETURN_TO_SUPPLIER') && (
              <button
                type="button"
                onClick={() => onAction(alert.alertId, 'TRANSFER')}
                className="text-secondary-container text-sm hover:text-secondary-container/80 transition-colors"
              >
                Transfer
              </button>
            )}
            <button
              type="button"
              onClick={() => onAction(alert.alertId, 'DISPOSE')}
              className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Dispose
            </button>
          </>
        )}
      </div>
    </div>
  );
}
