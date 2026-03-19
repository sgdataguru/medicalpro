'use client';

import type { ExpectedImpact } from '@/lib/recommendations/recommendations.types';
import { formatImpactDelta } from '@/lib/recommendations/recommendations.utils';

interface ExpectedImpactListProps {
  impacts: ExpectedImpact[];
  maxItems?: number;
}

export default function ExpectedImpactList({
  impacts,
  maxItems = 3,
}: ExpectedImpactListProps) {
  const visibleImpacts = impacts.slice(0, maxItems);
  const remaining = impacts.length - maxItems;

  return (
    <ul className="space-y-1">
      {visibleImpacts.map((impact) => {
        const iconName =
          impact.direction === 'positive'
            ? 'trending_up'
            : impact.direction === 'negative'
              ? 'trending_down'
              : 'trending_flat';

        const colorClass =
          impact.direction === 'positive'
            ? 'text-on-tertiary-container'
            : impact.direction === 'negative'
              ? 'text-error'
              : 'text-on-surface-variant';

        return (
          <li
            key={impact.metricName}
            className="flex items-center gap-2 text-xs text-on-surface-variant"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${colorClass}`}
            >
              {iconName}
            </span>
            <span className="font-medium text-on-surface">
              {impact.displayName}
            </span>
            <span className={`font-semibold ${colorClass}`}>
              {formatImpactDelta(impact)}
            </span>
            {impact.timeToImpact && (
              <span className="text-on-primary-container">
                · {impact.timeToImpact}
              </span>
            )}
          </li>
        );
      })}
      {remaining > 0 && (
        <li className="text-[11px] text-on-primary-container pl-6">
          and {remaining} more
        </li>
      )}
    </ul>
  );
}
