'use client';

import { useState } from 'react';
import type { DepartmentStaffingSummary, ShiftType } from '@/lib/staff-allocation/staff-allocation.types';
import { SHIFT_DEFINITIONS } from '@/lib/staff-allocation/staff-allocation.constants';
import { getHeatMapCellClass, formatStaffingRatio } from '@/lib/staff-allocation/staff-allocation.utils';
import HeatMapTooltip from './HeatMapTooltip';

interface StaffingHeatMapProps {
  departments: DepartmentStaffingSummary[];
  loading: boolean;
}

const SHIFT_ORDER: ShiftType[] = ['DAY', 'EVENING', 'NIGHT'];

export default function StaffingHeatMap({ departments, loading }: StaffingHeatMapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ deptId: string; shift: ShiftType; x: number; y: number } | null>(null);

  if (loading && departments.length === 0) {
    return <div className="h-80 bg-surface-container-high rounded-xl animate-pulse" />;
  }

  const getShiftData = (dept: DepartmentStaffingSummary, shift: ShiftType) => {
    return dept.shifts.find((s) => s.shiftType === shift);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[20px] text-secondary">grid_view</span>
        <h3 className="font-headline text-sm font-bold text-on-surface">Staffing Heat Map</h3>
        <div className="ml-auto flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Adequate</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" /> Tight</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Gap</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant/15">
              <th className="text-left py-2 px-3 text-xs font-bold uppercase tracking-widest text-on-primary-container w-40">
                Department
              </th>
              {SHIFT_ORDER.map((shift) => (
                <th key={shift} className="text-center py-2 px-3 text-xs font-bold uppercase tracking-widest text-on-primary-container">
                  {SHIFT_DEFINITIONS[shift].label}
                  <div className="text-[9px] font-normal mt-0.5">{SHIFT_DEFINITIONS[shift].start}–{SHIFT_DEFINITIONS[shift].end}</div>
                </th>
              ))}
              <th className="text-center py-2 px-3 text-xs font-bold uppercase tracking-widest text-on-primary-container">
                Coverage
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.departmentId} className="border-b border-outline-variant/5">
                <td className="py-2 px-3 font-semibold text-on-surface text-xs">{dept.departmentName}</td>
                {SHIFT_ORDER.map((shift) => {
                  const shiftData = getShiftData(dept, shift);
                  if (!shiftData) return <td key={shift} className="py-2 px-3 text-center text-xs text-on-surface-variant">—</td>;
                  const cellClass = getHeatMapCellClass(shiftData.totalAssigned, shiftData.totalRequired);
                  return (
                    <td
                      key={shift}
                      className="py-2 px-3"
                      onMouseEnter={(e) => setHoveredCell({ deptId: dept.departmentId, shift, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className={`mx-auto w-fit px-3 py-1.5 rounded-lg border text-center cursor-pointer ${cellClass}`}>
                        <div className="text-xs font-bold">{shiftData.totalAssigned}/{shiftData.totalRequired}</div>
                        <div className="text-[10px]">{formatStaffingRatio(shiftData.nurseToPatientRatio)}</div>
                      </div>
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-center">
                  <span className={`text-xs font-bold ${
                    dept.coveragePercentage >= 95 ? 'text-emerald-600' : dept.coveragePercentage >= 85 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {dept.coveragePercentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hoveredCell && (() => {
        const dept = departments.find((d) => d.departmentId === hoveredCell.deptId);
        const shiftData = dept?.shifts.find((s) => s.shiftType === hoveredCell.shift);
        if (!shiftData) return null;
        return <HeatMapTooltip shiftData={shiftData} deptName={dept!.departmentName} x={hoveredCell.x} y={hoveredCell.y} />;
      })()}
    </div>
  );
}
