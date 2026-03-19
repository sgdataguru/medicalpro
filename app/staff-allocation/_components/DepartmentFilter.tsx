'use client';

import type { DepartmentStaffingSummary } from '@/lib/staff-allocation/staff-allocation.types';

interface DepartmentFilterProps {
  departments: DepartmentStaffingSummary[];
  selected: string[];
  onToggle: (id: string) => void;
}

export default function DepartmentFilter({ departments, selected, onToggle }: DepartmentFilterProps) {
  return (
    <div>
      <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
        Department
      </h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {departments.map((dept) => {
          const isSelected = selected.includes(dept.departmentId);
          return (
            <button
              key={dept.departmentId}
              onClick={() => onToggle(dept.departmentId)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                isSelected
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high/50'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                isSelected ? 'bg-secondary border-secondary' : 'border-outline-variant'
              }`}>
                {isSelected && (
                  <span className="material-symbols-outlined text-[10px] text-white">check</span>
                )}
              </span>
              {dept.departmentName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
