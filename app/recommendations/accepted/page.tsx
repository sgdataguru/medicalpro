'use client';

import { useEffect } from 'react';
import { useRecommendations } from '../_hooks/useRecommendations';
import RecommendationCard from '../_components/RecommendationCard';
import { STATUS_CONFIG } from '@/lib/recommendations/recommendations.constants';

export default function AcceptedRecommendationsPage() {
  const { state, loadRecommendations, updateFilters } = useRecommendations();

  useEffect(() => {
    updateFilters({ status: ['accepted'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.filters.status.includes('accepted')) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters.status]);

  const acceptedRecs = state.recommendations.filter((r) => r.status === 'accepted');

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-on-tertiary-container">
            {STATUS_CONFIG.accepted.icon}
          </span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Accepted Recommendations
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          Track implementation progress and outcomes for accepted recommendations.
        </p>
      </div>

      {/* List */}
      {state.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : acceptedRecs.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            check_circle
          </span>
          <p className="text-lg font-headline font-semibold text-on-surface mb-1">
            No accepted recommendations
          </p>
          <p className="text-sm text-on-surface-variant">
            Accept recommendations from the dashboard to track them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {acceptedRecs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              isSelected={false}
              onSelect={() => {}}
              showOutcome
            />
          ))}
        </div>
      )}
    </div>
  );
}
