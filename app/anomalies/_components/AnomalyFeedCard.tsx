'use client';

import type { AnomalyAlert } from '@/lib/anomaly/anomaly.types';
import { formatAnomalyTimestamp } from '@/lib/anomaly/anomaly.utils';
import { SEVERITY_CONFIG } from '@/lib/anomaly/anomaly.constants';
import SeverityBadge from './SeverityBadge';
import ModuleTag from './ModuleTag';

interface AnomalyFeedCardProps {
  alert: AnomalyAlert;
  isActive: boolean;
  onClick: () => void;
}

export default function AnomalyFeedCard({ alert, isActive, onClick }: AnomalyFeedCardProps) {
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const isNew = Date.now() - new Date(alert.detectedAt).getTime() < 5 * 60 * 1000;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'bg-surface-container-lowest ring-2 ring-secondary border-secondary/50'
          : 'bg-surface-container-lowest border-outline-variant/15 hover:bg-surface-container-lowest/80'
      }`}
      style={{ borderLeftWidth: '3px', borderLeftColor: severityConfig.color }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={alert.severity} pulse={isNew && alert.severity === 'critical'} />
          <ModuleTag module={alert.module} />
        </div>
        <span className="text-xs text-on-primary-container whitespace-nowrap shrink-0">
          {formatAnomalyTimestamp(alert.detectedAt)}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-on-surface mb-1 line-clamp-1">
        {alert.title}
      </h3>
      <p className="text-xs text-on-surface-variant line-clamp-2">
        {alert.description}
      </p>
      {alert.status !== 'active' && (
        <div className="mt-2">
          <span className="text-xs text-on-primary-container capitalize">
            {alert.status}
            {alert.assignedTo && ' • Assigned'}
          </span>
        </div>
      )}
    </button>
  );
}
