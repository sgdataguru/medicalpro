'use client';

import { useEffect } from 'react';
import { useRecommendations } from '../_hooks/useRecommendations';
import RecommendationCard from '../_components/RecommendationCard';

export default function RecommendationHistoryPage() {
  const { state, loadRecommendations, updateFilters } = useRecommendations();

  useEffect(() => {
    updateFilters({ status: ['accepted', 'deferred', 'dismissed', 'expired'] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.filters.status.length > 1) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.filters.status]);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-2xl text-on-surface-variant">history</span>
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
            Recommendation History
          </h1>
        </div>
        <p className="text-sm text-on-surface-variant">
          View all past recommendations and their outcomes.
        </p>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['accepted', 'deferred', 'dismissed', 'expired'] as const).map((status) => {
          const count = state.recommendations.filter((r) => r.status === status).length;
          return (
            <div
              key={status}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-4"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-on-primary-container mb-1">
                {status}
              </p>
              <p className="text-2xl font-headline font-extrabold text-on-surface">{count}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {state.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : state.recommendations.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
            history
          </span>
          <p className="text-lg font-headline font-semibold text-on-surface mb-1">
            No recommendation history
          </p>
          <p className="text-sm text-on-surface-variant">
            Completed recommendations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.recommendations.map((rec) => (
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
