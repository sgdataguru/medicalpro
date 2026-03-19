'use client';

import type { RecommendationUrgency } from '@/lib/recommendations/recommendations.types';
import { URGENCY_CONFIG } from '@/lib/recommendations/recommendations.constants';
import { formatUrgencyDeadline } from '@/lib/recommendations/recommendations.utils';

interface UrgencyIndicatorProps {
  urgency: RecommendationUrgency;
}

export default function UrgencyIndicator({ urgency }: UrgencyIndicatorProps) {
  const config = URGENCY_CONFIG[urgency.level];
  const deadlineText = formatUrgencyDeadline(urgency);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${config.bgClass}`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {config.icon}
      </span>
      <span>{config.label}</span>
      {deadlineText && (
        <>
          <span className="opacity-40">|</span>
          <span className="font-normal">{deadlineText}</span>
        </>
      )}
    </span>
  );
}
