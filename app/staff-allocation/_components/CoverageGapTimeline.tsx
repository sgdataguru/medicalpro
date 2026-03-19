'use client';

import type { CoverageGap } from '@/lib/staff-allocation/staff-allocation.types';
import { GAP_SEVERITY_COLORS, SHIFT_DEFINITIONS, ROLE_DISPLAY_MAP } from '@/lib/staff-allocation/staff-allocation.constants';
import { formatHoursUntil } from '@/lib/staff-allocation/staff-allocation.utils';

interface CoverageGapTimelineProps {
  gaps: CoverageGap[];
}

export default function CoverageGapTimeline({ gaps }: CoverageGapTimelineProps) {
  if (gaps.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <span className="material-symbols-outlined text-[32px] text-emerald-500 block mb-2">check_circle</span>
          <p className="text-sm text-on-surface-variant">No coverage gaps detected in the next 72 hours.</p>
        </div>
      </div>
    );
  }

  const criticalCount = gaps.filter((g) => g.severity === 'CRITICAL').length;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">timeline</span>
          <h3 className="font-headline text-sm font-bold text-on-surface">Coverage Gap Timeline</h3>
        </div>
        {criticalCount > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {criticalCount} Critical
          </span>
        )}
      </div>

      <div className="space-y-3">
        {gaps.map((gap) => {
          const style = GAP_SEVERITY_COLORS[gap.severity] ?? GAP_SEVERITY_COLORS.INFO;
          const shiftLabel = SHIFT_DEFINITIONS[gap.shiftType]?.label ?? gap.shiftType;
          return (
            <div key={gap.gapId} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${style.bg}`}>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.dot} ${gap.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${style.text}`}>{gap.departmentName}</span>
                  <span className="text-[10px] text-on-surface-variant">
                    {shiftLabel} · {ROLE_DISPLAY_MAP[gap.role] ?? gap.role}
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">
                  Shortfall of {gap.staffShortfall} staff · {gap.date}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-xs font-bold ${style.text}`}>
                  {formatHoursUntil(gap.hoursUntilShift)}
                </div>
                <div className="text-[10px] text-on-surface-variant">until shift</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
