'use client';

import type { ShiftStaffing } from '@/lib/staff-allocation/staff-allocation.types';
import { SHIFT_DEFINITIONS, ROLE_DISPLAY_MAP } from '@/lib/staff-allocation/staff-allocation.constants';
import { formatStaffingRatio } from '@/lib/staff-allocation/staff-allocation.utils';

interface HeatMapTooltipProps {
  shiftData: ShiftStaffing;
  deptName: string;
  x: number;
  y: number;
}

export default function HeatMapTooltip({ shiftData, deptName, x, y }: HeatMapTooltipProps) {
  const shiftDef = SHIFT_DEFINITIONS[shiftData.shiftType];
  const gap = shiftData.totalAssigned - shiftData.totalRequired;

  return (
    <div
      className="fixed z-50 bg-[#1a1c2e] text-white rounded-lg p-3 shadow-lg pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <div className="font-headline text-xs font-bold mb-1.5">
        {deptName} — {shiftDef.label}
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Assigned / Required</span>
          <span className="font-bold">{shiftData.totalAssigned} / {shiftData.totalRequired}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Gap</span>
          <span className={`font-bold ${gap >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {gap >= 0 ? '+' : ''}{gap}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Patient Count</span>
          <span className="font-bold">{shiftData.patientCount}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Nurse:Patient</span>
          <span className="font-bold">{formatStaffingRatio(shiftData.nurseToPatientRatio)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Regulatory Limit</span>
          <span className="font-bold">1:{shiftData.regulatoryRatioLimit}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-white/60">Compliant</span>
          <span className={`font-bold ${shiftData.isCompliant ? 'text-emerald-400' : 'text-red-400'}`}>
            {shiftData.isCompliant ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      {shiftData.staffByRole.length > 0 && (
        <div className="border-t border-white/10 mt-2 pt-2 space-y-0.5">
          {shiftData.staffByRole.map((r) => (
            <div key={r.role} className="flex justify-between text-[10px]">
              <span className="text-white/50">{ROLE_DISPLAY_MAP[r.role] ?? r.role}</span>
              <span>{r.assigned}/{r.required}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
