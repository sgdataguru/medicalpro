'use client';

import type { OutcomeSummary } from '@/lib/recommendations/recommendations.types';
import { formatDollars } from '@/lib/recommendations/recommendations.utils';

interface OutcomeSummaryCardsProps {
  summary: OutcomeSummary;
}

interface StatCardConfig {
  label: string;
  icon: string;
  color: string;
  getValue: (summary: OutcomeSummary) => string;
  getSubDetail?: (summary: OutcomeSummary) => React.ReactNode;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    label: 'Total Accepted',
    icon: 'check_circle',
    color: '#0058be',
    getValue: (s) => String(s.totalAccepted),
  },
  {
    label: 'Success Rate',
    icon: 'trending_up',
    color: '#009668',
    getValue: (s) => `${s.successRate}%`,
    getSubDetail: (s) => (
      <div className="flex items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009668]" />
          {s.positiveOutcomes} positive
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6c6cd]" />
          {s.neutralOutcomes} neutral
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
          {s.negativeOutcomes} negative
        </span>
      </div>
    ),
  },
  {
    label: 'Avg Impact',
    icon: 'payments',
    color: '#f59e0b',
    getValue: (s) => formatDollars(s.averageImpactDollars),
  },
  {
    label: 'Accuracy',
    icon: 'target',
    color: '#0058be',
    getValue: (s) => `${s.averageAccuracyScore}%`,
  },
];

export default function OutcomeSummaryCards({
  summary,
}: OutcomeSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STAT_CARDS.map((card) => (
        <div
          key={card.label}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4"
        >
          {/* Icon + label */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ color: card.color }}
            >
              {card.icon}
            </span>
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
              {card.label}
            </span>
          </div>

          {/* Value */}
          <p className="text-2xl font-headline font-extrabold text-on-surface">
            {card.getValue(summary)}
          </p>

          {/* Sub-detail (e.g., breakdown for success rate) */}
          {card.getSubDetail && card.getSubDetail(summary)}
        </div>
      ))}
    </div>
  );
}
