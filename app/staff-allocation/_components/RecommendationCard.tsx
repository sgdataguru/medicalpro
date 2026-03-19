'use client';

import type { StaffingRecommendation } from '@/lib/staff-allocation/staff-allocation.types';
import { PRIORITY_COLORS, RECOMMENDATION_TYPE_LABELS, SHIFT_DEFINITIONS, ROLE_DISPLAY_MAP } from '@/lib/staff-allocation/staff-allocation.constants';
import { formatCurrency, formatStaffingRatio } from '@/lib/staff-allocation/staff-allocation.utils';

interface RecommendationCardProps {
  recommendation: StaffingRecommendation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isPending: boolean;
}

export default function RecommendationCard({ recommendation: rec, onAccept, onReject, isPending }: RecommendationCardProps) {
  const priorityStyle = PRIORITY_COLORS[rec.priority] ?? PRIORITY_COLORS.LOW;
  const shiftLabel = SHIFT_DEFINITIONS[rec.shiftType]?.label ?? rec.shiftType;

  return (
    <div className={`rounded-lg border p-4 ${priorityStyle.border} ${priorityStyle.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${priorityStyle.bg} ${priorityStyle.text} border ${priorityStyle.border}`}>
              {rec.priority}
            </span>
            <span className="text-[10px] font-semibold text-on-primary-container">
              {RECOMMENDATION_TYPE_LABELS[rec.type] ?? rec.type}
            </span>
          </div>
          <p className="text-sm font-semibold text-on-surface">{rec.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant">
        <span>{rec.departmentName} · {shiftLabel} · {ROLE_DISPLAY_MAP[rec.role] ?? rec.role}</span>
        <span className="font-bold text-emerald-600">-{formatCurrency(rec.projectedOvertimeSavings)} overtime</span>
        <span>Ratio: {formatStaffingRatio(rec.ratioImpact.before)} → {formatStaffingRatio(rec.ratioImpact.after)}</span>
      </div>

      {rec.constraints.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {rec.constraints.map((c, i) => (
            <span key={i} className="px-2 py-0.5 text-[10px] bg-white/60 text-on-surface-variant rounded-full">
              {c}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onAccept(rec.recommendationId)}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Accept
        </button>
        <button
          onClick={() => onReject(rec.recommendationId)}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
