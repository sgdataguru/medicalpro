'use client';

import type { DepartmentStaffingSummary } from '@/lib/staff-allocation/staff-allocation.types';

interface DepartmentalDistributionProps {
  departments: DepartmentStaffingSummary[];
  loading: boolean;
}

interface DeptBar {
  name: string;
  staffCount: number;
  utilization: number;
  status: 'standard' | 'critical' | 'understaffed' | 'optimal';
}

function getBarStyle(status: DeptBar['status']) {
  switch (status) {
    case 'critical':
      return { bg: 'bg-error', text: 'text-white', label: 'Over-Capacity' };
    case 'understaffed':
      return { bg: 'bg-secondary/60', text: 'text-white', label: 'Under-Staffed' };
    case 'optimal':
      return { bg: 'bg-tertiary-fixed-dim', text: 'text-on-tertiary-fixed', label: 'Optimal' };
    default:
      return { bg: 'bg-secondary', text: 'text-white', label: 'Utilization' };
  }
}

function classifyDepartment(coverage: number): DeptBar['status'] {
  if (coverage > 100) return 'critical';
  if (coverage < 85) return 'understaffed';
  if (coverage >= 85 && coverage < 95) return 'optimal';
  return 'standard';
}

export default function DepartmentalDistribution({ departments, loading }: DepartmentalDistributionProps) {
  if (loading && departments.length === 0) {
    return <div className="h-96 bg-surface-container-high rounded-2xl animate-pulse" />;
  }

  // Take top departments by total staff, sorted by coverage for visual impact
  const deptBars: DeptBar[] = departments
    .slice(0, 8)
    .map((d) => ({
      name: d.departmentName,
      staffCount: d.totalOnDuty,
      utilization: d.coveragePercentage,
      status: classifyDepartment(d.coveragePercentage),
    }))
    .sort((a, b) => b.utilization - a.utilization);

  // Find departments for insight cards
  const lowestCoverage = departments.reduce((min, d) => d.coveragePercentage < min.coveragePercentage ? d : min, departments[0]);
  const highestStaff = departments.reduce((max, d) => d.totalOnDuty > max.totalOnDuty ? d : max, departments[0]);

  return (
    <div className="space-y-6">
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0px_0px_24px_rgba(124,131,155,0.06)]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold font-headline text-on-surface">Departmental Distribution</h3>
            <p className="text-sm text-on-surface-variant">Active headcount vs. clinical demand capacity.</p>
          </div>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">
            more_horiz
          </button>
        </div>

        <div className="space-y-6">
          {deptBars.map((dept) => {
            const style = getBarStyle(dept.status);
            const barWidth = Math.min(110, dept.utilization);
            return (
              <div key={dept.name} className="flex items-center group">
                <div className="w-32 text-sm font-bold text-on-surface shrink-0">{dept.name}</div>
                <div className="flex-1 px-4 relative">
                  <div className="h-8 bg-surface-container rounded-lg overflow-hidden flex">
                    <div
                      className={`h-full ${style.bg} flex items-center px-3 transition-all`}
                      style={{ width: `${barWidth}%` }}
                    >
                      <span className={`text-[10px] font-bold ${style.text} uppercase whitespace-nowrap`}>
                        {dept.utilization.toFixed(0)}% {style.label}
                      </span>
                    </div>
                  </div>
                  {dept.status === 'critical' && (
                    <div className="absolute -right-1 -top-1">
                      <span className="material-symbols-outlined text-error text-lg">warning</span>
                    </div>
                  )}
                </div>
                <div className="w-24 text-right shrink-0">
                  <span className={`text-xs font-bold ${dept.status === 'critical' ? 'text-error' : 'text-on-surface-variant'}`}>
                    {dept.staffCount} Staff
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Critical Shift</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Target Range</span>
          </div>
        </div>
      </div>

      {/* Department Insight Bento */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 rounded-lg bg-surface-container-lowest shrink-0">
            <span className="material-symbols-outlined text-secondary">psychology</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Fatigue Alert Index</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {lowestCoverage?.departmentName ?? 'Surgery'} ward nurses approaching 48h limit. Action suggested within 4h.
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 rounded-lg bg-surface-container-lowest shrink-0">
            <span className="material-symbols-outlined text-on-tertiary-container">swap_horiz</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface">Suggested Float</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Move 4 Gen-Med staff to {highestStaff?.departmentName ?? 'ER'} for peak trauma window (18:00 – 22:00).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
