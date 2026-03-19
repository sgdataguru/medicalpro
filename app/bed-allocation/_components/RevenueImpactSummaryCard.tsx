'use client';

import {
  formatRevenue,
  formatRevenueWithSign,
} from '@/lib/bed-allocation/bed-allocation.utils';
import type { DepartmentOccupancy } from '@/lib/bed-allocation/bed-allocation.types';

interface RevenueImpactSummaryCardProps {
  departments: DepartmentOccupancy[];
  reallocationImpact: number;
}

export default function RevenueImpactSummaryCard({
  departments,
  reallocationImpact,
}: RevenueImpactSummaryCardProps) {
  const totalMonthlyRevenue = departments.reduce(
    (sum, dept) => sum + dept.monthlyRevenue,
    0,
  );

  const impactColor =
    reallocationImpact >= 0 ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="rounded-xl shadow-sm p-6 bg-surface-container-lowest">
      <h3 className="font-headline text-on-surface text-lg font-semibold">
        Revenue Impact
      </h3>

      <p className="mt-3 text-3xl font-bold text-on-surface">
        {formatRevenue(totalMonthlyRevenue)}
      </p>
      <p className="text-xs text-on-surface-variant">Total monthly revenue</p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className={`text-xl font-semibold ${impactColor}`}>
          {formatRevenueWithSign(reallocationImpact)}
        </span>
        <span className="text-xs text-on-surface-variant">reallocation impact</span>
      </div>

      <p className="mt-3 text-sm text-on-surface-variant">
        Across {departments.length} department{departments.length !== 1 && 's'}
      </p>
    </div>
  );
}
