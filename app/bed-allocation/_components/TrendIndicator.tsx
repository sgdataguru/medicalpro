import type { OccupancyTrend } from '@/lib/bed-allocation/bed-allocation.types';
import { getTrendIcon, getTrendColor } from '@/lib/bed-allocation/bed-allocation.utils';

interface TrendIndicatorProps {
  trend: OccupancyTrend;
  percentage: number;
}

export default function TrendIndicator({ trend, percentage }: TrendIndicatorProps) {
  const icon = getTrendIcon(trend);
  const colorClass = getTrendColor(trend);
  const sign = percentage >= 0 ? '+' : '';
  const formatted = `${sign}${percentage.toFixed(1)}%`;

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${colorClass}`}>
      <span>{icon}</span>
      <span>{formatted}</span>
    </span>
  );
}
