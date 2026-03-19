'use client';

import type { FeedbackRating } from '@/lib/analytics-query/analytics-query.types';

interface ResponseFeedbackProps {
  queryId: string;
  hasRated: boolean;
  currentRating: FeedbackRating | null;
  onRate: (queryId: string, rating: FeedbackRating, comment?: string) => void;
}

export default function ResponseFeedback({
  queryId,
  hasRated,
  currentRating,
  onRate,
}: ResponseFeedbackProps) {
  if (hasRated) {
    return (
      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">
          {currentRating === 'helpful' ? 'thumb_up' : 'thumb_down'}
        </span>
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant">Was this helpful?</span>
      <button
        onClick={() => onRate(queryId, 'helpful')}
        className="p-1 rounded-lg text-on-surface-variant hover:bg-on-tertiary-container/10 hover:text-on-tertiary-container transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">thumb_up</span>
      </button>
      <button
        onClick={() => onRate(queryId, 'not_helpful')}
        className="p-1 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">thumb_down</span>
      </button>
    </div>
  );
}
