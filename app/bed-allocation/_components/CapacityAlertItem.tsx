'use client';

import type { CapacityAlert } from '@/lib/bed-allocation/bed-allocation.types';
import { ALERT_SEVERITY_CONFIG } from '@/lib/bed-allocation/bed-allocation.constants';
import {
  formatHoursUntil,
  formatOccupancyRate,
} from '@/lib/bed-allocation/bed-allocation.utils';

interface CapacityAlertItemProps {
  alert: CapacityAlert;
  onAcknowledge: (id: string) => void;
}

export default function CapacityAlertItem({
  alert,
  onAcknowledge,
}: CapacityAlertItemProps) {
  const config = ALERT_SEVERITY_CONFIG[alert.severity] ?? ALERT_SEVERITY_CONFIG.INFO;

  return (
    <div
      className={`border rounded-lg p-3 mb-2 ${config.border} ${config.bg}`}
    >
      {/* Top row: severity dot + message + countdown */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${config.dot}`}
            aria-hidden="true"
          />
          <p className={`text-sm font-medium ${config.text}`}>
            {alert.message}
          </p>
        </div>

        <span className="shrink-0 text-sm font-bold text-on-surface">
          in {formatHoursUntil(alert.hoursUntilEvent)}
        </span>
      </div>

      {/* Occupancy projection */}
      <p className="mt-1.5 ml-[18px] text-xs text-on-surface-variant">
        Current: {formatOccupancyRate(alert.currentOccupancyRate)} &rarr;
        Projected: {formatOccupancyRate(alert.projectedOccupancyRate)}
      </p>

      {/* Recommended action */}
      <p className="mt-1 ml-[18px] text-xs text-on-surface-variant">
        {alert.recommendedAction}
      </p>

      {/* Acknowledge button / badge */}
      <div className="mt-2 ml-[18px]">
        {alert.acknowledged ? (
          <span className="inline-block text-xs text-on-surface-variant/60 font-medium">
            Acknowledged
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onAcknowledge(alert.alertId)}
            className="rounded border border-outline-variant bg-surface-container-lowest px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
