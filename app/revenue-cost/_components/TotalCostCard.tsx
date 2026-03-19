'use client';

import {
  formatCurrencyCompact,
  formatVarianceAmount,
  formatPercentage,
} from '@/lib/revenue-cost/revenue-cost.utils';

interface TotalCostCardProps {
  totalCost: number;
  yoyChange: number;
  yoyPercentage: number;
  budgetVariance: number;
  budgetVariancePercentage: number;
}

export default function TotalCostCard({
  totalCost,
  yoyChange,
  yoyPercentage,
  budgetVariance,
  budgetVariancePercentage,
}: TotalCostCardProps) {
  const yoyIsPositive = yoyChange >= 0;

  // For cost: positive budget variance = UNFAVORABLE (over budget, red)
  //           negative budget variance = FAVORABLE (under budget, green)
  const budgetIsFavorable = budgetVariance <= 0;

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <p className="text-sm font-medium text-gray-500">Total Cost</p>

      <p className="mt-2 font-headline text-3xl font-bold text-on-surface">
        {formatCurrencyCompact(totalCost)}
      </p>

      <div className="mt-4 flex items-center gap-6">
        {/* Year-over-Year change */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">YoY</p>
          <p
            className={`flex items-center gap-1 text-sm font-semibold ${
              yoyIsPositive ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            <span>{yoyIsPositive ? '\u2191' : '\u2193'}</span>
            <span>
              {formatVarianceAmount(yoyChange)} (
              {formatPercentage(yoyPercentage, true)})
            </span>
          </p>
        </div>

        {/* Budget Variance — cost: positive = UNFAVORABLE (red), negative = FAVORABLE (green) */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">vs Budget</p>
          <p
            className={`text-sm font-semibold ${
              budgetIsFavorable ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatVarianceAmount(budgetVariance)} (
            {formatPercentage(budgetVariancePercentage, true)})
            <span className="ml-1 text-xs font-normal">
              {budgetIsFavorable ? 'Favorable' : 'Unfavorable'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
