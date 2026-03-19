'use client';

import type { RiskLevel } from '@/lib/supply-chain/supply-chain.types';
import { RISK_LEVEL_CONFIG } from '@/lib/supply-chain/supply-chain.constants';

interface InventoryStatusBadgeProps {
  riskLevel: RiskLevel;
}

export default function InventoryStatusBadge({ riskLevel }: InventoryStatusBadgeProps) {
  const config = RISK_LEVEL_CONFIG[riskLevel];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
