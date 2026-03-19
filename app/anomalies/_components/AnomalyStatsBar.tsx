'use client';

import type { AnomalyStats } from '@/lib/anomaly/anomaly.types';
import AnomalyStatCard from './AnomalyStatCard';

interface AnomalyStatsBarProps {
  stats: AnomalyStats;
}

export default function AnomalyStatsBar({ stats }: AnomalyStatsBarProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      <AnomalyStatCard
        label="Critical"
        count={stats.critical}
        severity="critical"
      />
      <AnomalyStatCard
        label="Warning"
        count={stats.warning}
        severity="warning"
      />
      <AnomalyStatCard
        label="Informational"
        count={stats.informational}
        severity="informational"
      />
      <AnomalyStatCard
        label="Resolved"
        count={stats.resolved}
        severity="resolved"
      />
    </div>
  );
}
