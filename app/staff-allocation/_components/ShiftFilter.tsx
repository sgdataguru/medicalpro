'use client';

import type { ShiftType } from '@/lib/staff-allocation/staff-allocation.types';
import { SHIFT_DEFINITIONS } from '@/lib/staff-allocation/staff-allocation.constants';

interface ShiftFilterProps {
  selected: ShiftType[];
  onToggle: (shift: ShiftType) => void;
}

const SHIFT_TYPES: ShiftType[] = ['DAY', 'EVENING', 'NIGHT'];

export default function ShiftFilter({ selected, onToggle }: ShiftFilterProps) {
  return (
    <div>
      <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-on-primary-container mb-2">
        Shift
      </h3>
      <div className="space-y-1">
        {SHIFT_TYPES.map((shift) => {
          const def = SHIFT_DEFINITIONS[shift];
          const isSelected = selected.includes(shift);
          return (
            <button
              key={shift}
              onClick={() => onToggle(shift)}
              className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-lg transition-colors ${
                isSelected
                  ? 'bg-secondary/10 text-secondary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high/50'
              }`}
            >
              <span>{def.label}</span>
              <span className="text-[10px] text-on-primary-container">{def.start}–{def.end}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
