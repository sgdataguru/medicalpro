'use client';

import type {
  Recommendation,
  SimulationPreviewData,
} from '@/lib/recommendations/recommendations.types';
import {
  MODULE_CONFIG,
  URGENCY_CONFIG,
  PRIORITY_CONFIG,
} from '@/lib/recommendations/recommendations.constants';
import {
  formatImpactDelta,
  formatUrgencyDeadline,
  formatRecommendationDate,
  formatConfidence,
} from '@/lib/recommendations/recommendations.utils';
import PriorityBadge from './PriorityBadge';
import DetailReasoning from './DetailReasoning';
import SupportingDataTable from './SupportingDataTable';
import RecommendationActions from './RecommendationActions';

interface RecommendationDetailProps {
  recommendation: Recommendation | null;
  relatedRecommendations: Recommendation[];
  simulationPreview: SimulationPreviewData | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDismiss: (id: string) => void;
  fullPage?: boolean;
}

export default function RecommendationDetail({
  recommendation,
  relatedRecommendations,
  simulationPreview,
  isLoading,
  isOpen,
  onClose,
  onAccept,
  onDefer,
  onDismiss,
  fullPage = false,
}: RecommendationDetailProps) {
  // Not open — render nothing
  if (!isOpen) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className={fullPage ? 'w-full' : 'w-full max-w-xl'}>
        <div className="rounded-2xl border border-outline-variant bg-surface p-6">
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-secondary">
              progress_activity
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state — open but no recommendation
  if (!recommendation) {
    return (
      <div className={fullPage ? 'w-full' : 'w-full max-w-xl'}>
        <div className="rounded-2xl border border-outline-variant bg-surface p-6">
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant">
              info
            </span>
            <p className="text-sm text-on-surface-variant">
              No recommendation selected
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const moduleConfig = MODULE_CONFIG[recommendation.module];
  const urgencyConfig = URGENCY_CONFIG[recommendation.urgency.level];
  const priorityConfig = PRIORITY_CONFIG[recommendation.priority.level];

  return (
    <div className={fullPage ? 'w-full' : 'w-full max-w-xl'}>
      <div className="rounded-2xl border border-outline-variant bg-surface">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-outline-variant p-6">
          <div className="flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge level={recommendation.priority.level} />
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${moduleConfig.bgClass}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {moduleConfig.icon}
                </span>
                {moduleConfig.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${urgencyConfig.bgClass}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {urgencyConfig.icon}
                </span>
                {urgencyConfig.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="mt-3 font-headline text-lg font-semibold text-on-surface">
              {recommendation.title}
            </h2>

            {/* Action Summary */}
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              {recommendation.actionSummary}
            </p>

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                {formatRecommendationDate(recommendation.generatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">speed</span>
                Confidence: {formatConfidence(recommendation.confidenceScore)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {formatUrgencyDeadline(recommendation.urgency)}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container"
            aria-label="Close detail panel"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          {/* Detailed Reasoning */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Detailed Reasoning
            </h3>
            <DetailReasoning reasoning={recommendation.detailedReasoning} />
          </section>

          {/* Supporting Data */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">database</span>
              Supporting Data
            </h3>
            <SupportingDataTable dataBasis={recommendation.dataBasis} />
          </section>

          {/* Impact Projections */}
          {recommendation.expectedImpacts.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">trending_up</span>
                Impact Projections
              </h3>
              <div className="rounded-xl border border-outline-variant">
                {recommendation.expectedImpacts.map((impact, index) => {
                  const isPositive = impact.direction === 'positive';
                  const isNegative = impact.direction === 'negative';
                  const barWidth = Math.min(
                    100,
                    Math.abs(impact.deltaPercentage)
                  );

                  return (
                    <div
                      key={impact.metricName}
                      className={`flex items-center gap-4 px-4 py-3 ${
                        index < recommendation.expectedImpacts.length - 1
                          ? 'border-b border-outline-variant'
                          : ''
                      }`}
                    >
                      <div className="w-36 shrink-0">
                        <p className="text-sm font-medium text-on-surface">
                          {impact.displayName}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {impact.timeToImpact}
                        </p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-outline-variant/30">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isPositive
                                ? 'bg-on-tertiary-container'
                                : isNegative
                                ? 'bg-error'
                                : 'bg-outline-variant'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 shrink-0 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            isPositive
                              ? 'text-on-tertiary-container'
                              : isNegative
                              ? 'text-error'
                              : 'text-on-surface-variant'
                          }`}
                        >
                          {formatImpactDelta(impact)}
                        </span>
                      </div>
                      <div className="w-12 shrink-0 text-right">
                        <span className="text-xs text-on-surface-variant">
                          {formatConfidence(impact.confidence)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Simulation Preview */}
          {simulationPreview && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">science</span>
                Simulation Preview
              </h3>
              <div className="rounded-xl border border-outline-variant bg-surface-container/30 p-4">
                <p className="text-sm leading-relaxed text-on-surface">
                  {simulationPreview.summary}
                </p>
                {simulationPreview.keyMetrics.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {simulationPreview.keyMetrics.map((metric) => (
                      <div
                        key={metric.name}
                        className="rounded-lg border border-outline-variant bg-surface p-3 text-center"
                      >
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                          {metric.name}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-on-surface">
                          {metric.value}
                          <span className="ml-0.5 text-xs font-normal text-on-surface-variant">
                            {metric.unit}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Related Recommendations */}
          {relatedRecommendations.length > 0 && (
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">link</span>
                Related Recommendations
              </h3>
              <div className="space-y-2">
                {relatedRecommendations.map((related) => {
                  const relModule = MODULE_CONFIG[related.module];
                  return (
                    <div
                      key={related.id}
                      className="flex items-center gap-3 rounded-xl border border-outline-variant px-4 py-3 transition-colors hover:bg-surface-container/50"
                    >
                      <span
                        className={`inline-flex items-center justify-center rounded-full p-1.5 ${relModule.bgClass}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {relModule.icon}
                        </span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-on-surface">
                          {related.title}
                        </p>
                        <p className="truncate text-xs text-on-surface-variant">
                          {related.actionSummary}
                        </p>
                      </div>
                      <PriorityBadge level={related.priority.level} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Action Buttons — only when active */}
        {recommendation.status === 'active' && (
          <div className="border-t border-outline-variant px-6 py-4">
            <RecommendationActions
              recommendationId={recommendation.id}
              onAccept={onAccept}
              onDefer={onDefer}
              onDismiss={onDismiss}
            />
          </div>
        )}
      </div>
    </div>
  );
}
