'use client';

import { useRecommendationOutcomes } from '../_hooks/useRecommendationOutcomes';
import OutcomeSummaryCards from '../_components/OutcomeSummaryCards';
import OutcomeTrendChart from '../_components/OutcomeTrendChart';
import AcceptanceRateChart from '../_components/AcceptanceRateChart';

export default function OutcomesPage() {
  const { summary, trends, isLoading } = useRecommendationOutcomes();

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-72 bg-surface-container-high rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-surface-container-high rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-on-tertiary-container">
            analytics
          </span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Recommendation Outcomes
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Track success rates, financial impact, and recommendation accuracy over time.
        </p>
      </div>

      {/* Summary cards */}
      {summary && <OutcomeSummaryCards summary={summary} />}

      {/* Trend chart */}
      <OutcomeTrendChart trends={trends} />

      {/* Acceptance rate chart */}
      <AcceptanceRateChart />
    </div>
  );
}
