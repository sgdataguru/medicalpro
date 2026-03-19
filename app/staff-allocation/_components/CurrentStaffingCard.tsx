'use client';

import type { StaffingTotals } from '@/lib/staff-allocation/staff-allocation.types';

interface CurrentStaffingCardProps {
  totals: StaffingTotals;
  loading: boolean;
}

export default function CurrentStaffingCard({ totals, loading }: CurrentStaffingCardProps) {
  if (loading && totals.totalOnDuty === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 animate-pulse">
        <div className="h-5 w-40 bg-surface-container-high rounded mb-4" />
        <div className="h-10 w-20 bg-surface-container-high rounded mb-2" />
        <div className="h-4 w-60 bg-surface-container-high rounded" />
      </div>
    );
  }

  const coverageColor =
    totals.overallCoverage >= 95
      ? 'text-emerald-600'
      : totals.overallCoverage >= 85
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[20px] text-secondary">badge</span>
        <h3 className="font-headline text-sm font-bold text-on-surface">Current Staffing</h3>
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-headline text-3xl font-extrabold text-on-surface">{totals.totalOnDuty}</span>
        <span className="text-sm text-on-surface-variant">/ {totals.totalRequired} required</span>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">domain</span>
          <span className="text-sm text-on-surface-variant">{totals.departmentCount} Departments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">monitoring</span>
          <span className={`text-sm font-bold ${coverageColor}`}>{totals.overallCoverage}% Coverage</span>
        </div>
      </div>
    </div>
  );
}
