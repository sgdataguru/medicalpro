'use client';

import type { ConfidenceScore } from '@/lib/analytics-query/analytics-query.types';
import { formatConfidence } from '@/lib/analytics-query/analytics-query.utils';

interface ConfidenceBadgeProps {
  confidence: ConfidenceScore;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const { label, percentage, color } = formatConfidence(confidence);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-semibold text-on-surface-variant">
        {label}
      </span>
      <span className="text-xs text-on-primary-container font-bold">
        {percentage}
      </span>
    </div>
  );
}
