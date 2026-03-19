'use client';

import type { StaffRole } from '@/lib/staff-allocation/staff-allocation.types';
import { ROLE_DISPLAY_MAP, ROLE_ABBREVIATIONS } from '@/lib/staff-allocation/staff-allocation.constants';

interface RoleFilterProps {
  selected: StaffRole[];
  onToggle: (role: StaffRole) => void;
}

export default function RoleFilter({ selected, onToggle }: RoleFilterProps) {
  return (
    <div>
      <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
        Role
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {ROLE_ABBREVIATIONS.map((role) => {
          const isSelected = selected.includes(role);
          return (
            <button
              key={role}
              onClick={() => onToggle(role)}
              className={`px-2 py-1 text-[11px] font-bold rounded-full transition-colors ${
                isSelected
                  ? 'bg-secondary text-white'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              title={ROLE_DISPLAY_MAP[role]}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}
