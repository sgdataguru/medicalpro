'use client';

import {
  formatCurrencyCompact,
  formatVarianceAmount,
  formatPercentage,
} from '@/lib/revenue-cost/revenue-cost.utils';

interface TotalRevenueCardProps {
  totalRevenue: number;
  yoyChange: number;
  yoyPercentage: number;
  budgetVariance: number;
  budgetVariancePercentage: number;
}

export default function TotalRevenueCard({
  totalRevenue,
  yoyChange,
  yoyPercentage,
  budgetVariance,
  budgetVariancePercentage,
}: TotalRevenueCardProps) {
  const yoyIsPositive = yoyChange >= 0;
  const budgetIsPositive = budgetVariance >= 0;

  return (
    <div className="rounded-xl shadow-md p-6 bg-white">
      <p className="text-sm font-medium text-gray-500">Total Revenue</p>

      <p className="mt-2 font-headline text-3xl font-bold text-on-surface">
        {formatCurrencyCompact(totalRevenue)}
      </p>

      <div className="mt-4 flex items-center gap-6">
        {/* Year-over-Year change */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">YoY</p>
          <p
            className={`flex items-center gap-1 text-sm font-semibold ${
              yoyIsPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            <span>{yoyIsPositive ? '\u2191' : '\u2193'}</span>
            <span>
              {formatVarianceAmount(yoyChange)} (
              {formatPercentage(yoyPercentage, true)})
            </span>
          </p>
        </div>

        {/* Budget Variance — for revenue: positive = favorable (green) */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">vs Budget</p>
          <p
            className={`text-sm font-semibold ${
              budgetIsPositive ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {formatVarianceAmount(budgetVariance)} (
            {formatPercentage(budgetVariancePercentage, true)})
          </p>
        </div>
      </div>
    </div>
  );
}
