'use client';

import type { AnomalySeverity } from '@/lib/anomaly/anomaly.types';
import { SEVERITY_CONFIG } from '@/lib/anomaly/anomaly.constants';

interface AnomalyStatCardProps {
  label: string;
  count: number;
  severity: AnomalySeverity | 'resolved';
  trend?: number;
}

const RESOLVED_CONFIG = {
  label: 'Resolved',
  color: '#009668',
  dotColor: 'bg-secondary',
};

export default function AnomalyStatCard({
  label,
  count,
  severity,
  trend,
}: AnomalyStatCardProps) {
  const config = severity === 'resolved' ? RESOLVED_CONFIG : SEVERITY_CONFIG[severity];

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-container-high/30 backdrop-blur-md border border-secondary/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
            {label}
          </span>
        </div>
        {trend !== undefined && trend !== 0 && (
          <span
            className={`text-xs font-medium ${
              trend > 0 ? 'text-red-400' : 'text-secondary'
            }`}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-mono text-3xl font-bold text-on-surface">{count}</p>
    </div>
  );
}
