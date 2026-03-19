'use client';

import type { AnomalyAlert } from '@/lib/anomaly/anomaly.types';
import AnomalyFeedCard from './AnomalyFeedCard';

interface AnomalyFeedPanelProps {
  alerts: AnomalyAlert[];
  activeId: string | null;
  onSelect: (id: string) => void;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
}

export default function AnomalyFeedPanel({
  alerts,
  activeId,
  onSelect,
  hasMore,
  onLoadMore,
  isLoading,
}: AnomalyFeedPanelProps) {
  if (alerts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-headline text-lg font-semibold text-on-surface mb-1">
          All Clear
        </h3>
        <p className="text-sm text-on-surface-variant max-w-sm">
          No active anomalies detected. System is operating within normal parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AnomalyFeedCard
          key={alert.id}
          alert={alert}
          isActive={alert.id === activeId}
          onClick={() => onSelect(alert.id)}
        />
      ))}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface-container-lowest rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      {hasMore && !isLoading && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 text-sm font-medium text-secondary-container hover:text-secondary-container/80 transition-colors"
        >
          Load more anomalies...
        </button>
      )}
    </div>
  );
}
