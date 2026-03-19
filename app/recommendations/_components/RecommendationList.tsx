'use client';

import type { Recommendation } from '@/lib/recommendations/recommendations.types';
import RecommendationCard from './RecommendationCard';

interface RecommendationListProps {
  recommendations: Recommendation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (rec: Recommendation) => void;
  onAccept: (id: string) => void;
  onDefer: (id: string) => void;
  onDismiss: (id: string) => void;
}

/** Skeleton placeholder while loading */
function CardSkeleton() {
  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface p-4 space-y-3 animate-pulse">
      {/* Badge row */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-full bg-outline-variant/20" />
        <div className="h-4 w-20 rounded-lg bg-outline-variant/20" />
        <div className="h-4 w-24 rounded-lg bg-outline-variant/20" />
      </div>
      {/* Title */}
      <div className="h-4 w-3/4 rounded bg-outline-variant/20" />
      {/* Summary */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-outline-variant/15" />
        <div className="h-3 w-5/6 rounded bg-outline-variant/15" />
      </div>
      {/* Impact rows */}
      <div className="space-y-1.5">
        <div className="h-3 w-2/3 rounded bg-outline-variant/15" />
        <div className="h-3 w-1/2 rounded bg-outline-variant/15" />
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
        <div className="h-3 w-40 rounded bg-outline-variant/15" />
        <div className="flex gap-1">
          <div className="h-6 w-16 rounded-lg bg-outline-variant/15" />
          <div className="h-6 w-14 rounded-lg bg-outline-variant/15" />
          <div className="h-6 w-16 rounded-lg bg-outline-variant/15" />
        </div>
      </div>
    </div>
  );
}

export default function RecommendationList({
  recommendations,
  selectedId,
  isLoading,
  onSelect,
  onAccept,
  onDefer,
  onDismiss,
}: RecommendationListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border border-outline-variant/15 bg-surface">
        <span className="material-symbols-outlined text-[48px] text-outline-variant mb-3">
          inbox
        </span>
        <h3 className="font-headline font-semibold text-on-surface text-base mb-1">
          No recommendations
        </h3>
        <p className="text-sm text-on-surface-variant text-center max-w-xs">
          There are no recommendations matching your current filters. Try
          adjusting the filters or check back later.
        </p>
      </div>
    );
  }

  // Recommendation cards
  return (
    <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          isSelected={rec.id === selectedId}
          onSelect={onSelect}
          onAccept={onAccept}
          onDefer={onDefer}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
