'use client';

import type { RiskLevel } from '@/lib/simulation/simulation.types';
import { RISK_LEVEL_CONFIG } from '@/lib/simulation/simulation.constants';

interface RiskLevelBadgeProps {
  risk: RiskLevel;
  size?: 'sm' | 'md';
}

export default function RiskLevelBadge({
  risk,
  size = 'sm',
}: RiskLevelBadgeProps) {
  const config = RISK_LEVEL_CONFIG[risk];

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 rounded-full'
      : 'text-sm px-3 py-1 rounded-full';

  const iconSize = size === 'sm' ? 'text-[14px]' : 'text-[18px]';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium ${config.bgClass} ${sizeClasses}`}
    >
      <span className={`material-symbols-outlined ${iconSize}`}>
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}
