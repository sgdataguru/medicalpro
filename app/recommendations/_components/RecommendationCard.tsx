'use client';

import type { Recommendation } from '@/lib/recommendations/recommendations.types';
import {
  PRIORITY_CONFIG,
  MODULE_CONFIG,
  OUTCOME_COLORS,
} from '@/lib/recommendations/recommendations.constants';
import { formatDataBasis } from '@/lib/recommendations/recommendations.utils';

import PriorityBadge from './PriorityBadge';
import UrgencyIndicator from './UrgencyIndicator';
import ExpectedImpactList from './ExpectedImpactList';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isSelected: boolean;
  onSelect: (rec: Recommendation) => void;
  onAccept?: (id: string) => void;
  onDefer?: (id: string) => void;
  onDismiss?: (id: string) => void;
  showOutcome?: boolean;
}

export default function RecommendationCard({
  recommendation: rec,
  isSelected,
  onSelect,
  onAccept,
  onDefer,
  onDismiss,
  showOutcome = false,
}: RecommendationCardProps) {
  const priorityConfig = PRIORITY_CONFIG[rec.priority.level];
  const moduleConfig = MODULE_CONFIG[rec.module];

  const outcomeResult = rec.action?.outcome?.overallResult ?? null;
  const outcomeColor = outcomeResult ? OUTCOME_COLORS[outcomeResult] : null;
  const outcomeLabel = outcomeResult
    ? outcomeResult.charAt(0).toUpperCase() + outcomeResult.slice(1)
    : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(rec)}
      className={`w-full text-left rounded-xl border border-outline-variant/15 bg-surface transition-all duration-150 hover:shadow-md ${priorityConfig.borderClass} ${
        isSelected
          ? 'ring-2 ring-secondary shadow-md'
          : 'hover:border-outline-variant/30'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header: badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge level={rec.priority.level} />
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${moduleConfig.bgClass}`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {moduleConfig.icon}
            </span>
            {moduleConfig.label}
          </span>
          <UrgencyIndicator urgency={rec.urgency} />
        </div>

        {/* Title */}
        <h3 className="font-headline font-semibold text-sm text-on-surface leading-tight">
          {rec.title}
        </h3>

        {/* Action summary */}
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
          {rec.actionSummary}
        </p>

        {/* Expected impacts */}
        {rec.expectedImpacts.length > 0 && (
          <ExpectedImpactList impacts={rec.expectedImpacts} maxItems={3} />
        )}

        {/* Confidence */}
        <div className="flex items-center gap-1.5 text-[11px] text-on-primary-container">
          <span className="material-symbols-outlined text-[14px]">
            verified
          </span>
          <span>{rec.confidenceScore}% confidence</span>
        </div>

        {/* Outcome badge (when showOutcome is true and action has outcome) */}
        {showOutcome && outcomeResult && outcomeColor && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white"
              style={{ backgroundColor: outcomeColor }}
            >
              {outcomeResult === 'positive' && (
                <span className="material-symbols-outlined text-[12px]">
                  check_circle
                </span>
              )}
              {outcomeResult === 'negative' && (
                <span className="material-symbols-outlined text-[12px]">
                  error
                </span>
              )}
              {outcomeResult === 'neutral' && (
                <span className="material-symbols-outlined text-[12px]">
                  remove_circle
                </span>
              )}
              {outcomeLabel}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
          {/* Data basis compact */}
          <p className="text-[10px] text-on-primary-container truncate max-w-[60%]">
            {formatDataBasis(rec.dataBasis)}
          </p>

          {/* Action buttons — only when status is active */}
          {rec.status === 'active' && (
            <div className="flex items-center gap-1">
              {onAccept && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(rec.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onAccept(rec.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-on-tertiary-container/10 text-on-tertiary-container hover:bg-on-tertiary-container/20 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    check
                  </span>
                  Accept
                </span>
              )}
              {onDefer && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDefer(rec.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onDefer(rec.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-warning/10 text-amber-700 hover:bg-warning/20 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    schedule
                  </span>
                  Defer
                </span>
              )}
              {onDismiss && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(rec.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onDismiss(rec.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-on-surface-variant hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    close
                  </span>
                  Dismiss
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
