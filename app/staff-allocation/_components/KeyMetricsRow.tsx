'use client';

import type { StaffingTotals, CoverageGap } from '@/lib/staff-allocation/staff-allocation.types';

interface KeyMetricsRowProps {
  totals: StaffingTotals;
  overtimeCost: number;
  vacancyRate: number;
  criticalOpenings: number;
  criticalDepartment: string;
  patientToStaffRatio: number;
  loading: boolean;
}

export default function KeyMetricsRow({
  totals,
  overtimeCost,
  vacancyRate,
  criticalOpenings,
  criticalDepartment,
  patientToStaffRatio,
  loading,
}: KeyMetricsRowProps) {
  if (loading && totals.totalOnDuty === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-surface-container-high rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const coverageChange = totals.overallCoverage > 90 ? '+2.4' : '-1.2';
  const isPositiveChange = coverageChange.startsWith('+');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Active Staff */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_0px_24px_rgba(124,131,155,0.06)] flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total Active Staff</p>
          <h3 className="text-4xl font-black font-headline text-secondary">{totals.totalOnDuty.toLocaleString()}</h3>
        </div>
        <div className={`mt-4 flex items-center gap-2 ${isPositiveChange ? 'text-on-tertiary-container bg-tertiary-fixed/20' : 'text-error bg-error/10'} px-2 py-1 rounded text-[10px] w-fit font-bold`}>
          <span className="material-symbols-outlined text-[10px]">
            {isPositiveChange ? 'trending_up' : 'trending_down'}
          </span>
          {coverageChange}% vs LAST SHIFT
        </div>
      </div>

      {/* Vacancy Rate */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_0px_24px_rgba(124,131,155,0.06)] flex flex-col justify-between border-b-4 border-error/20">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Vacancy Rate</p>
          <h3 className="text-4xl font-black font-headline text-error">{vacancyRate.toFixed(1)}%</h3>
        </div>
        <p className="text-[10px] text-on-surface-variant font-medium mt-4">
          {criticalOpenings} Critical Openings in {criticalDepartment}
        </p>
      </div>

      {/* Overtime Cost */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_0px_24px_rgba(124,131,155,0.06)] flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Overtime Cost</p>
          <h3 className="text-4xl font-black font-headline text-on-surface">
            ${overtimeCost >= 1000 ? `${(overtimeCost / 1000).toFixed(1)}k` : overtimeCost.toFixed(0)}
          </h3>
        </div>
        <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(100, (overtimeCost / 20000) * 100)}%` }} />
        </div>
      </div>

      {/* Patient-to-Staff Ratio */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_0px_24px_rgba(124,131,155,0.06)] flex flex-col justify-between border-b-4 border-tertiary-fixed-dim/40">
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Patient-to-Staff</p>
          <h3 className="text-4xl font-black font-headline text-on-surface">
            {patientToStaffRatio.toFixed(1)} : 1
          </h3>
        </div>
        <p className="text-[10px] text-on-tertiary-container font-bold mt-4 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse" />
          {patientToStaffRatio <= 5 ? 'STABLE RANGE' : 'ELEVATED'}
        </p>
      </div>
    </div>
  );
}
