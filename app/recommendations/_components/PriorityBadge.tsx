'use client';

import type { PriorityLevel } from '@/lib/recommendations/recommendations.types';
import { PRIORITY_CONFIG } from '@/lib/recommendations/recommendations.constants';

interface PriorityBadgeProps {
  level: PriorityLevel;
}

export default function PriorityBadge({ level }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${config.bgClass} ${config.textClass}`}
    >
      {level === 'urgent' && (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-pulse rounded-full opacity-75"
            style={{ backgroundColor: config.color }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
        </span>
      )}
      {config.label}
    </span>
  );
}
