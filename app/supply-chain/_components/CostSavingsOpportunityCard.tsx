'use client';

import { formatInventoryValue } from '@/lib/supply-chain/supply-chain.utils';

interface CostSavingsOpportunityCardProps {
  potentialAnnualSavings: number;
  currentAnnualSpend: number;
  recommendationCount: number;
}

export default function CostSavingsOpportunityCard({
  potentialAnnualSavings,
  currentAnnualSpend,
  recommendationCount,
}: CostSavingsOpportunityCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full bg-tertiary-fixed" />
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          Cost Savings Opportunity
        </h3>
      </div>

      {/* Primary metric */}
      <p className="text-3xl font-bold text-success">
        {formatInventoryValue(potentialAnnualSavings)}
      </p>
      <p className="mt-1 text-sm text-gray-500">Potential annual savings</p>

      {/* Sub-metrics */}
      <div className="mt-4 flex items-start gap-6 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Annual Spend
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {formatInventoryValue(currentAnnualSpend)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Recommendations
          </p>
          <p className="mt-1 text-lg font-semibold text-on-surface">
            {recommendationCount}
          </p>
        </div>
      </div>
    </div>
  );
}
