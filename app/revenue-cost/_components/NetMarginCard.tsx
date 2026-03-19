'use client';

import type { MonthlyMargin } from '@/lib/revenue-cost/revenue-cost.types';
import { formatPercentage } from '@/lib/revenue-cost/revenue-cost.utils';
import MarginSparkline from './MarginSparkline';

interface NetMarginCardProps {
  marginPercentage: number;
  marginTrend: MonthlyMargin[];
  priorMargin: number;
  budgetMargin: number;
}

export default function NetMarginCard({
  marginPercentage,
  marginTrend,
  priorMargin,
  budgetMargin,
}: NetMarginCardProps) {
  const isPositiveMargin = marginPercentage >= 0;

  const priorDelta = marginPercentage - priorMargin;
  const budgetDelta = marginPercentage - budgetMargin;

  const priorIsPositive = priorDelta >= 0;
  const budgetIsPositive = budgetDelta >= 0;

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <p className="text-sm font-medium text-gray-500">Net Margin</p>

      <p
        className={`mt-2 font-headline text-3xl font-bold ${
          isPositiveMargin ? 'text-emerald-600' : 'text-red-600'
        }`}
      >
        {formatPercentage(marginPercentage)}
      </p>

      <div className="mt-4 flex items-center gap-6">
        {/* vs Prior */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">vs Prior</p>
          <p
            className={`text-sm font-semibold ${
              priorIsPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {priorDelta >= 0 ? '+' : ''}
            {priorDelta.toFixed(1)}pp
          </p>
        </div>

        {/* vs Budget */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">vs Budget</p>
          <p
            className={`text-sm font-semibold ${
              budgetIsPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {budgetDelta >= 0 ? '+' : ''}
            {budgetDelta.toFixed(1)}pp
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-4">
        <MarginSparkline data={marginTrend} />
      </div>
    </div>
  );
}
