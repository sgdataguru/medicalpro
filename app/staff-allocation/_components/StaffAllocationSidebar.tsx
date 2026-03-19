'use client';

import type { StaffAllocationFilters, DepartmentStaffingSummary, PredictionJobStatus } from '@/lib/staff-allocation/staff-allocation.types';
import { ROLE_DISPLAY_MAP, SHIFT_DEFINITIONS } from '@/lib/staff-allocation/staff-allocation.constants';
import DepartmentFilter from './DepartmentFilter';
import RoleFilter from './RoleFilter';
import ShiftFilter from './ShiftFilter';
import RunPredictionButton from './RunPredictionButton';
import CompareViewToggle from './CompareViewToggle';

interface StaffAllocationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: StaffAllocationFilters;
  activeFilterCount: number;
  onToggleDepartment: (id: string) => void;
  onToggleRole: (role: StaffAllocationFilters['roles'][number]) => void;
  onToggleShift: (shift: StaffAllocationFilters['shifts'][number]) => void;
  onResetFilters: () => void;
  predictionStatus: PredictionJobStatus;
  onRunPrediction: () => void;
  onCancelPrediction: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
  departments: DepartmentStaffingSummary[];
}

export default function StaffAllocationSidebar({
  isOpen,
  onToggle,
  filters,
  activeFilterCount,
  onToggleDepartment,
  onToggleRole,
  onToggleShift,
  onResetFilters,
  predictionStatus,
  onRunPrediction,
  onCancelPrediction,
  compareMode,
  onToggleCompare,
  departments,
}: StaffAllocationSidebarProps) {
  if (!isOpen) {
    return (
      <div className="w-10 shrink-0 flex flex-col items-center pt-4">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
          title="Open sidebar"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">filter_list</span>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-secondary text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </h2>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">chevron_left</span>
        </button>
      </div>

      <DepartmentFilter
        departments={departments}
        selected={filters.departmentIds}
        onToggle={onToggleDepartment}
      />

      <RoleFilter
        selected={filters.roles}
        onToggle={onToggleRole}
      />

      <ShiftFilter
        selected={filters.shifts}
        onToggle={onToggleShift}
      />

      {activeFilterCount > 0 && (
        <button
          onClick={onResetFilters}
          className="w-full text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors"
        >
          Reset all filters
        </button>
      )}

      <div className="border-t border-outline-variant/10 pt-4 space-y-3">
        <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container">
          Actions
        </h3>
        <RunPredictionButton
          status={predictionStatus}
          onRun={onRunPrediction}
          onCancel={onCancelPrediction}
        />
        <CompareViewToggle
          enabled={compareMode}
          onToggle={onToggleCompare}
        />
      </div>
    </div>
  );
}
