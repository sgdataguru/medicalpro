import type {
  VarianceSeverity,
  VarianceDirection,
} from '@/lib/revenue-cost/revenue-cost.types';

interface VarianceFlagBadgeProps {
  severity: VarianceSeverity;
  direction: VarianceDirection;
}

const SEVERITY_CONFIG: Record<VarianceSeverity, { symbol: string; classes: string }> = {
  CRITICAL: { symbol: '!!', classes: 'bg-red-100 text-red-700' },
  SIGNIFICANT: { symbol: '!', classes: 'bg-amber-100 text-amber-700' },
  MODERATE: { symbol: '~', classes: 'bg-blue-100 text-blue-700' },
  MINOR: { symbol: '-', classes: 'bg-gray-100 text-gray-500' },
};

export default function VarianceFlagBadge({
  severity,
  direction,
}: VarianceFlagBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const favorableClass = direction === 'FAVORABLE' ? ' text-emerald-600' : '';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold leading-none ${config.classes}${favorableClass}`}
    >
      {config.symbol}
    </span>
  );
}
